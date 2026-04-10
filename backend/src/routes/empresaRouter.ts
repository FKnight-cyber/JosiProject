import { Router } from "express";
import { getInfo } from "../controllers/empresaController";

const empresaRouter = Router();

empresaRouter.get("/info", getInfo);

export default empresaRouter;