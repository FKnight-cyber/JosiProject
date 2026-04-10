import { Request, Response, NextFunction } from "express";

export default function requestLogger(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin ?? req.headers.referer ?? "(no origin)";
  console.log(`[req] ${req.method} ${req.originalUrl} origin=${origin}`);
  next();
}
