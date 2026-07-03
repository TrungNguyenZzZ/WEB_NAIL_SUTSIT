import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "./env.js";

const uploadDir = path.resolve(env.appRoot, env.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    callback(null, `${Date.now()}-${safeName}`);
  }
});

const imageFileFilter = (_req, file, callback) => {
  if (!file.mimetype.startsWith("image/")) {
    callback(new Error("Only image uploads are supported."));
    return;
  }
  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
