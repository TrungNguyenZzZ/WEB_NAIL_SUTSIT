import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().trim().optional()
);

const requiredNumber = z.preprocess((value) => Number(value), z.number().finite().nonnegative());

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
  z.number().finite().nonnegative().optional()
);

const optionalBoolean = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.toLowerCase());
  }
  return value;
}, z.boolean().optional());

const idArray = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return value;
}, z.array(z.string().min(1)));

export const authSchemas = {
  register: z.object({
    name: z.string().trim().min(2, "Name is required."),
    email: z.string().trim().email("A valid email is required."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must include an uppercase letter.")
      .regex(/[0-9]/, "Password must include a number."),
    phone: optionalText,
    address: optionalText
  }),
  login: z.object({
    email: z.string().trim().email("A valid email is required."),
    password: z.string().min(1, "Password is required.")
  }),
  profile: z.object({
    name: z.string().trim().min(2),
    phone: optionalText,
    address: optionalText,
    avatarUrl: optionalText
  })
};

export const categorySchemas = {
  create: z.object({
    name: z.string().trim().min(2),
    description: optionalText
  })
};

export const serviceSchemas = {
  create: z.object({
    name: z.string().trim().min(2),
    description: z.string().trim().min(10),
    shortDescription: optionalText,
    procedure: optionalText,
    beforeCare: optionalText,
    afterCare: optionalText,
    price: requiredNumber,
    duration: z.preprocess((value) => Number(value), z.number().int().positive()),
    imageUrl: optionalText,
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    featured: optionalBoolean,
    categoryId: z.string().min(1)
  })
};

export const productSchemas = {
  create: z.object({
    name: z.string().trim().min(2),
    description: z.string().trim().min(10),
    benefits: optionalText,
    usageInstructions: optionalText,
    price: requiredNumber,
    discountPrice: optionalNumber,
    stock: z.preprocess((value) => Number(value), z.number().int().nonnegative()),
    imageUrl: optionalText,
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    featured: optionalBoolean,
    categoryId: z.string().min(1)
  })
};

export const staffSchemas = {
  create: z.object({
    name: z.string().trim().min(2),
    phone: optionalText,
    email: optionalText.refine((value) => !value || /\S+@\S+\.\S+/.test(value), {
      message: "Email is invalid."
    }),
    description: optionalText,
    specialties: optionalText,
    workingDays: optionalText,
    workingHours: optionalText,
    avatarUrl: optionalText,
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    serviceIds: idArray.optional()
  })
};

export const appointmentSchemas = {
  create: z.object({
    serviceIds: z.array(z.string().min(1)).min(1, "Select at least one service."),
    staffId: optionalText,
    appointmentDate: z.string().min(1),
    appointmentTime: z.string().min(1),
    customerName: z.string().trim().min(2),
    customerPhone: z.string().trim().min(8),
    customerEmail: z.string().trim().email(),
    note: optionalText,
    paymentMethod: z.enum(["SALON", "BANK_TRANSFER", "VNPAY", "MOMO"]).default("SALON")
  }),
  updateStatus: z.object({
    status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]),
    paymentStatus: z.enum(["PENDING", "PAID", "REFUNDED"]).optional(),
    staffId: optionalText,
    internalNote: optionalText
  })
};

export const cartSchemas = {
  add: z.object({
    productId: z.string().min(1),
    quantity: z.preprocess((value) => Number(value), z.number().int().positive().max(99))
  }),
  update: z.object({
    quantity: z.preprocess((value) => Number(value), z.number().int().positive().max(99))
  })
};

export const orderSchemas = {
  create: z.object({
    receiverName: z.string().trim().min(2),
    receiverPhone: z.string().trim().min(8),
    receiverEmail: z.string().trim().email(),
    receiverAddress: z.string().trim().min(8),
    note: optionalText,
    paymentMethod: z.enum(["CASH_ON_DELIVERY", "BANK_TRANSFER", "VNPAY", "MOMO"]),
    discountCode: optionalText
  }),
  updateStatus: z.object({
    orderStatus: z.enum(["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"]).optional(),
    paymentStatus: z.enum(["PENDING", "PAID", "REFUNDED"]).optional()
  })
};

export const discountSchemas = {
  apply: z.object({
    code: z.string().trim().min(2),
    subtotal: requiredNumber,
    applyTo: z.enum(["SERVICE", "PRODUCT", "ALL"]).default("ALL")
  }),
  create: z.object({
    code: z.string().trim().min(2),
    description: optionalText,
    type: z.enum(["PERCENT", "FIXED"]),
    value: requiredNumber,
    applyTo: z.enum(["SERVICE", "PRODUCT", "ALL"]),
    minOrderValue: optionalNumber,
    maxUses: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
      z.number().int().positive().optional()
    ),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional()
  })
};

export const userSchemas = {
  update: z.object({
    role: z.enum(["USER", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "BLOCKED"]).optional()
  })
};

export const querySchemas = {
  pagination: z.object({
    page: z.preprocess((value) => (value ? Number(value) : 1), z.number().int().positive()).optional(),
    limit: z.preprocess((value) => (value ? Number(value) : 9), z.number().int().positive().max(50)).optional(),
    search: optionalText,
    category: optionalText,
    sort: optionalText,
    status: optionalText,
    featured: optionalText,
    date: optionalText,
    serviceId: optionalText,
    staffId: optionalText,
    paymentStatus: optionalText,
    orderStatus: optionalText
  })
};
