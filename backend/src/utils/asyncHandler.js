export function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Handle ZodError before passing to next middleware
      if (error.name === "ZodError" || error.constructor.name === "ZodError" || (error.errors && Array.isArray(error.errors))) {
        const issues = error.issues || error.errors;
        error.statusCode = 400;
        if (Array.isArray(issues)) {
          error.message = issues
            .map((e) => {
              const path = e.path && e.path.length > 0 ? `${e.path.join(".")}: ` : "";
              return `${path}${e.message}`;
            })
            .join(", ");
        }
      }
      next(error);
    });
}
