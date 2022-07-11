import express from "express";
import DataHandler from '../services/users.service';

export default new class UsersMiddleware {
    async validateSameEmail(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user = req.body;
        new DataHandler().getUserFromTable(req.params.id).then(
            (u: any) => {
                if (user.email === u.email) {
                    next();
                } else {
                    res.status(400).send({ errors: ["Incorrect user details."] });
                }
            }
        );
    };

    async validateSamePassword(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user = req.body;
        new DataHandler().getUserFromTable(req.params.id).then(
            (u: any) => {
                if (user.password === u.password) {
                    next();
                } else {
                    res.status(400).send({ errors: ["Incorrect user details."] });
                }
            }
        );
    }

    async userCantChangePermission(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if ("permissionFlags" in req.body &&
            req.body.permissionFlags !== res.locals.user.permissionFlags) {
            res.status(400).send({ errors: ["Permission flags can't be changed."] });
        } else {
            next();
        }
    }

    async validatePatchEmail(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.body.email) {
            this.validateSameEmail(req, res, next);
        } else {
            next();
        }
    };

    async validateUserExists(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        new DataHandler().getUserFromTable(req.params.id).then(
            (u: any) => {
                if (u) {
                    next();
                } else {
                    res.status(400).send({ errors: ["Invalid User fetched."] });
                }
            }
        );
    }

    async extractUserId(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const userId = req.params.userId;
        if (userId) {
            res.locals.userId = userId;
            next();
        } else {
            res.status(400).send({ errors: ["User id is required."] });
        }
    }
}