import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { saveUploadedImage } from "../services/media.service.js";

export const listStaff = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();
  const serviceId = req.query.serviceId?.trim();
  const requestedStatus = req.query.status?.trim();
  const canViewAllStatuses = req.user?.role === "ADMIN";

  const items = await prisma.staff.findMany({
    where: {
      ...(canViewAllStatuses
        ? requestedStatus && requestedStatus !== "ALL"
          ? { status: requestedStatus }
          : {}
        : { status: "ACTIVE" }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { specialties: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(serviceId
        ? {
            services: {
              some: {
                serviceId
              }
            }
          }
        : {})
    },
    include: {
      services: {
        include: {
          service: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  res.json({ items });
});

export const getStaffById = asyncHandler(async (req, res) => {
  const item = await prisma.staff.findUnique({
    where: { id: req.params.id },
    include: {
      services: {
        include: {
          service: true
        }
      },
      appointments: {
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          appointmentDate: "desc"
        },
        take: 10
      }
    }
  });

  if (!item || (item.status !== "ACTIVE" && req.user?.role !== "ADMIN")) {
    throw new ApiError(404, "Staff member not found.");
  }

  res.json({ item });
});

export const createStaff = asyncHandler(async (req, res) => {
  const imageUrl = (await saveUploadedImage(req.file, "staff")) ?? req.body.avatarUrl ?? null;

  const serviceIds = req.body.serviceIds ?? [];
  if (serviceIds.length > 0) {
    const matchedCount = await prisma.service.count({
      where: {
        id: { in: serviceIds }
      }
    });

    if (matchedCount !== serviceIds.length) {
      throw new ApiError(400, "One or more selected services are invalid.");
    }
  }

  const staff = await prisma.staff.create({
    data: {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      avatarUrl: imageUrl,
      description: req.body.description,
      specialties: req.body.specialties,
      workingDays: req.body.workingDays,
      workingHours: req.body.workingHours,
      status: req.body.status ?? "ACTIVE",
      services: {
        create: serviceIds.map((serviceId) => ({
          serviceId
        }))
      }
    },
    include: {
      services: {
        include: {
          service: true
        }
      }
    }
  });

  res.status(201).json({
    message: "Staff member created successfully.",
    item: staff
  });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const existing = await prisma.staff.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Staff member not found.");
  }

  const imageUrl =
    (await saveUploadedImage(req.file, "staff")) ?? req.body.avatarUrl ?? existing.avatarUrl;
  const serviceIds = req.body.serviceIds ?? [];

  const staff = await prisma.staff.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      avatarUrl: imageUrl,
      description: req.body.description,
      specialties: req.body.specialties,
      workingDays: req.body.workingDays,
      workingHours: req.body.workingHours,
      status: req.body.status ?? existing.status,
      services: {
        deleteMany: {},
        create: serviceIds.map((serviceId) => ({
          serviceId
        }))
      }
    },
    include: {
      services: {
        include: {
          service: true
        }
      }
    }
  });

  res.json({
    message: "Staff member updated successfully.",
    item: staff
  });
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const existing = await prisma.staff.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Staff member not found.");
  }

  await prisma.staff.update({
    where: { id: req.params.id },
    data: {
      status: "INACTIVE"
    }
  });

  res.json({
    message: "Staff member archived successfully."
  });
});

