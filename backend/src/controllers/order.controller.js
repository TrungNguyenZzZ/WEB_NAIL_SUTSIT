import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getOrCreateCart } from "../services/cart.service.js";
import { resolveDiscount } from "../services/discount.service.js";
import { ApiError } from "../utils/api-error.js";
import { generateCode } from "../utils/codes.js";

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);

  if (cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty.");
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const unitPrice = item.product.discountPrice ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const discountResult = req.body.discountCode
    ? await resolveDiscount({
        code: req.body.discountCode,
        subtotal,
        applyTo: "PRODUCT"
      })
    : null;

  const order = await prisma.$transaction(async (transaction) => {
    for (const item of cart.items) {
      const product = await transaction.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || product.status !== "ACTIVE") {
        throw new ApiError(400, `${item.product.name} is no longer available.`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `${item.product.name} does not have enough stock.`);
      }
    }

    const createdOrder = await transaction.order.create({
      data: {
        code: generateCode("ORD"),
        userId: req.user.id,
        discountId: discountResult?.discount.id,
        receiverName: req.body.receiverName,
        receiverPhone: req.body.receiverPhone,
        receiverEmail: req.body.receiverEmail,
        receiverAddress: req.body.receiverAddress,
        note: req.body.note,
        totalPrice: subtotal,
        discountAmount: discountResult?.discountAmount ?? 0,
        finalPrice: discountResult?.finalPrice ?? subtotal,
        paymentMethod: req.body.paymentMethod,
        paymentStatus: req.body.paymentMethod === "BANK_TRANSFER" ? "PENDING" : "PENDING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.imageUrl,
            quantity: item.quantity,
            price: item.product.discountPrice ?? item.product.price
          }))
        }
      },
      include: {
        items: true
      }
    });

    for (const item of cart.items) {
      await transaction.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    if (discountResult?.discount) {
      await transaction.discount.update({
        where: { id: discountResult.discount.id },
        data: {
          usedCount: {
            increment: 1
          }
        }
      });
    }

    await transaction.cartItem.deleteMany({
      where: {
        cartId: cart.id
      }
    });

    return createdOrder;
  });

  res.status(201).json({
    message: "Order placed successfully.",
    item: order
  });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const items = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: {
      items: true,
      discount: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json({ items });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const item = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: true,
      discount: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!item) {
    throw new ApiError(404, "Order not found.");
  }

  if (req.user.role !== "ADMIN" && item.userId !== req.user.id) {
    throw new ApiError(403, "You do not have access to this order.");
  }

  res.json({ item });
});

export const listAdminOrders = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();
  const items = await prisma.order.findMany({
    where: {
      ...(req.query.orderStatus ? { orderStatus: req.query.orderStatus } : {}),
      ...(req.query.paymentStatus ? { paymentStatus: req.query.paymentStatus } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { receiverName: { contains: search, mode: "insensitive" } },
              { receiverPhone: { contains: search, mode: "insensitive" } },
              { receiverEmail: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    },
    include: {
      items: true,
      discount: true,
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
      createdAt: "desc"
    }
  });

  res.json({ items });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const existing = await prisma.order.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Order not found.");
  }

  const item = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      orderStatus: req.body.orderStatus ?? existing.orderStatus,
      paymentStatus: req.body.paymentStatus ?? existing.paymentStatus
    },
    include: {
      items: true
    }
  });

  res.json({
    message: "Order updated successfully.",
    item
  });
});

