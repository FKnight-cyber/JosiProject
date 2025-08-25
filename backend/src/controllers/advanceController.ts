import { Request, Response } from "express";
import advanceService from "../services/advanceService";
import { checkError } from "../middlewares/errorHandler";

export async function newAdvance(req: Request, res: Response) {
  try {
    const result = await advanceService.register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function getAdvancesByClientId(req: Request, res: Response) {
  try {
    const { clientId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    
    const result = await advanceService.findByClientIdWithPagination(parseInt(clientId), page, limit);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function getAllAdvancesByClientId(req: Request, res: Response) {
  try {
    const { clientId } = req.params;
    const result = await advanceService.findByClientId(parseInt(clientId));
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function getAdvancesByClientIdUntilDate(req: Request, res: Response) {
  try {
    const { clientId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    const result = await advanceService.findByClientIdUntilDate(parseInt(clientId), date as string);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro no controller:', error);
    return res.status(400).json({ error: error.message });
  }
}

export async function getAdvanceById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await advanceService.findById(parseInt(id));
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function removeAdvance(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await advanceService.removeById(parseInt(id));
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function processAdvancePurchase(req: Request, res: Response) {
  try {
    const { clientId, purchaseId, valorUsado } = req.body;
    if (!clientId || !purchaseId || !valorUsado) {
      return res.status(400).json({ error: 'Incomplete data' });
    }
    const result = await advanceService.processAdvancePurchase(
      parseInt(clientId), 
      parseInt(purchaseId), 
      parseFloat(valorUsado)
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error processing advance purchase:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
