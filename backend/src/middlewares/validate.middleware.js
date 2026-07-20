/**
 * Reusable Zod request validator. Each supplied schema is optional and parsed
 * data replaces the corresponding request property so controllers consume
 * normalized values (for example coerced page numbers).
 */
export function validate({ body, query, params } = {}) {
  return async function validateRequest(req, _res, next) {
    try {
      if (body) req.body = await body.parseAsync(req.body);
      if (query) req.query = await query.parseAsync(req.query);
      if (params) req.params = await params.parseAsync(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
}
