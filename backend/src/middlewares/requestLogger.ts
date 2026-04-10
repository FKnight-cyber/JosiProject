import { Request, Response, NextFunction } from "express";

const LOG = "[MyControl API]";

export default function requestLogger(req: Request, res: Response, next: NextFunction) {
  const started = Date.now();
  const origin = req.headers.origin ?? req.headers.referer ?? "(no-origin)";

  res.on("finish", () => {
    const ms = Date.now() - started;
    console.log(
      `${LOG} ${req.method} ${req.originalUrl} → ${res.statusCode} ${ms}ms ip=${req.ip ?? req.socket.remoteAddress ?? "?"} origin=${origin}`,
    );
  });

  next();
}
