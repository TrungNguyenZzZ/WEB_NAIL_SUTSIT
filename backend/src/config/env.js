import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..", "..");

dotenv.config({
  path: path.join(appRoot, ".env")
});

const rawCorsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const corsOrigins = rawCorsOrigin
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export const env = {
  appRoot,
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "replace-with-a-secure-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: rawCorsOrigin,
  corsOrigins,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads"
};
