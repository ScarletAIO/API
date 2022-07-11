import express from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { jwt as JWT } from "../../common/types/jwt";
import Logger from "../../functions/logger";

const jwtSecret: string = process.env.JWT_SECRET || "";
const console: Logger = new Logger();

export default new class JWTMiddleware {
    verifyRefreshBodyField(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        if (req.body && req.body.refreshToken) {
            return next();
        } else {
            return res.status(400).send({ message: "Bad Request", errors: [{ msg: "Missing refresh token" }] });
        }
    }

    async validRefreshNeeded(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        const user: any = res.locals.user;
        const salt = crypto.createSecretKey(Buffer.from(res.locals.jwt.refreshKey.data));
        const hash = crypto.createHmac("sha512", salt)
            .update(res.locals.jwt.userId + jwtSecret)
            .digest("base64");
        if (hash == req.body.refreshToken) {
            req.body = {
                userId: user._id,
                email: user.email,
                permissionFlags: user.permissionFlags,
            }
            return next();
        } else {
            return res.status(400).send({ message: "Bad Request", errors: [{ msg: "Invalid refresh token" }] });
        }
    }

    validJWTNeeded(
        req: express.Request, 
        res: express.Response, 
        next: express.NextFunction
    ) {
        if (req.headers["authorization"]) {
            try {
                const auth = req.headers["authorization"].split(" ");
                if (auth[0] !== "Bearer") {
                    return res.status(400).send({ message: "Bad Request", errors: [{ msg: "Invalid authorization header" }] });
                } else {
                    res.locals.jwt = jwt.verify(auth[1], jwtSecret) as JWT;
                    next();
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            console.warn(`Request to ${req.path} by ${req.ip} - No authorization header`);
            return res.status(400).send({ message: "Bad Request", errors: [{ msg: "Missing authorization header" }] });
        }
    }
}