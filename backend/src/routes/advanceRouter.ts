import { Router } from "express";
import { 
  getAdvanceById, 
  getAdvancesByClientId, 
  getAllAdvancesByClientId,
  getAdvancesByClientIdUntilDate,
  newAdvance, 
  removeAdvance,
  processAdvancePurchase
} from "../controllers/advanceController";
import advanceValidation from "../middlewares/advanceValidation";

const advanceRouter = Router();

advanceRouter.post('/advances', advanceValidation, newAdvance);
advanceRouter.get('/advances/client/:clientId', getAdvancesByClientId);
advanceRouter.get('/advances/client/:clientId/all', getAllAdvancesByClientId);
advanceRouter.get('/advances/client/:clientId/until-date', getAdvancesByClientIdUntilDate);
advanceRouter.get('/advances/:id', getAdvanceById);
advanceRouter.delete('/advances/:id', removeAdvance);
advanceRouter.post('/advances/process-purchase', processAdvancePurchase);

export default advanceRouter;
