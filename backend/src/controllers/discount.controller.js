import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resolveDiscount } from "../services/discount.service.js";
import { ApiError } from "../utils/api-error.js";

export const applyDiscount = asyncHandler(async (req, res) => {
  const result = await resolveDiscount({
    code: req.body.code,
    subtotal: req.body.subtotal,
    applyTo: req.body.applyTo
  });

  res.json({
    message: "Discount applied successfully.",
    item: {
      discount: result.discount,
      discountAmount: result.discountAmount,
      finalPrice: result.finalPrice
    }
  });
});

export const listDiscounts = asyncHandler(async (_req, res) => {
  const items = await prisma.discount.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json({ items });
});

export const createDiscount = asyncHandler(async (req, res) => {
  const code = req.body.code.toUpperCase();
  const existing = await prisma.discount.findUnique({
    where: { code }
  });

  if (existing) {
    throw new ApiError(409, "Discount code already exists.");
  }

  const item = await prisma.discount.create({
    data: {
      code,
      description: req.body.description,
      type: req.body.type,
      value: req.body.value,
      applyTo: req.body.applyTo,
      minOrderValue: req.body.minOrderValue ?? 0,
      maxUses: req.body.maxUses,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      status: req.body.status ?? "ACTIVE"
    }
  });

  res.status(201).json({
    message: "Discount created successfully.",
    item
  });
});

export const updateDiscount = asyncHandler(async (req, res) => {
  const existing = await prisma.discount.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Discount not found.");
  }

  const item = await prisma.discount.update({
    where: { id: req.params.id },
    data: {
      code: req.body.code.toUpperCase(),
      description: req.body.description,
      type: req.body.type,
      value: req.body.value,
      applyTo: req.body.applyTo,
      minOrderValue: req.body.minOrderValue ?? 0,
      maxUses: req.body.maxUses,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      status: req.body.status ?? existing.status
    }
  });

  res.json({
    message: "Discount updated successfully.",
    item
  });
});

export const deleteDiscount = asyncHandler(async (req, res) => {
  const existing = await prisma.discount.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Discount not found.");
  }

  await prisma.discount.delete({
    where: { id: req.params.id }
  });

  res.json({
    message: "Discount deleted successfully."
  });
});

