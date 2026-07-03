import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ensureUniqueSlug } from "../utils/slug.js";
import { saveUploadedImage } from "../services/media.service.js";
import { parseBoolean } from "../utils/parse.js";

const buildProductOrderBy = (sort) => {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "best-selling":
      return { orderItems: { _count: "desc" } };
    default:
      return { createdAt: "desc" };
  }
};

const formatProduct = (product) => {
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

  return {
    ...product,
    averageRating: Number(averageRating.toFixed(1)),
    reviewCount: product.reviews.length
  };
};

export const listProducts = asyncHandler(async (req, res) => {
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
            { benefits: { contains: search, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(featured !== undefined ? { featured: parseBoolean(featured) } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        reviews: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: buildProductOrderBy(req.query.sort)
    }),
    prisma.product.count({ where })
  ]);

  res.json({
    items: items.map(formatProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getProductByIdentifier = asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
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
      }
    }
  });

  if (!product || (product.status !== "ACTIVE" && req.user?.role !== "ADMIN")) {
    throw new ApiError(404, "Product not found.");
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIVE"
    },
    include: {
      category: true,
      reviews: true
    },
    take: 4
  });

  res.json({
    item: formatProduct(product),
    relatedProducts: relatedProducts.map(formatProduct)
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const category = await prisma.productCategory.findUnique({
    where: { id: req.body.categoryId }
  });

  if (!category) {
    throw new ApiError(404, "Product category not found.");
  }

  const imageUrl = (await saveUploadedImage(req.file, "products")) ?? req.body.imageUrl ?? null;

  const product = await prisma.product.create({
    data: {
      name: req.body.name,
      slug: await ensureUniqueSlug("product", req.body.name),
      description: req.body.description,
      benefits: req.body.benefits,
      usageInstructions: req.body.usageInstructions,
      price: req.body.price,
      discountPrice: req.body.discountPrice,
      stock: req.body.stock,
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
    message: "Product created successfully.",
    item: product
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Product not found.");
  }

  const imageUrl =
    (await saveUploadedImage(req.file, "products")) ?? req.body.imageUrl ?? existing.imageUrl;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name,
      slug: await ensureUniqueSlug("product", req.body.name, existing.id),
      description: req.body.description,
      benefits: req.body.benefits,
      usageInstructions: req.body.usageInstructions,
      price: req.body.price,
      discountPrice: req.body.discountPrice,
      stock: req.body.stock,
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
    message: "Product updated successfully.",
    item: product
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Product not found.");
  }

  await prisma.product.update({
    where: { id: req.params.id },
    data: {
      status: "INACTIVE"
    }
  });

  res.json({
    message: "Product archived successfully."
  });
});

export const listProductCategories = asyncHandler(async (_req, res) => {
  const items = await prisma.productCategory.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  res.json({ items });
});

export const createProductCategory = asyncHandler(async (req, res) => {
  const category = await prisma.productCategory.create({
    data: {
      name: req.body.name,
      slug: await ensureUniqueSlug("productCategory", req.body.name),
      description: req.body.description
    }
  });

  res.status(201).json({
    message: "Product category created successfully.",
    item: category
  });
});

export const updateProductCategory = asyncHandler(async (req, res) => {
  const existing = await prisma.productCategory.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Product category not found.");
  }

  const category = await prisma.productCategory.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name,
      slug: await ensureUniqueSlug("productCategory", req.body.name, existing.id),
      description: req.body.description
    }
  });

  res.json({
    message: "Product category updated successfully.",
    item: category
  });
});

export const deleteProductCategory = asyncHandler(async (req, res) => {
  const linkedProducts = await prisma.product.count({
    where: { categoryId: req.params.id }
  });

  if (linkedProducts > 0) {
    throw new ApiError(400, "Cannot delete a category that still has products.");
  }

  await prisma.productCategory.delete({
    where: { id: req.params.id }
  });

  res.json({
    message: "Product category deleted successfully."
  });
});

