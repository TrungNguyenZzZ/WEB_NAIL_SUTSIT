import { Router } from "express";
import {
  dashboardBestSellingProducts,
  dashboardRevenue,
  dashboardStatistics,
  dashboardTodayAppointments,
  dashboardTopServices,
  listUsers,
  updateUser
} from "../controllers/admin.controller.js";
import { protect, requireAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { querySchemas, userSchemas } from "../utils/validation-schemas.js";

const router = Router();

router.get("/admin/dashboard/statistics", protect, requireAdmin, dashboardStatistics);
router.get("/admin/dashboard/revenue", protect, requireAdmin, dashboardRevenue);
router.get("/admin/dashboard/today-appointments", protect, requireAdmin, dashboardTodayAppointments);
router.get(
  "/admin/dashboard/best-selling-products",
  protect,
  requireAdmin,
  dashboardBestSellingProducts
);
router.get("/admin/dashboard/top-services", protect, requireAdmin, dashboardTopServices);

router.get("/admin/users", protect, requireAdmin, validate(querySchemas.pagination, "query"), listUsers);
router.put("/admin/users/:id", protect, requireAdmin, validate(userSchemas.update), updateUser);

export default router;

