import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import {
  getBestSellingProducts,
  getDashboardStatistics,
  getRevenueSeries,
  getTodayAppointments,
  getTopServices
} from "../services/dashboard.service.js";

export const dashboardStatistics = asyncHandler(async (_req, res) => {
  res.json({
    item: await getDashboardStatistics()
  });
});

export const dashboardRevenue = asyncHandler(async (_req, res) => {
  res.json({
    items: await getRevenueSeries()
  });
});

export const dashboardTodayAppointments = asyncHandler(async (_req, res) => {
  res.json({
    items: await getTodayAppointments()
  });
});

export const dashboardBestSellingProducts = asyncHandler(async (_req, res) => {
  res.json({
    items: await getBestSellingProducts()
  });
});

export const dashboardTopServices = asyncHandler(async (_req, res) => {
  res.json({
    items: await getTopServices()
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();
  const items = await prisma.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          appointments: true,
          orders: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json({ items });
});

export const updateUser = asyncHandler(async (req, res) => {
  const existing = await prisma.user.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "User not found.");
  }

  const item = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      role: req.body.role ?? existing.role,
      status: req.body.status ?? existing.status
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      address: true,
      createdAt: true
    }
  });

  res.json({
    message: "User updated successfully.",
    item
  });
});

