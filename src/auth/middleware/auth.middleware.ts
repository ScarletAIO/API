import express from "express";
import Logger from "../../functions/logger";
import DataHandler from '../../users/services/users.service';
import { escape } from "node:querystring";

const console: Logger = new Logger();

export default new class AuthMiddleware {
    async verifyPassword(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        console.log("verifyPassword");
        (await new DataHandler().getUserFromTable(req.body.id))
        .on("result", (user: any) => {
            if (user.username == req.body.username && user.password == req.body.password) {
                return next();
            } else {
                return res.status(400).send({ errors: ["Verification Failed. Incorrect credentials"] });
            }
        })
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