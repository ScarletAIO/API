import express from "express";
import Logger from "../../functions/logger";
import DataHandler from '../services/users.service';

const console: Logger = new Logger();

export default new class UsersMiddleware {
    async validateSameEmail(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user = req.body;
        new DataHandler().getUserFromTable(req.params.userId).then(
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
        new DataHandler().getUserFromTable(req.params.userId).then(
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
        (await new DataHandler().getUserFromTable(req.params.userId))
        .on("result", (user: any) => {
            if (user.id == req.params.userId) {
                next();
            } else {
                res.status(400).send({ errors: ["User doesn't exist."] });
            }
        });
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