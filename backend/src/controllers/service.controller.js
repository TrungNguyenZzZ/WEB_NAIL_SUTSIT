import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ensureUniqueSlug } from "../utils/slug.js";
import { saveUploadedImage } from "../services/media.service.js";
import { parseBoolean } from "../utils/parse.js";

const buildServiceOrderBy = (sort) => {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "duration-asc":
      return { duration: "asc" };
    case "duration-desc":
      return { duration: "desc" };
    case "popular":
      return { appointmentItems: { _count: "desc" } };
    default:
      return { createdAt: "desc" };
  }
};

const formatService = (service) => {
  const averageRating =
    service.reviews.length > 0
      ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length
      : 0;

  return {
    ...service,
    averageRating: Number(averageRating.toFixed(1)),
    reviewCount: service.reviews.length
  };
};

export const listServices = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 9);
  const search = req.query.search?.trim();
  const category = req.query.category?.trim();
  const requestedStatus = req.query.status?.trim();
  const featured = req.query.featured;
  const canViewAllStatuses = req.user?.role === "ADMIN";

  const where = {
    ...(canViewAllStatuses
      ? requestedStatus && requestedStatus !== "ALL"
        ? { status: requestedStatus }
        : {}
      : { status: "ACTIVE" }),
    ...(category
      ? {
          category: {
            slug: category
          }
        }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { shortDescription: { contains: search, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(featured !== undefined ? { featured: parseBoolean(featured) } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.service.findMany({
      where,
      include: {
        category: true,
        reviews: true,
        staffAssignments: {
          include: {
            staff: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: buildServiceOrderBy(req.query.sort)
    }),
    prisma.service.count({ where })
  ]);

  res.json({
    items: items.map(formatService),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getServiceByIdentifier = asyncHandler(async (req, res) => {
  const service = await prisma.service.findFirst({
    where: {
      OR: [{ id: req.params.id }, { slug: req.params.id }]
    },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      staffAssignments: {
        include: {
          staff: true
        }
      }
    }
  });

  if (!service || (service.status !== "ACTIVE" && req.user?.role !== "ADMIN")) {
    throw new ApiError(404, "Service not found.");
  }

  const relatedServices = await prisma.service.findMany({
    where: {
      categoryId: service.categoryId,
      id: { not: service.id },
      status: "ACTIVE"
    },
    take: 4,
    include: {
      category: true,
      reviews: true
    }
  });

  res.json({
    item: formatService(service),
    relatedServices: relatedServices.map(formatService)
  });
});

export const createService = asyncHandler(async (req, res) => {
  const category = await prisma.serviceCategory.findUnique({
    where: { id: req.body.categoryId }
  });

  if (!category) {
    throw new ApiError(404, "Service category not found.");
  }

  const imageUrl = (await saveUploadedImage(req.file, "services")) ?? req.body.imageUrl ?? null;

  const service = await prisma.service.create({
    data: {
      name: req.body.name,
      slug: await ensureUniqueSlug("service", req.body.name),
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      procedure: req.body.procedure,
      beforeCare: req.body.beforeCare,
      afterCare: req.body.afterCare,
      price: req.body.price,
      duration: req.body.duration,
      imageUrl,
      status: req.body.status ?? "ACTIVE",
      featured: req.body.featured ?? false,
      categoryId: req.body.categoryId
    },
    include: {
      category: true
    }
  });

  res.status(201).json({
    message: "Service created successfully.",
    item: service
  });
});

export const updateService = asyncHandler(async (req, res) => {
  const existing = await prisma.service.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Service not found.");
  }

  const imageUrl =
    (await saveUploadedImage(req.file, "services")) ?? req.body.imageUrl ?? existing.imageUrl;

  const updated = await prisma.service.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name,
      slug: await ensureUniqueSlug("service", req.body.name, existing.id),
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      procedure: req.body.procedure,
      beforeCare: req.body.beforeCare,
      afterCare: req.body.afterCare,
      price: req.body.price,
      duration: req.body.duration,
      imageUrl,
      status: req.body.status ?? existing.status,
      featured: req.body.featured ?? existing.featured,
      categoryId: req.body.categoryId
    },
    include: {
      category: true
    }
  });

  res.json({
    message: "Service updated successfully.",
    item: updated
  });
});

export const deleteService = asyncHandler(async (req, res) => {
  const existing = await prisma.service.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Service not found.");
  }

  await prisma.service.update({
    where: { id: req.params.id },
    data: {
      status: "INACTIVE"
    }
  });

  res.json({
    message: "Service archived successfully."
  });
});

export const listServiceCategories = asyncHandler(async (_req, res) => {
  const items = await prisma.serviceCategory.findMany({
    include: {
      _count: {
        select: {
          services: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  res.json({ items });
});

export const createServiceCategory = asyncHandler(async (req, res) => {
  const category = await prisma.serviceCategory.create({
    data: {
      name: req.body.name,
      slug: await ensureUniqueSlug("serviceCategory", req.body.name),
      description: req.body.description
    }
  });

  res.status(201).json({
    message: "Service category created successfully.",
    item: category
  });
});

export const updateServiceCategory = asyncHandler(async (req, res) => {
  const existing = await prisma.serviceCategory.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Service category not found.");
  }

  const category = await prisma.serviceCategory.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name,
      slug: await ensureUniqueSlug("serviceCategory", req.body.name, existing.id),
      description: req.body.description
    }
  });

  res.json({
    message: "Service category updated successfully.",
    item: category
  });
});

export const deleteServiceCategory = asyncHandler(async (req, res) => {
  const linkedServices = await prisma.service.count({
    where: { categoryId: req.params.id }
  });

  if (linkedServices > 0) {
    throw new ApiError(400, "Cannot delete a category that still has services.");
  }

  await prisma.serviceCategory.delete({
    where: { id: req.params.id }
  });

  res.json({
    message: "Service category deleted successfully."
  });
});

