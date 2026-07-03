import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";

export const app = express();
const corsOriginResolver = (origin, callback) => {
  if (!origin || env.corsOrigins.includes("*") || env.corsOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin ${origin} is not allowed by CORS.`));
};

app.use(
  cors({
    origin: corsOriginResolver,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(`/${env.uploadDir}`, express.static(path.resolve(env.appRoot, env.uploadDir)));

app.get("/api/health", (_req, res) => {
  res.json({
    message: "Blush Bloom API is healthy.",
    timestamp: new Date().toISOString()
  });
});

registerRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);
