import { spawn, execSync } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import fs from 'node:fs';
import { platform } from 'node:os';

const root = path.resolve(import.meta.dirname, '..');
const DB_CONTAINER_NAME = 'vivouch_e2e_db_' + Date.now();
const DB_PORT = 5433;
const BACKEND_PORT = 5001;
const FRONTEND_PORT = 5174;
const DATABASE_URL = `postgresql://postgres:postgres@localhost:${DB_PORT}/voucher_e2e?schema=public`;

let backendProcess, frontendProcess;
let isCleaningUp = false;

// Store logs to dump on failure (Max 2000 lines ring buffer)
const MAX_LOG_LINES = 2000;
const backendLogs = [];
const frontendLogs = [];

const log = (msg) => console.log(`[E2E-RUNNER] ${msg}`);
const err = (msg) => console.error(`[E2E-RUNNER] ERROR: ${msg}`);

async function waitForPort(port, host = 'localhost', timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.on('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.on('timeout', () => {
        socket.destroy();
        retry();
      });
      socket.on('error', () => {
        socket.destroy();
        retry();
      });
      socket.connect(port, host);
    };

    const retry = () => {
      if (Date.now() - start > timeout) {
        reject(new Error(`Timeout waiting for port ${port}`));
      } else {
        setTimeout(tryConnect, 1000);
      }
    };

    tryConnect();
  });
}

async function waitForPostgresReady(containerName, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      execSync(`docker exec ${containerName} pg_isready -U postgres`, { stdio: 'ignore' });
      return; // Ready
    } catch (e) {
      // Not ready yet, wait 1 second
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  throw new Error(`Postgres container ${containerName} failed to become ready after ${maxAttempts} attempts.`);
}

function captureLog(logsArray, prefix, data) {
  const str = data.toString();
  process.stdout.write(`[${prefix}] ${str}`);
  
  // Split by lines to manage count properly, though appending raw strings is okay for simple buffers
  logsArray.push(str);
  if (logsArray.length > MAX_LOG_LINES) {
    logsArray.shift();
  }
}

function killProcessTree(proc) {
  if (!proc || proc.killed) return;
  const pid = proc.pid;
  try {
    if (platform() === 'win32') {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      // A robust fallback for unix if tree-kill is not available (killing the process group)
      // Note: This requires the process to be spawned with detached: true to have its own pgid
      // For simplicity without detached: true, we just kill the direct child.
      // To properly kill the tree on Unix without packages, pkill -P is often used.
      try {
        execSync(`pkill -P ${pid}`, { stdio: 'ignore' });
      } catch (e) {} // ignore if pkill fails
      proc.kill('SIGKILL');
    }
  } catch (e) {
    // Fallback if taskkill fails
    proc.kill('SIGKILL');
  }
}

async function cleanup(exitCode = 0) {
  if (isCleaningUp) return;
  isCleaningUp = true;
  log('Starting cleanup...');

  if (exitCode !== 0) {
    log('Dumping captured logs to e2e-failure-log.txt...');
    const logContent = `\n\n--- BACKEND LOGS ---\n${backendLogs.join('')}\n\n--- FRONTEND LOGS ---\n${frontendLogs.join('')}\n`;
    fs.writeFileSync(path.join(root, 'e2e-failure-log.txt'), logContent, 'utf-8');
  }
  
  if (frontendProcess) {
    log('Killing frontend process tree...');
    killProcessTree(frontendProcess);
  }
  if (backendProcess) {
    log('Killing backend process tree...');
    killProcessTree(backendProcess);
  }

  try {
    log('Stopping docker container ' + DB_CONTAINER_NAME);
    execSync(`docker stop ${DB_CONTAINER_NAME}`, { stdio: 'ignore' });
  } catch (e) {
    // Ignore error if container already stopped or doesn't exist
  }
  
  log('Cleanup finished.');
  process.exit(exitCode);
}

process.on('SIGINT', () => cleanup(1));
process.on('SIGTERM', () => cleanup(1));
process.on('uncaughtException', (e) => {
  err(e.message);
  cleanup(1);
});

