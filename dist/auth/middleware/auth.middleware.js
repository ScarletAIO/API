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
const users_service_1 = __importDefault(require("../../users/services/users.service"));
const node_querystring_1 = require("node:querystring");
const console = new logger_1.default();
exports.default = new class AuthMiddleware {
    verifyPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("verifyPassword");
            (yield new users_service_1.default().getUserFromTable(req.body.id))
                .on("result", (user) => {
                if (user.username == req.body.username && user.password == req.body.password) {
                    return next();
                }
                else {
                    return res.status(400).send({ errors: ["Verification Failed. Incorrect credentials"] });
                }
            });
        });
    }
    verifyIfBase64(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
            let test = regex.test(input);
            if (test && isNaN(input) && !/[a-zA-Z]/.test(input)) {
                return decodeURIComponent((0, node_querystring_1.escape)(window.atob(input)));
            }
            else {
                return input;
            }
        });
    }
};
