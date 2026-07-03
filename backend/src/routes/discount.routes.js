import { Router } from "express";
import {
  applyDiscount,
  createDiscount,
  deleteDiscount,
  listDiscounts,
  updateDiscount
} from "../controllers/discount.controller.js";
import { protect, requireAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { discountSchemas } from "../utils/validation-schemas.js";

const router = Router();

router.post("/discounts/apply", validate(discountSchemas.apply), applyDiscount);
router.get("/admin/discounts", protect, requireAdmin, listDiscounts);
router.post("/admin/discounts", protect, requireAdmin, validate(discountSchemas.create), createDiscount);
router.put(
  "/admin/discounts/:id",
  protect,
  requireAdmin,
  validate(discountSchemas.create),
  updateDiscount
);
router.delete("/admin/discounts/:id", protect, requireAdmin, deleteDiscount);

export default router;