function handleProcessExit(procName, code) {
  if (!isCleaningUp && code !== 0 && code !== null) {
    err(`${procName} exited unexpectedly with code ${code}. Aborting E2E run.`);
    cleanup(1);
  }
}

async function main() {
  const e2eCommand = process.argv.slice(2).join(' ');

  try {
    // 1. Start Database
    log('Starting Postgres container...');
    execSync(
      `docker run --rm -d --name ${DB_CONTAINER_NAME} -p ${DB_PORT}:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=voucher_e2e postgres:16-alpine`,
      { stdio: 'inherit' }
    );
    
    log(`Waiting for DB to be ready...`);
    await waitForPostgresReady(DB_CONTAINER_NAME, 30);

    // 2. Run Migrations & Seeding
    log('Running Prisma migrations and seeding...');
    const prismaEnv = { ...process.env, DATABASE_URL };
    const execOpts = { cwd: path.join(root, 'backend'), env: prismaEnv, stdio: 'inherit' };
    
    execSync('npx prisma migrate deploy', execOpts);
    execSync('npm run prisma:seed', execOpts);

    // 3. Start Backend
    log('Starting Backend...');
    const backendEnv = {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URL,
      PORT: BACKEND_PORT,
      EMAIL_DELIVERY_MODE: 'TEST',
      JWT_ACCESS_SECRET: 'e2e_access_secret_at_least_32_characters',
      JWT_REFRESH_SECRET: 'e2e_refresh_secret_at_least_32_characters',
      ENABLE_VOUCHER_RECONCILIATION_JOB: 'false',
      ENABLE_EMAIL_WORKER: 'false'
    };
    backendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(root, 'backend'),
      env: backendEnv,
      shell: true,
      stdio: 'pipe'
    });
    
    backendProcess.stdout.on('data', d => captureLog(backendLogs, 'BACKEND', d));
    backendProcess.stderr.on('data', d => captureLog(backendLogs, 'BACKEND', d));
    backendProcess.on('exit', (code) => handleProcessExit('Backend', code));

    log(`Waiting for Backend on port ${BACKEND_PORT}...`);
    await waitForPort(BACKEND_PORT, 'localhost', 30000);
    await new Promise(res => setTimeout(res, 1000));

    // 4. Start Frontend
    log('Starting Frontend...');
    const frontendEnv = {
      ...process.env,
      VITE_API_BASE_URL: `http://localhost:${BACKEND_PORT}/api`
    };
    frontendProcess = spawn('npm', ['run', 'dev', '--', '--port', FRONTEND_PORT], {
      cwd: path.join(root, 'frontend'),
      env: frontendEnv,
      shell: true,
      stdio: 'pipe'
    });
    
    frontendProcess.stdout.on('data', d => captureLog(frontendLogs, 'FRONTEND', d));
    frontendProcess.stderr.on('data', d => captureLog(frontendLogs, 'FRONTEND', d));
    frontendProcess.on('exit', (code) => handleProcessExit('Frontend', code));

    log(`Waiting for Frontend on port ${FRONTEND_PORT}...`);
    await waitForPort(FRONTEND_PORT, 'localhost', 30000);

    // 5. Run E2E Command
    if (!e2eCommand) {
      log('No E2E test command provided. Runner successfully started everything and will now exit.');
      await cleanup(0);
      return;
    }

    log(`Starting E2E test command: ${e2eCommand}...`);
    const e2eEnv = {
      ...process.env,
      BASE_URL: `http://localhost:${FRONTEND_PORT}`,
      API_URL: `http://localhost:${BACKEND_PORT}/api`
    };
    
    execSync(e2eCommand, {
      cwd: root,
      env: e2eEnv,
      stdio: 'inherit',
      shell: true
    });

    log('E2E tests passed successfully!');
    await cleanup(0);
  } catch (error) {
    err(`E2E flow failed: ${error.message}`);
    await cleanup(1);
  }
}

main();
