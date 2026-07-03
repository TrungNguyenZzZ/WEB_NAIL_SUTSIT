import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/api-error.js";

export const notFoundHandler = (_req, _res, next) => {
  next(new ApiError(404, "Route not found."));
};

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? undefined
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({
      message: "Database request failed.",
      details: error.message
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      message: "Database validation failed.",
      details: error.message
    });
    return;
  }

  res.status(500).json({
    message: error.message || "Internal server error."
  });
};

