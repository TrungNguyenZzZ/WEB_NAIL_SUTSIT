import { Router } from "express";
import { getMe, login, logout, register, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { authSchemas } from "../utils/validation-schemas.js";

const router = Router();

router.post("/auth/register", validate(authSchemas.register), register);
router.post("/auth/login", validate(authSchemas.login), login);
router.get("/auth/me", protect, getMe);
router.post("/auth/logout", protect, logout);
router.put("/auth/profile", protect, validate(authSchemas.profile), updateProfile);

export default router;

