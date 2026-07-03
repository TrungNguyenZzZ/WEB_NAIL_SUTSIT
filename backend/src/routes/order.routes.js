import { Router } from "express";
import {
  createOrder,
  getOrderById,
  listAdminOrders,
  listMyOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";
import { protect, requireAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { orderSchemas, querySchemas } from "../utils/validation-schemas.js";

const router = Router();

router.post("/orders", protect, validate(orderSchemas.create), createOrder);
router.get("/orders/my-orders", protect, listMyOrders);
router.get("/orders/:id", protect, getOrderById);

router.get("/admin/orders", protect, requireAdmin, validate(querySchemas.pagination, "query"), listAdminOrders);
router.put(
  "/admin/orders/:id/status",
  protect,
  requireAdmin,
  validate(orderSchemas.updateStatus),
  updateOrderStatus
);

export default router;

