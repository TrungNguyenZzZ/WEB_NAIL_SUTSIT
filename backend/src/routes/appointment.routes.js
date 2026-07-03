import { Router } from "express";
import {
  cancelAppointment,
  createAppointment,
  getAppointmentById,
  listAdminAppointments,
  listMyAppointments,
  updateAppointmentStatus
} from "../controllers/appointment.controller.js";
import { protect, requireAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { appointmentSchemas, querySchemas } from "../utils/validation-schemas.js";

const router = Router();

router.post("/appointments", protect, validate(appointmentSchemas.create), createAppointment);
router.get("/appointments/my-appointments", protect, listMyAppointments);
router.get("/appointments/:id", protect, getAppointmentById);
router.put("/appointments/:id/cancel", protect, cancelAppointment);

router.get(
  "/admin/appointments",
  protect,
  requireAdmin,
  validate(querySchemas.pagination, "query"),
  listAdminAppointments
);
router.put(
  "/admin/appointments/:id/status",
  protect,
  requireAdmin,
  validate(appointmentSchemas.updateStatus),
  updateAppointmentStatus
);

export default router;

