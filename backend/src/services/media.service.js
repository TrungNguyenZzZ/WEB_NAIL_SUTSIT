import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

const hasCloudinaryConfig =
  env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret;

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret
  });
}

export const saveUploadedImage = async (file, folder = "general") => {
  if (!file) {
    return null;
  }

  if (hasCloudinaryConfig) {
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: `blush-bloom/${folder}`
    });
    await fs.unlink(file.path);
    return uploadResult.secure_url;
  }

  return `/${env.uploadDir}/${path.basename(file.path)}`;
};

