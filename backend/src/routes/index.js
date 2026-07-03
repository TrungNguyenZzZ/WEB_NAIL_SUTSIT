import authRoutes from "./auth.routes.js";
import serviceRoutes from "./service.routes.js";
import productRoutes from "./product.routes.js";
import staffRoutes from "./staff.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import discountRoutes from "./discount.routes.js";
import adminRoutes from "./admin.routes.js";

export const registerRoutes = (app) => {
  app.use("/api", authRoutes);
  app.use("/api", serviceRoutes);
  app.use("/api", productRoutes);
  app.use("/api", staffRoutes);
  app.use("/api", appointmentRoutes);
  app.use("/api", cartRoutes);
  app.use("/api", orderRoutes);
  app.use("/api", discountRoutes);
  app.use("/api", adminRoutes);
};
