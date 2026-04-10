import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 5000;

// Railway/Docker precisam escutar em todas as interfaces; só "localhost" não recebe tráfego da borda.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server up on port ${PORT} (0.0.0.0)`);
});