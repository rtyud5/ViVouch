import test from 'node:test';
import assert from 'node:assert/strict';
import { requestContextMiddleware, getRequestContext } from '../src/middlewares/requestContext.middleware.js';

test('request context accepts safe correlation id and exposes it on request and response', async () => {
  const headers = new Map();
  const req = {
    ip: '127.0.0.1',
    socket: {},
    get(name) {
      if (name === 'x-request-id') return 'request-id-1234';
      if (name === 'user-agent') return 'node-test';
      return undefined;
    },
  };
  const res = { setHeader(name, value) { headers.set(name, value); } };
  await new Promise((resolve) => requestContextMiddleware(req, res, () => {
    assert.equal(getRequestContext().requestId, 'request-id-1234');
    resolve();
  }));
  assert.equal(req.requestId, 'request-id-1234');
  assert.equal(headers.get('x-request-id'), 'request-id-1234');
});

test('request context rejects unsafe user supplied ids', async () => {
  const req = { socket: {}, get: () => 'bad id with spaces' };
  const res = { setHeader() {} };
  await new Promise((resolve) => requestContextMiddleware(req, res, resolve));
  assert.match(req.requestId, /^[a-f0-9-]{36}$/i);
});
