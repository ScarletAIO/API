import express from "express";
import { PermissionFlags } from "./common.permissionFlags.enum";
import Logger from "../../functions/logger";
import DataHandler from "../../users/services/users.service";

const console: Logger = new Logger();

export default new class CommonPermissionMiddleware {
    permissionFlagRequired(reqPermFlag: PermissionFlags) {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const userPermFlags = parseInt(res.locals.jwt.permissionFlags);
                if (userPermFlags & reqPermFlag) {
                    next();
                } else {
                    res.status(403).send("Forbidden");
                }
            } catch (err) {
                console.error(err);
                res.status(500).send("Internal Server Error");
            }
        }
    }

    async onlySameUserOrAdmin(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        /**
        const uPermFlags = parseInt(res.locals.jwt.permissionFlags);
        if (
            req.params &&
            req.params.userId &&
            req.params.userId == res.locals.jwt.userId
        ) {
            return next();
        } else {
            if (uPermFlags & PermissionFlags.ADMIN_PERMISSION) {
                return next();
            } else {
                res.status(403).send("Forbidden");
            }
        }**/

        const user = (await new DataHandler().getUserFromTable(req.params.userId));
        user.on("result", (u) => {
            if (u.permission_level === 1 && 
                req.body.password === u.password &&
                req.header["authorization"].split(" ")[1] === u.token
            ) {
                return next();
            } else {
                res.status(403).send("Forbidden");
            }
        })
    }
}