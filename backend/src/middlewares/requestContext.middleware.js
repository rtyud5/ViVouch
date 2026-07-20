import { AsyncLocalStorage } from 'node:async_hooks';

const requestContext = new AsyncLocalStorage();

export function requestContextMiddleware(req, res, next) {
  requestContext.run({
    ipAddress: req.ip || req.socket?.remoteAddress || null,
    userAgent: req.get('user-agent') || null,
  }, next);
}

export function getRequestContext() {
  return requestContext.getStore() || {};
}
