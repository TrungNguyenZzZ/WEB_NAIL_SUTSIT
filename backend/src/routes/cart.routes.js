import { Router } from "express";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { cartSchemas } from "../utils/validation-schemas.js";

const router = Router();

router.get("/cart", protect, getCart);
router.post("/cart/add", protect, validate(cartSchemas.add), addToCart);
router.put("/cart/update/:itemId", protect, validate(cartSchemas.update), updateCartItem);
router.delete("/cart/remove/:itemId", protect, removeCartItem);
router.delete("/cart/clear", protect, clearCart);

export default router;

