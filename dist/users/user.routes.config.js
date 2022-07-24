"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const common_routes_config_1 = require("../common/common.routes.config");
const user_controller_1 = __importDefault(require("./controllers/user.controller"));
const users_middleware_1 = __importDefault(require("./middleware/users.middleware"));
const jwt_middleware_1 = __importDefault(require("../auth/middleware/jwt.middleware"));
const common_perm_middleware_1 = __importDefault(require("../common/middleware/common.perm.middleware"));
const common_permissionFlags_enum_1 = require("../common/middleware/common.permissionFlags.enum");
const body_val_middleware_1 = __importDefault(require("../common/middleware/body.val.middleware"));
const express_validator_1 = require("express-validator");
class UserRoutes extends common_routes_config_1.CommonRoutesConfig {
    constructor(app) {
        super(app, "UserRoutes");
    }
    configureRoutes() {
        this.app.route('/v3/users')
            .get(
        //jwtMiddleware.validJWTNeeded,
        //commonPermMiddleware.permissionFlagRequired(PermissionFlags.ADMIN_PERMISSION),
        user_controller_1.default.getUser)
            .post((0, express_validator_1.body)('email').isEmail(), (0, express_validator_1.body)('password').isString().isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'), body_val_middleware_1.default.verifyBodyFieldErrors, 
        //usersMiddleware.validateSameEmail,
        user_controller_1.default.createUser);
        this.app.param('userId', users_middleware_1.default.extractUserId);
        this.app
            .route('/v3/users/:userId')
            .all(users_middleware_1.default.validateUserExists, 
        //jwtMiddleware.validJWTNeeded,
        common_perm_middleware_1.default.onlySameUserOrAdmin)
            .get(user_controller_1.default.getUser)
            .delete(user_controller_1.default.deleteUser);
        this.app.put('/v3/users/:userId', [
            (0, express_validator_1.body)("email").isEmail(),
            (0, express_validator_1.body)("password").isString().isLength({ min: 8 })
                .withMessage('Password must be at least 8 characters long'),
            (0, express_validator_1.body)("firstName").isString(),
            (0, express_validator_1.body)("lastName").isString(),
            (0, express_validator_1.body)("permissionFlags").isInt(),
            body_val_middleware_1.default.verifyBodyFieldErrors,
            users_middleware_1.default.validateUserExists,
            users_middleware_1.default.userCantChangePermission,
            common_perm_middleware_1.default.permissionFlagRequired(common_permissionFlags_enum_1.PermissionFlags.OPEN_PERMISSION),
            user_controller_1.default.putUser
        ]);
        this.app.patch('/v3/users/:userId', [
            (0, express_validator_1.body)("email").isEmail(),
            (0, express_validator_1.body)("password").isString().isLength({ min: 8 })
                .withMessage('Password must be at least 8 characters long').optional(),
            (0, express_validator_1.body)("firstName").isString(),
            (0, express_validator_1.body)("lastName").isString(),
            (0, express_validator_1.body)("permissionFlags").isInt().optional(),
            body_val_middleware_1.default.verifyBodyFieldErrors,
            users_middleware_1.default.validateUserExists,
            users_middleware_1.default.userCantChangePermission,
            common_perm_middleware_1.default.onlySameUserOrAdmin,
            common_perm_middleware_1.default.permissionFlagRequired(common_permissionFlags_enum_1.PermissionFlags.OPEN_PERMISSION),
            //authMiddleware.verifyPassword,
            user_controller_1.default.patchUser
        ]);
        this.app.post('/v3/users/:userId/reset-password', [
            (0, express_validator_1.body)("password").isString().isLength({ min: 8 })
                .withMessage('Password must be at least 8 characters long'),
            body_val_middleware_1.default.verifyBodyFieldErrors,
            users_middleware_1.default.validateUserExists,
            users_middleware_1.default.userCantChangePermission,
            common_perm_middleware_1.default.permissionFlagRequired(common_permissionFlags_enum_1.PermissionFlags.ADMIN_PERMISSION),
            user_controller_1.default.resetPassword
        ]);
        this.app.put('/v3/users/:userId/permissionFlags/:permissionFlags', [
            jwt_middleware_1.default.validJWTNeeded,
            common_perm_middleware_1.default.permissionFlagRequired(common_permissionFlags_enum_1.PermissionFlags.ADMIN_PERMISSION),
            common_perm_middleware_1.default.onlySameUserOrAdmin,
            //userController.updateUserFlags
        ]);
        return this.app;
    }
}
exports.UserRoutes = UserRoutes;
