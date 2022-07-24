"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const common_routes_config_1 = require("../common/common.routes.config");
const auth_controller_1 = __importDefault(require("./controllers/auth.controller"));
const jwt_middleware_1 = __importDefault(require("./middleware/jwt.middleware"));
const auth_middleware_1 = __importDefault(require("./middleware/auth.middleware"));
const body_val_middleware_1 = __importDefault(require("../common/middleware/body.val.middleware"));
class AuthRoutes extends common_routes_config_1.CommonRoutesConfig {
    constructor(app) {
        super(app, 'AuthRoutes');
    }
    configureRoutes() {
        this.app.post(`/auth/token`, [
            body_val_middleware_1.default.verifyBodyFieldErrors,
            auth_middleware_1.default.verifyPassword,
            auth_controller_1.default.createJwt,
        ]);
        this.app.post(`/auth/refresh-token`, [
            jwt_middleware_1.default.validJWTNeeded,
            jwt_middleware_1.default.verifyRefreshBodyField,
            jwt_middleware_1.default.validRefreshNeeded,
            auth_controller_1.default.createJwt,
        ]);
        return this.app;
    }
}
exports.AuthRoutes = AuthRoutes;
