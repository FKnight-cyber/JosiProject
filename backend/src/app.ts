import express, { json } from "express";
import "express-async-errors";
import cors from "cors";
import mainRouter from "./routes/mainRouter";
import errorHandler from "./middlewares/errorHandler";

const defaultOrigins = [
  "https://josi-project.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const corsOrigins =
  process.env.CORS_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? defaultOrigins;

function allowOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".vercel.app")) return true;
  } catch {
    /* ignore */
  }
  return false;
}

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      callback(null, allowOrigin(origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(json());
app.use(mainRouter);
app.use(errorHandler);

export default app;