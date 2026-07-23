import net from 'node:net';
import tls from 'node:tls';
import crypto from 'node:crypto';
import { once } from 'node:events';
import { env } from '../../config/env.js';

const CRLF = '\r\n';

function sanitizeHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function encodeHeader(value) {
  const clean = sanitizeHeader(value);
  return /^[\x20-\x7E]*$/.test(clean)
    ? clean
    : `=?UTF-8?B?${Buffer.from(clean).toString('base64')}?=`;
}

class SmtpConnection {
  constructor(socket) {
    this.socket = socket;
    this.buffer = '';
    this.waiters = [];
    socket.setEncoding('utf8');
    socket.on('data', (chunk) => this.onData(chunk));
    socket.on('error', (error) => this.rejectWaiters(error));
    socket.on('close', () => this.rejectWaiters(new Error('SMTP connection closed')));
  }

  rejectWaiters(error) {
    while (this.waiters.length > 0) {
      this.waiters.shift().reject(error);
    }
  }

  onData(chunk) {
    this.buffer += chunk;
    while (this.waiters.length > 0) {
      const parsed = this.tryParseResponse();
      if (!parsed) return;
      this.waiters.shift().resolve(parsed);
    }
  }

  tryParseResponse() {
    const lines = this.buffer.split(CRLF);
    let end = -1;
    for (let i = 0; i < lines.length - 1; i += 1) {
      if (/^\d{3} /.test(lines[i])) {
        end = i;
        break;
      }
    }
    if (end < 0) return null;
    const responseLines = lines.slice(0, end + 1);
    this.buffer = lines.slice(end + 1).join(CRLF);
    const code = Number(responseLines.at(-1).slice(0, 3));
    return { code, message: responseLines.join('\n') };
  }

  read() {
    const parsed = this.tryParseResponse();
    if (parsed) return Promise.resolve(parsed);
    return new Promise((resolve, reject) => this.waiters.push({ resolve, reject }));
  }

  async command(command, acceptedCodes) {
    this.socket.write(`${command}${CRLF}`);
    const response = await this.read();
    if (!acceptedCodes.includes(response.code)) {
      throw new Error(`SMTP command failed (${response.code}): ${response.message}`);
    }
    return response;
  }
}

async function openSocket() {
  const options = { host: env.SMTP_HOST, port: env.SMTP_PORT, servername: env.SMTP_HOST };
  const socket = env.SMTP_SECURE ? tls.connect(options) : net.connect(options);
  await once(socket, env.SMTP_SECURE ? 'secureConnect' : 'connect');
  socket.setTimeout(15_000, () => socket.destroy(new Error('SMTP timeout')));
  return socket;
}

async function upgradeTls(connection) {
  connection.socket.removeAllListeners('data');
  const secureSocket = tls.connect({ socket: connection.socket, servername: env.SMTP_HOST });
  await once(secureSocket, 'secureConnect');
  return new SmtpConnection(secureSocket);
}

function buildMessage({ to, subject, text, html }) {
  const boundary = `vivouch-${Date.now().toString(36)}`;
  const from = `${encodeHeader(env.MAIL_FROM_NAME)} <${sanitizeHeader(env.MAIL_FROM_ADDRESS)}>`;
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const messageId = `<${Date.now()}.${randomSuffix}@vivouch.local>`;
  const headers = [
    `From: ${from}`,
    `To: ${sanitizeHeader(to)}`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  const body = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    text || '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    html || '',
    `--${boundary}--`,
    '',
  ].join(CRLF);
  return `${headers.join(CRLF)}${CRLF}${CRLF}${body}`.replace(/^\./gm, '..');
}

export async function sendSmtpEmail(message) {
  if (!env.SMTP_HOST || !env.MAIL_FROM_ADDRESS) {
    throw new Error('SMTP is not configured');
  }

  let connection = new SmtpConnection(await openSocket());
  try {
    const greeting = await connection.read();
    if (greeting.code !== 220) throw new Error(`SMTP greeting failed: ${greeting.message}`);
    let ehlo = await connection.command(`EHLO ${env.SMTP_EHLO_HOST}`, [250]);

    const supportsStartTls = ehlo.message.toUpperCase().includes('STARTTLS');
    if (!env.SMTP_SECURE && supportsStartTls) {
      await connection.command('STARTTLS', [220]);
      connection = await upgradeTls(connection);
      ehlo = await connection.command(`EHLO ${env.SMTP_EHLO_HOST}`, [250]);
    } else if (!env.SMTP_SECURE && env.SMTP_REQUIRE_TLS) {
      throw new Error('SMTP server does not advertise STARTTLS');
    }

    if (env.SMTP_USER) {
      await connection.command('AUTH LOGIN', [334]);
      await connection.command(Buffer.from(env.SMTP_USER).toString('base64'), [334]);
      await connection.command(Buffer.from(env.SMTP_PASSWORD).toString('base64'), [235]);
    }

    await connection.command(`MAIL FROM:<${sanitizeHeader(env.MAIL_FROM_ADDRESS)}>`, [250]);
    await connection.command(`RCPT TO:<${sanitizeHeader(message.to)}>`, [250, 251]);
    await connection.command('DATA', [354]);
    connection.socket.write(`${buildMessage(message)}${CRLF}.${CRLF}`);
    const result = await connection.read();
    if (result.code !== 250) throw new Error(`SMTP DATA failed: ${result.message}`);
    await connection.command('QUIT', [221]);
  } finally {
    if (!connection.socket.destroyed) connection.socket.end();
  }
}
