import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[MyControl API] listening on 0.0.0.0:${PORT} env=${process.env.NODE_ENV ?? "undefined"}`,
  );
});