import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const requestContext = new AsyncLocalStorage();
const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{8,128}$/;

function resolveRequestId(req) {
  const candidate = req.get('x-request-id');
  return candidate && SAFE_REQUEST_ID.test(candidate) ? candidate : randomUUID();
}

export function requestContextMiddleware(req, res, next) {
  const requestId = resolveRequestId(req);
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  requestContext.run({
    requestId,
    ipAddress: req.ip || req.socket?.remoteAddress || null,
    userAgent: req.get('user-agent') || null,
  }, next);
}

export function getRequestContext() {
  return requestContext.getStore() || {};
}
