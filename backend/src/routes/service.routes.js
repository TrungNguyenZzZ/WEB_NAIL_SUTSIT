import { Router } from "express";
import {
  createService,
  createServiceCategory,
  deleteService,
  deleteServiceCategory,
  getServiceByIdentifier,
  listServiceCategories,
  listServices,
  updateService,
  updateServiceCategory
} from "../controllers/service.controller.js";
import { optionalAuth, protect, requireAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { categorySchemas, querySchemas, serviceSchemas } from "../utils/validation-schemas.js";
import { upload } from "../config/upload.js";

const router = Router();

router.get("/services", optionalAuth, validate(querySchemas.pagination, "query"), listServices);
router.get("/services/:id", optionalAuth, getServiceByIdentifier);
router.get("/service-categories", listServiceCategories);

router.post(
  "/admin/services",
  protect,
  requireAdmin,
  upload.single("imageFile"),
  validate(serviceSchemas.create),
  createService
);
router.put(
  "/admin/services/:id",
  protect,
  requireAdmin,
  upload.single("imageFile"),
  validate(serviceSchemas.create),
  updateService
);
router.delete("/admin/services/:id", protect, requireAdmin, deleteService);

router.post(
  "/admin/service-categories",
  protect,
  requireAdmin,
  validate(categorySchemas.create),
  createServiceCategory
);
router.put(
  "/admin/service-categories/:id",
  protect,
  requireAdmin,
  validate(categorySchemas.create),
  updateServiceCategory
);
router.delete("/admin/service-categories/:id", protect, requireAdmin, deleteServiceCategory);

export default router;

