import express from "express";
import debug from "debug";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Logger from "../../functions/logger";
import DataHandler from '../../users/services/users.service';

const log: debug.IDebugger = debug("app");
const console: Logger = new Logger();

// @ts-ignore
const jwtSecret: string = process.env?.JWT_SECRET;
const tokenExpiresIn: number = Number(process.env.JWT_EXPIRES_IN || "3600");

export default new class AuthController {
    async createJwt(req: express.Request, res: express.Response) {
        try {
            const refreshId = req.body.userId + jwtSecret;
            const salt = crypto.createSecretKey(crypto.randomBytes(16));
            const hash = crypto.createHmac("sha512", salt)
                .update(refreshId)
                .digest("base64");
            req.body.refreshKey = salt.export();
            const token = jwt.sign(req.body, jwtSecret, { expiresIn: tokenExpiresIn });
            (await new DataHandler().updateUserInTable({ token: String(token) }, req.body.id, "create_jwt"))
            return res.status(201).send({ accessToken: token, refreshToken: hash });
        } catch (e) {
            log("createJWT error: %O", e);
            console.error(e, "AuthController.createJwt");
            return res.status(500).send({ message: "Internal Server Error" });
        }
    }
}