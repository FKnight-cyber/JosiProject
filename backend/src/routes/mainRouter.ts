import { Router } from "express";
import clienteRouter from "./clienteRouter";
import productRouter from "./productRouter";
import purchaseRouter from "./purchaseRouter";
import advanceRouter from "./advanceRouter";

const mainRouter = Router();

mainRouter.use(clienteRouter);
mainRouter.use(productRouter);
mainRouter.use(purchaseRouter);
mainRouter.use(advanceRouter);

export default mainRouter;