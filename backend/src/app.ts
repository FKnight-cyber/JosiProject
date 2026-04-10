import express, { json } from "express";
import "express-async-errors";
import cors from "cors";
import { getInfo } from "./controllers/empresaController";
import mainRouter from "./routes/mainRouter";
import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";

const app = express();

app.set("trust proxy", 1);

const corsStaticOrigins = [
  "https://josi-project.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (corsStaticOrigins.includes(origin)) {
        return callback(null, origin);
      }
      try {
        if (new URL(origin).hostname.endsWith(".vercel.app")) {
          return callback(null, origin);
        }
      } catch {
        /* ignore */
      }
      return callback(null, false);
    },
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Accept-Language",
      "Origin",
      "X-Requested-With",
    ],
    optionsSuccessStatus: 204,
  }),
);
app.use(json());
app.use(requestLogger);

app.get("/", (_req, res) => {
  res.status(200).json({ ok: true, service: "mycontrol-backend" });
});
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});
app.get("/info", getInfo);

app.use(mainRouter);
app.use((req, res) => {
  console.warn(`[MyControl API 404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});
app.use(errorHandler);

export default app;