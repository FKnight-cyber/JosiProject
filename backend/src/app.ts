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

/** CORS_ORIGINS no Railway soma a esta lista (não substitui), para não apagar o domínio do Vercel por engano. */
const extraOrigins =
  process.env.CORS_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

const corsOrigins = [...new Set([...defaultOrigins, ...extraOrigins])];

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
    // Reflete a origem permitida (necessário para o browser receber Access-Control-Allow-Origin correto)
    origin(origin, callback) {
      if (allowOrigin(origin)) {
        return callback(null, origin ?? true);
      }
      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    optionsSuccessStatus: 204,
  }),
);
app.use(json());
app.use(mainRouter);
app.use(errorHandler);

export default app;