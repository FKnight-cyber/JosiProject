import { Request, Response, NextFunction } from "express";
import clienteSchema from "../schemas/clienteSchema";

export default function clienteValidation(req:Request, 
    res:Response, 
    next:NextFunction) {
        const { error } = clienteSchema.validate(req.body, {abortEarly:false});

        if(error) {
            return res.status(422).json(error.details.map(detail => detail.message));
        }

        next();
};