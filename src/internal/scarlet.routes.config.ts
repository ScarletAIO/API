import express from "express";
import { body } from "express-validator";
import { CommonRoutesConfig } from "../common/common.routes.config";
import bodyValMiddleware from "../common/middleware/body.val.middleware";
import scarletController from "./controllers/scarlet.controller";

export class ScarletRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, "ScarletRoutes");
    }
    
    configureRoutes(): express.Application {
        this.app.post(`/v3/scarlet/analyze`, [
            body('text').isString().exists()
            .withMessage('Text must be a string'),
            bodyValMiddleware.verifyBodyFieldErrors,
            scarletController.analyzeSentiment,
        ]);

        return this.app;
    }
}