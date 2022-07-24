"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScarletRoutes = void 0;
const express_validator_1 = require("express-validator");
const common_routes_config_1 = require("../common/common.routes.config");
const body_val_middleware_1 = __importDefault(require("../common/middleware/body.val.middleware"));
const scarlet_controller_1 = __importDefault(require("./controllers/scarlet.controller"));
class ScarletRoutes extends common_routes_config_1.CommonRoutesConfig {
    constructor(app) {
        super(app, "ScarletRoutes");
    }
    configureRoutes() {
        this.app.post(`/v3/analyze/msg`, [
            (0, express_validator_1.body)('text').isString().exists()
                .withMessage('Text must be a string'),
            body_val_middleware_1.default.verifyBodyFieldErrors,
            scarlet_controller_1.default.analyzeSentiment,
        ]);
        this.app.post(`/v3/analyze/link`, [
            (0, express_validator_1.body)('url').isString().exists().withMessage('URL must be a string'),
            //bodyValMiddleware.verifyBodyFieldErrors,
            scarlet_controller_1.default.analyzeLink,
        ]);
        return this.app;
    }
}
exports.ScarletRoutes = ScarletRoutes;
