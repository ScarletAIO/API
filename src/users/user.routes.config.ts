import { CommonRoutesConfig } from "../common/common.routes.config";
import userController from "./controllers/user.controller";
import usersMiddleware from "./middleware/users.middleware";
import jwtMiddleware from "../auth/middleware/jwt.middleware";
import commonPermMiddleware from "../common/middleware/common.perm.middleware";
import { PermissionFlags } from "../common/middleware/common.permissionFlags.enum";
import bodyValMiddleware from "../common/middleware/body.val.middleware";
import { body } from "express-validator";
import express from "express";

export class UserRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, "UserRoutes");
    }

    configureRoutes(): express.Application {
        this.app.route('/v3/users')
            .get(
                //jwtMiddleware.validJWTNeeded,
                //commonPermMiddleware.permissionFlagRequired(PermissionFlags.ADMIN_PERMISSION),
                userController.getUser,
            )
            .post(
                body('email').isEmail(),
                body('password').isString().isLength({ min: 8 })
                .withMessage('Password must be at least 8 characters long'),
                bodyValMiddleware.verifyBodyFieldErrors,
                //usersMiddleware.validateSameEmail,
                userController.createUser,
            );
        
        this.app.param('userId', usersMiddleware.extractUserId);
        this.app
            .route('/v3/users/:userId')
            .all(
                usersMiddleware.validateUserExists,
                //jwtMiddleware.validJWTNeeded,
                commonPermMiddleware.onlySameUserOrAdmin,
                //commonPermMiddleware.permissionFlagRequired(PermissionFlags.OPEN_PERMISSION),
            )
            .get(userController.getUser)
            .delete(userController.deleteUser)

        this.app.put('/v3/users/:userId', [
            body("email").isEmail(),
            body("password").isString().isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
            body("firstName").isString(),
            body("lastName").isString(),
            body("permissionFlags").isInt(),
            bodyValMiddleware.verifyBodyFieldErrors,
            usersMiddleware.validateUserExists,
            usersMiddleware.userCantChangePermission,
            commonPermMiddleware.permissionFlagRequired(PermissionFlags.OPEN_PERMISSION),
            userController.putUser
        ]);

        this.app.patch('/v3/users/:userId', [
            body("email").isEmail(),
            body("password").isString().isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long').optional(),
            body("firstName").isString(),
            body("lastName").isString(),
            body("permissionFlags").isInt().optional(),
            bodyValMiddleware.verifyBodyFieldErrors,
            usersMiddleware.validateUserExists,
            usersMiddleware.userCantChangePermission,
            commonPermMiddleware.onlySameUserOrAdmin,
            commonPermMiddleware.permissionFlagRequired(PermissionFlags.OPEN_PERMISSION),
            //authMiddleware.verifyPassword,
            userController.patchUser
        ]);

        this.app.post('/v3/users/:userId/reset-password', [
            body("password").isString().isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
            bodyValMiddleware.verifyBodyFieldErrors,
            usersMiddleware.validateUserExists,
            usersMiddleware.userCantChangePermission,
            commonPermMiddleware.permissionFlagRequired(PermissionFlags.ADMIN_PERMISSION),
            userController.resetPassword
        ]);

        this.app.put('/v3/users/:userId/permissionFlags/:permissionFlags', [
            jwtMiddleware.validJWTNeeded,
            commonPermMiddleware.permissionFlagRequired(PermissionFlags.ADMIN_PERMISSION),
            commonPermMiddleware.onlySameUserOrAdmin,
            //userController.updateUserFlags
        ]);

        return this.app;
    }
}