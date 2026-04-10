import { Request, Response, NextFunction } from "express";

const LOG = "[MyControl API ERROR]";

export default async function errorHandler(
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status =
    typeof error?.status === "number" && error.status >= 400 && error.status < 600
      ? error.status
      : 500;
  const message = error?.message ?? "Internal server error";

  console.error(`${LOG} ${req.method} ${req.originalUrl} ${status} ${message}`);
  if (error?.stack) {
    console.error(error.stack);
  }

  return res.status(status).send(message);
}

export function checkError(status:number, message:string){
    return {
        status,
        message
    }
}