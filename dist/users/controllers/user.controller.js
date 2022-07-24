"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argon2_1 = __importDefault(require("argon2"));
const logger_1 = __importDefault(require("../../functions/logger"));
const users_service_1 = __importDefault(require("../services/users.service"));
const shortid_1 = __importDefault(require("shortid"));
const console = new logger_1.default();
exports.default = new class UserController {
    listUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn(`User list requested by ${req.ip}`);
            return new users_service_1.default().getAllUsersFromTable().then((users) => {
                return res.status(201).send({
                    message: "Listing Users.",
                    users: users,
                });
            });
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn(`GET Request by ${req.ip} for user: ${req.params.userId}`);
            (yield new users_service_1.default().getUserFromTable(req.params.userId))
                .on("result", (user) => {
                if (user.id == req.params.userId) {
                    if (!res.locals.user) {
                        res.locals.user = user;
                    }
                    return res.status(200).send({
                        message: "Fetched User.",
                        user: user,
                    });
                }
                else {
                    return res.status(400).send({ errors: ["User doesn't exist."] });
                }
            });
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //req.body.password = await argon2.hash(req.body.password);
            console.log(`POST ${req.path} - Request by ${req.ip} with body: ${JSON.stringify(req.body)}`);
            const user = Object.assign(Object.assign({}, req.body), { id: shortid_1.default.generate() });
            new users_service_1.default().addUserToTable(user).then(() => {
                res.locals.user = user;
                return res.status(201).json({
                    message: "Creating User.",
                    user: user,
                });
            });
        });
    }
    ;
    patchUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.body.password) {
                req.body.password = yield argon2_1.default.hash(req.body.password);
            }
            console.log(`PATCH ${req.path} - Request by ${req.ip} with body: ${JSON.stringify(req.body)}`);
            return new users_service_1.default().updateUserInTable(req.body, req.params.userId).then((user) => {
                return res.status(201).send({
                    message: "Updating User.",
                    user: user,
                });
            }).catch((err) => {
                console.error(err);
                return res.status(500).send(err);
            });
        });
    }
    putUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return new users_service_1.default().updateUserInTable(req.body, req.params.userId).then((user) => {
                return res.status(201).send({
                    message: "Updating User.",
                    user: user,
                });
            }).catch((err) => {
                console.error(err);
                return res.status(500).send(err);
            });
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return new users_service_1.default().deleteUserFromTable(req.params.userId).then(() => {
                return res.status(201).send({
                    message: "User Deleted."
                });
            }).catch((err) => {
                console.error(err);
                return res.status(500).send(err);
            });
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
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(201).send(`Resetting password.`);
        });
    }
};
