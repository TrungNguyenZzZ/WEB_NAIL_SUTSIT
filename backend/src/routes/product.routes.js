import { Router } from "express";
import {
  createProduct,
  createProductCategory,
  deleteProduct,
  deleteProductCategory,
  getProductByIdentifier,
  listProductCategories,
  listProducts,
  updateProduct,
  updateProductCategory
} from "../controllers/product.controller.js";
import { optionalAuth, protect, requireAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { categorySchemas, productSchemas, querySchemas } from "../utils/validation-schemas.js";
import { upload } from "../config/upload.js";

const router = Router();

router.get("/products", optionalAuth, validate(querySchemas.pagination, "query"), listProducts);
router.get("/products/:id", optionalAuth, getProductByIdentifier);
router.get("/product-categories", listProductCategories);

router.post(
  "/admin/products",
  protect,
  requireAdmin,
  upload.single("imageFile"),
  validate(productSchemas.create),
  createProduct
);
router.put(
  "/admin/products/:id",
  protect,
  requireAdmin,
  upload.single("imageFile"),
  validate(productSchemas.create),
  updateProduct
);
router.delete("/admin/products/:id", protect, requireAdmin, deleteProduct);

router.post(
  "/admin/product-categories",
  protect,
  requireAdmin,
  validate(categorySchemas.create),
  createProductCategory
);
router.put(
  "/admin/product-categories/:id",
  protect,
  requireAdmin,
  validate(categorySchemas.create),
  updateProductCategory
);
router.delete("/admin/product-categories/:id", protect, requireAdmin, deleteProductCategory);

export default router;

