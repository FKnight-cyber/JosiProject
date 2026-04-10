import express, { json } from "express";
import "express-async-errors";
import cors from "cors";
import mainRouter from "./routes/mainRouter";
import errorHandler from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(json());

app.get("/", (_req, res) => {
  res.status(200).json({ ok: true, service: "mycontrol-backend" });
});
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

app.use(mainRouter);
app.use(errorHandler);

export default app;