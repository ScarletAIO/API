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
const logger_1 = __importDefault(require("../../functions/logger"));
const users_service_1 = __importDefault(require("../services/users.service"));
const console = new logger_1.default();
exports.default = new class UsersMiddleware {
    validateSameEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.body;
            new users_service_1.default().getUserFromTable(req.params.userId).then((u) => {
                if (user.email === u.email) {
                    next();
                }
                else {
                    res.status(400).send({ errors: ["Incorrect user details."] });
                }
            });
        });
    }
    ;
    validateSamePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.body;
            new users_service_1.default().getUserFromTable(req.params.userId).then((u) => {
                if (user.password === u.password) {
                    next();
                }
                else {
                    res.status(400).send({ errors: ["Incorrect user details."] });
                }
            });
        });
    }
    userCantChangePermission(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if ("permissionFlags" in req.body &&
                req.body.permissionFlags !== res.locals.user.permissionFlags) {
                res.status(400).send({ errors: ["Permission flags can't be changed."] });
            }
            else {
                next();
            }
        });
    }
    validatePatchEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.body.email) {
                this.validateSameEmail(req, res, next);
            }
            else {
                next();
            }
        });
    }
    ;
    validateUserExists(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            (yield new users_service_1.default().getUserFromTable(req.params.userId))
                .on("result", (user) => {
                if (user.id == req.params.userId) {
                    next();
                }
                else {
                    res.status(400).send({ errors: ["User doesn't exist."] });
                }
            });
        });
    }
    extractUserId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            if (userId) {
                res.locals.userId = userId;
                next();
            }
            else {
                res.status(400).send({ errors: ["User id is required."] });
            }
        });
    }
};
