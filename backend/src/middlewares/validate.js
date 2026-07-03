import { ApiError } from "../utils/api-error.js";

export const validate = (schema, source = "body") => (req, _res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    next(
      new ApiError(
        400,
        "Validation failed.",
        parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      )
    );
    return;
  }

  req[source] = parsed.data;
  next();
};

