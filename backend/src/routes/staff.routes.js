import { Router } from "express";
import { createStaff, deleteStaff, getStaffById, listStaff, updateStaff } from "../controllers/staff.controller.js";
import { optionalAuth, protect, requireAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { querySchemas, staffSchemas } from "../utils/validation-schemas.js";
import { upload } from "../config/upload.js";

const router = Router();

router.get("/staff", optionalAuth, validate(querySchemas.pagination, "query"), listStaff);
router.get("/staff/:id", optionalAuth, getStaffById);

router.post(
  "/admin/staff",
  protect,
  requireAdmin,
  upload.single("imageFile"),
  validate(staffSchemas.create),
  createStaff
);
router.put(
  "/admin/staff/:id",
  protect,
  requireAdmin,
  upload.single("imageFile"),
  validate(staffSchemas.create),
  updateStaff
);
router.delete("/admin/staff/:id", protect, requireAdmin, deleteStaff);

export default router;

