import express from "express";
import argon2 from "argon2";
import Logger from "../../functions/logger";
import DataHandler from "../services/users.service";
import { CreateUserDto } from '../dto/create.user.dto';
import shortid from 'shortid';

const console: Logger = new Logger();

export default new class UserController {
    async listUsers(req: express.Request, res: express.Response): Promise<any> {
        console.warn(`User list requested by ${req.ip}`);
        return new DataHandler().getAllUsersFromTable().then((users) => {
            return res.status(201).send({
                message: "Listing Users.",
                users: users,
            });
        })
    }

    async getUser(req: express.Request, res: express.Response) {
        console.warn(`GET Request by ${req.ip} for user: ${req.params.userId}`);
        (await new DataHandler().getUserFromTable(req.params.userId))
        .on("result", (user: any) => {
            if (user.id == req.params.userId) {
                if (!res.locals.user) {
                    res.locals.user = user;
                }
                return res.status(200).send({
                    message: "Fetched User.",
                    user: user,
                });
            } else {
                return res.status(400).send({ errors: ["User doesn't exist."] });
            }
        })
    }

    async createUser(req: express.Request, res: express.Response): Promise<any> {
        //req.body.password = await argon2.hash(req.body.password);
        console.log(`POST ${req.path} - Request by ${req.ip} with body: ${JSON.stringify(req.body)}`);
        const user: CreateUserDto = {
            ...req.body,
            id: shortid.generate(),
        }
        
        new DataHandler().addUserToTable(user).then(() => {
            res.locals.user = user;
            return res.status(201).json({
                message: "Creating User.",
                user: user,
            });
        });
    };

    async patchUser(req: express.Request, res: express.Response): Promise<any> {
        if (req.body.password) {
            req.body.password = await argon2.hash(req.body.password);
        }
        console.log(`PATCH ${req.path} - Request by ${req.ip} with body: ${JSON.stringify(req.body)}`);
        return new DataHandler().updateUserInTable(req.body, req.params.userId).then((user: any) => {
            return res.status(201).send({
                message: "Updating User.",
                user: user,
            });
        }).catch((err: any) => {   
            console.error(err);
            return res.status(500).send(err);
        });
    }

    async putUser(req: express.Request, res: express.Response): Promise<any> {
        return new DataHandler().updateUserInTable(req.body, req.params.userId).then((user: any) => {
            return res.status(201).send({
                message: "Updating User.",
                user: user,
            });
        }).catch((err: any) => {
            console.error(err);
            return res.status(500).send(err);
        });
    }

    async deleteUser(req: express.Request, res: express.Response): Promise<any> {
        return new DataHandler().deleteUserFromTable(req.params.userId).then((user: any) => {
            return res.status(201).send({
                message: "Deleting User.",
                user: user,
            });
        }).catch((err: any) => {
            console.error(err);
            return res.status(500).send(err);
        });
    }

    /**
     * async updateUserFlags(req: express.Request, res: express.Response): Promise<any> {
        const patchUserDTO: PatchUserDto = {
            permissionFlags: parseInt(req.params.permissionFlags),
        };
        console.log(`PATCH Request by ${req.ip} to update perms for: ${JSON.stringify(patchUserDTO)}`);
        return new DataHandler().updateUserInTable(req.body, req.params.userId).then((user: any) => {
            return res.status(201).send({
                message: "Updating User.",
                user: user,
            });
        }).catch((err: any) => {
            console.error(err);
            return res.status(500).send(err);
        });
    }
    */

    async resetPassword(req: express.Request, res: express.Response): Promise<any> {
        res.status(201).send(`Resetting password.`);
    }
}