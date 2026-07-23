import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const failures = [];

function walk(directory, extensions = null) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(target, extensions);
    return !extensions || extensions.has(extname(entry.name)) ? [target] : [];
  });
}

const backendFiles = walk(join(root, 'backend'), new Set(['.js']));
for (const file of backendFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) failures.push(`JavaScript syntax error: ${file}\n${result.stderr.trim()}`);
}

const importPattern = /(?:from\s+|import\s*\()\s*["'](\.[^"']+)["']/g;
for (const file of [...backendFiles, ...walk(join(root, 'frontend', 'src'), new Set(['.js', '.jsx']))]) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1].split('?')[0];
    const base = resolve(dirname(file), specifier);
    const candidates = [base, `${base}.js`, `${base}.jsx`, join(base, 'index.js'), join(base, 'index.jsx')];
    if (!candidates.some(existsSync)) failures.push(`Missing relative import: ${file} -> ${specifier}`);
  }
}

const schemaPath = join(root, 'backend', 'prisma', 'schema.prisma');
const schema = readFileSync(schemaPath, 'utf8');
for (const match of schema.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\n\}/g)) {
  const fields = new Set();
  for (const line of match[2].split('\n')) {
    const field = line.trim().match(/^(\w+)\s+/)?.[1];
    if (!field || field.startsWith('@@')) continue;
    if (fields.has(field)) failures.push(`Duplicate Prisma field: ${match[1]}.${field}`);
    fields.add(field);
  }
}

const sensitiveFiles = [
  ...walk(join(root, 'backend', 'src'), new Set(['.js'])),
  ...walk(join(root, 'frontend', 'src'), new Set(['.js', '.jsx'])),
];
const secretPattern = /(?:PAYOS_API_KEY|PAYOS_CHECKSUM_KEY|SMTP_PASSWORD|JWT_ACCESS_SECRET|JWT_REFRESH_SECRET)\s*[:=]\s*["'][^"'$<{\s][^"']{8,}["']/;
for (const file of sensitiveFiles) {
  const source = readFileSync(file, 'utf8');
  if (secretPattern.test(source)) failures.push(`Possible hard-coded secret: ${file}`);
  if (file.includes(`${join('backend', 'src')}`) && /console\.(?:log|error|warn|debug)\s*\(/.test(source)) {
    failures.push(`Use structured logger instead of console in backend: ${file}`);
  }
}

const required = [
  'backend/.env.example',
  'frontend/.env.example',
  'backend/src/modules/payments/payos.signature.js',
  'backend/src/modules/otp/otp.service.js',
  'backend/src/middlewares/partnerAccess.middleware.js',
  'sonar-project.properties',
];
for (const relative of required) {
  const file = join(root, relative);
  if (!existsSync(file) || statSync(file).size === 0) failures.push(`Missing required file: ${relative}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Static quality checks passed: ${backendFiles.length} backend JS files, Prisma schema and relative imports verified.`);
