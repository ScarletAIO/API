import { CommonRoutesConfig } from '../common/common.routes.config';
import authController from './controllers/auth.controller';
import jwtMiddleware from './middleware/jwt.middleware';
import authMiddleware from './middleware/auth.middleware';
import express from 'express';
import BodyValidationMiddleware from '../common/middleware/body.val.middleware';

export class AuthRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'AuthRoutes');
    }

    configureRoutes(): express.Application {
        this.app.post(`/auth/token`, [
            BodyValidationMiddleware.verifyBodyFieldErrors,
            authMiddleware.verifyPassword,
            authController.createJwt,
        ]);
        this.app.post(`/auth/refresh-token`, [
            jwtMiddleware.validJWTNeeded,
            jwtMiddleware.verifyRefreshBodyField,
            jwtMiddleware.validRefreshNeeded,
            authController.createJwt,
        ]);
        return this.app;
    }
}