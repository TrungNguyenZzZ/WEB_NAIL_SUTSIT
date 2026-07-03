import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

const signToken = (userId) =>
  jwt.sign(
    {
      userId
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true
};

export const register = asyncHandler(async (req, res) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: req.body.email }
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      address: req.body.address
    },
    select: safeUserSelect
  });

  await prisma.cart.create({
    data: {
      userId: user.id
    }
  });

  res.status(201).json({
    token: signToken(user.id),
    user
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
    select: {
      ...safeUserSelect,
      password: true
    }
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "This account is currently blocked.");
  }

  const { password, ...safeUser } = user;

  res.json({
    token: signToken(user.id),
    user: safeUser
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const [appointments, orders] = await Promise.all([
    prisma.appointment.count({
      where: { userId: req.user.id }
    }),
    prisma.order.count({
      where: { userId: req.user.id }
    })
  ]);

  res.json({
    user: {
      ...req.user,
      metrics: {
        appointments,
        orders
      }
    }
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.json({
    message: "Logout successful. Remove the token from client storage."
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      avatarUrl: req.body.avatarUrl
    },
    select: safeUserSelect
  });

  res.json({
    message: "Profile updated successfully.",
    user: updatedUser
  });
});

