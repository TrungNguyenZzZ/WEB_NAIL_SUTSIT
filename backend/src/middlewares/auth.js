import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const protect = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required.");
    }

    const token = authorization.replace("Bearer ", "");
    const payload = jwt.verify(token, env.jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    if (!user || user.status !== "ACTIVE") {
      throw new ApiError(401, "Account is not available.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token."));
  }
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authorization.replace("Bearer ", "");
    const payload = jwt.verify(token, env.jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    if (user?.status === "ACTIVE") {
      req.user = user;
    }
  } catch {
    req.user = null;
  }
  next();
};

export const requireAdmin = (req, _res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    next(new ApiError(403, "Admin access is required."));
    return;
  }
  next();
};
