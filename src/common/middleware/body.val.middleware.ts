import express from "express";
import { validationResult } from "express-validator";

export default new class BodyValidationMiddleware {
    verifyBodyFieldErrors(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors.array()[1]);
        } else {
            next();
        }
    }
}