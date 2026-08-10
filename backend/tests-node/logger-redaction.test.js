import test from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import pino from 'pino';

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'password',
  'passwordHash',
  'otp',
  'codeHash',
  'SMTP_PASSWORD',
  'PAYOS_API_KEY',
  'PAYOS_CHECKSUM_KEY',
  '*.password',
  '*.passwordHash',
  '*.otp',
  'token',
  'refreshToken',
  'accessToken',
  '*.token',
  '*.refreshToken',
  '*.accessToken',
  'email',
  'recipient',
  '*.email',
  '*.recipient',
];

function captureLogger() {
  const lines = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(chunk.toString());
      cb();
    },
  });
  const log = pino({ redact: { paths: REDACT_PATHS, censor: '[REDACTED]' } }, stream);
  return { log, lines };
}

test('structured logger redacts password, token, and email fields', () => {
  const { log, lines } = captureLogger();
  log.info({
    password: 'SecretPass123!',
    passwordHash: '$2b$10$hash',
    token: 'jwt-access-token',
    refreshToken: 'jwt-refresh-token',
    email: 'customer@example.com',
    recipient: 'gift@example.com',
    req: { headers: { authorization: 'Bearer secret', cookie: 'sid=abc' } },
  }, 'sample request');

  const output = lines.join('');
  assert.doesNotMatch(output, /SecretPass123!/);
  assert.doesNotMatch(output, /\$2b\$10\$hash/);
  assert.doesNotMatch(output, /jwt-access-token/);
  assert.doesNotMatch(output, /customer@example\.com/);
  assert.match(output, /\[REDACTED\]/);
});

test('error responses expose requestId without leaking credentials', async () => {
  const { default: express } = await import('express');
  const { default: request } = await import('supertest');
  const { requestContextMiddleware } = await import('../src/middlewares/requestContext.middleware.js');
  const { errorMiddleware } = await import('../src/middlewares/error.middleware.js');
  const { AppError } = await import('../src/utils/appError.js');

  const app = express();
  app.use(express.json());
  app.use(requestContextMiddleware);
  app.post('/probe', (_req, _res, next) => next(new AppError('Invalid credentials', 401, 'AUTH_FAILED')));
  app.use(errorMiddleware);

  const res = await request(app)
    .post('/probe')
    .set('Authorization', 'Bearer super-secret-token')
    .set('X-Request-Id', 'w7d3-privacy-probe-001')
    .send({ email: 'leak@test.com', password: 'LeakPass!' });

  assert.equal(res.status, 401);
  assert.equal(res.headers['x-request-id'], 'w7d3-privacy-probe-001');
  assert.equal(res.body.requestId, 'w7d3-privacy-probe-001');
  assert.doesNotMatch(JSON.stringify(res.body), /super-secret-token/);
  assert.doesNotMatch(JSON.stringify(res.body), /LeakPass!/);
  assert.doesNotMatch(JSON.stringify(res.body), /leak@test\.com/);
});
