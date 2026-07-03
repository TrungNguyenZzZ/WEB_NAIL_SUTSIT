import { prisma } from "../config/prisma.js";
import { getOrCreateCart } from "../services/cart.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

const serializeCart = (cart) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    ...cart,
    subtotal,
    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0)
  };
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  res.json({
    item: serializeCart(cart)
  });
});

export const addToCart = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.body.productId }
  });

  if (!product || product.status !== "ACTIVE") {
    throw new ApiError(404, "Product not found.");
  }

  if (product.stock < req.body.quantity) {
    throw new ApiError(400, "Requested quantity exceeds stock.");
  }

  const cart = await getOrCreateCart(req.user.id);
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: product.id
      }
    }
  });

  if (existingItem) {
    const nextQuantity = existingItem.quantity + req.body.quantity;
    if (nextQuantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds stock.");
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: nextQuantity,
        price: product.discountPrice ?? product.price
      }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: req.body.quantity,
        price: product.discountPrice ?? product.price
      }
    });
  }

  const updatedCart = await getOrCreateCart(req.user.id);

  res.status(201).json({
    message: "Product added to cart.",
    item: serializeCart(updatedCart)
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: req.params.itemId },
    include: {
      cart: true,
      product: true
    }
  });

  if (!item || item.cart.userId !== req.user.id) {
    throw new ApiError(404, "Cart item not found.");
  }

  if (req.body.quantity > item.product.stock) {
    throw new ApiError(400, "Requested quantity exceeds stock.");
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: {
      quantity: req.body.quantity,
      price: item.product.discountPrice ?? item.product.price
    }
  });

  const cart = await getOrCreateCart(req.user.id);

  res.json({
    message: "Cart updated successfully.",
    item: serializeCart(cart)
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: req.params.itemId },
    include: {
      cart: true
    }
  });

  if (!item || item.cart.userId !== req.user.id) {
    throw new ApiError(404, "Cart item not found.");
  }

  await prisma.cartItem.delete({
    where: { id: item.id }
  });

  const cart = await getOrCreateCart(req.user.id);

  res.json({
    message: "Cart item removed successfully.",
    item: serializeCart(cart)
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id
    }
  });

  const updatedCart = await getOrCreateCart(req.user.id);

  res.json({
    message: "Cart cleared successfully.",
    item: serializeCart(updatedCart)
  });
});

