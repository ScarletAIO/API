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
const debug_1 = __importDefault(require("debug"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../../functions/logger"));
const users_service_1 = __importDefault(require("../../users/services/users.service"));
const log = (0, debug_1.default)("app");
const console = new logger_1.default();
// @ts-ignore
const jwtSecret = process.env.JWT_SECRET;
const tokenExpiresIn = Number(process.env.JWT_EXPIRES_IN || "3600");
exports.default = new class AuthController {
    createJwt(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshId = req.body.userId + jwtSecret;
                const salt = crypto_1.default.createSecretKey(crypto_1.default.randomBytes(16));
                const hash = crypto_1.default.createHmac("sha512", salt)
                    .update(refreshId)
                    .digest("base64");
                req.body.refreshKey = salt.export();
                const token = jsonwebtoken_1.default.sign(req.body, jwtSecret, { expiresIn: tokenExpiresIn });
                (yield new users_service_1.default().updateUserInTable({ token: String(token) }, req.body.id, "create_jwt"));
                return res.status(201).send({ accessToken: token, refreshToken: hash });
            }
            catch (e) {
                log("createJWT error: %O", e);
                console.error(e, "AuthController.createJwt");
                return res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
};
