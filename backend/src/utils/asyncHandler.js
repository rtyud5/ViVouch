export function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Handle ZodError before passing to next middleware
      if (error.name === "ZodError" || error.constructor.name === "ZodError") {
        const issues = error.issues || error.errors;
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        if (Array.isArray(issues)) {
          error.message = issues
            .map((e) => {
              const path = Array.isArray(e.path) && e.path.length > 0 ? `${e.path.join(".")}: ` : "";
              return `${path}${e.message || e}`;
            })
            .join(", ");
          error.details = issues.map((e) => ({
            path: e.path,
            message: e.message,
          }));
        }
      }
      next(error);
    });
}
