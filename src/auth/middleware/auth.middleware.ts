import express from "express";
import argon2 from 'argon2';
import Logger from "../../functions/logger";
import { User } from '../../users/daos/user.schema';

const console: Logger = new Logger();

export default new class AuthMiddleware {
    async verifyPassword(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        const user: User = res.locals.user;
        if (user) {
            const passwordHash = user.password;
            if (await argon2.verify(passwordHash, req.body.password)) {
                req.body = {
                    ...req.body,
                    email: user.email,
                    permissionFlags: user.permissionFlags,
                };
                return next();
            }
        }
        console.log(`Failed Password attempt by ${req.ip} for account: ${user.email}`);
        return res.status(400).send({ message: "Bad Request", errors: [{ msg: "Invalid password" }] });
    }

    async verifyIfBase64(input: any) {
        var regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        let test = regex.test(input);

        if (test && isNaN(input) && !/[a-zA-Z]/.test(input)) {
            return decodeURIComponent(escape(window.atob(input)));
        } else {
            return input;
        }
    }
}