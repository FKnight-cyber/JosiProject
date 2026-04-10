import express, { json } from "express";
import "express-async-errors";
import cors from "cors";
import mainRouter from "./routes/mainRouter";
import errorHandler from "./middlewares/errorHandler";
import requestLogger from "./middlewares/requestLogger";

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(json());
app.use(requestLogger);

app.get("/", (_req, res) => {
  res.status(200).json({ ok: true, service: "mycontrol-backend" });
});
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

app.use(mainRouter);
app.use((req, res) => {
  console.warn(`[MyControl API 404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});
app.use(errorHandler);

export default app;