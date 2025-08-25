import { Request, Response, NextFunction } from "express";
import advanceSchema from "../schemas/advanceSchema";

export default function advanceValidation(req:Request, 
    res:Response, 
    next:NextFunction) {
        console.log('Data received in advance validation:', req.body);
        
        const { error } = advanceSchema.validate(req.body, {abortEarly:false});

        if(error) {
            return res.status(422).json(error.details.map(detail => detail.message));
        }

        console.log('Advance validation passed successfully');
        next();
};
