import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/api-error.js";

export const calculateDiscountAmount = (discount, subtotal) => {
  if (!discount) {
    return 0;
  }

  if (discount.type === "PERCENT") {
    return Math.min(subtotal * (discount.value / 100), subtotal);
  }

  return Math.min(discount.value, subtotal);
};

export const resolveDiscount = async ({ code, subtotal, applyTo = "ALL" }) => {
  const discount = await prisma.discount.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (!discount) {
    throw new ApiError(404, "Discount code was not found.");
  }

  const now = new Date();

  if (discount.status !== "ACTIVE") {
    throw new ApiError(400, "Discount code is inactive.");
  }

  if (discount.startDate > now || discount.endDate < now) {
    throw new ApiError(400, "Discount code is outside its active time range.");
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    throw new ApiError(400, "Discount code has reached its usage limit.");
  }

  if (discount.minOrderValue && subtotal < discount.minOrderValue) {
    throw new ApiError(
      400,
      `Minimum order value for this discount is ${discount.minOrderValue}.`
    );
  }

  if (discount.applyTo !== "ALL" && discount.applyTo !== applyTo) {
    throw new ApiError(400, "Discount code does not apply to this checkout.");
  }

  const discountAmount = calculateDiscountAmount(discount, subtotal);

  return {
    discount,
    discountAmount,
    finalPrice: subtotal - discountAmount
  };
};

