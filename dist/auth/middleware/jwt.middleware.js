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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const logger_1 = __importDefault(require("../../functions/logger"));
const jwtSecret = process.env.JWT_SECRET || "AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH";
const console = new logger_1.default();
exports.default = new class JWTMiddleware {
    verifyRefreshBodyField(req, res, next) {
        if (req.body && req.body.refreshToken) {
            return next();
        }
        else {
            return res.status(400).send({ message: "Bad Request", errors: [{ msg: "Missing refresh token" }] });
        }
    }
    validRefreshNeeded(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = node_crypto_1.default.createSecretKey(Buffer.from(res.locals.jwt.refreshKey.data));
            const hash = node_crypto_1.default.createHmac("sha512", salt)
                .update(res.locals.jwt.userId + jwtSecret)
                .digest("base64");
            if (hash === req.body.refreshToken) {
                return next();
            }
            else {
                return res.status(400).send({ message: "Bad Request", errors: [{ msg: "Invalid refresh token" }] });
            }
        });
    }
    validJWTNeeded(req, res, next) {
        if (req.headers["authorization"]) {
            try {
                const auth = req.headers["authorization"].split(" ");
                if (auth[0] !== "Bearer") {
                    return res.status(400).send({ message: "Bad Request", errors: [{ msg: "Invalid authorization header" }] });
                }
                else {
                    res.locals.jwt = jsonwebtoken_1.default.verify(auth[1], jwtSecret);
                    next();
                }
            }
            catch (e) {
                console.error(e, "JWTMiddleware.validJWTNeeded");
            }
        }
        else {
            console.warn(`Request to ${req.path} by ${req.ip} - No authorization header`);
            return res.status(400).send({ message: "Bad Request", errors: [{ msg: "Missing authorization header. Please refer to path \"POST /auth/\" to retrieve a refresh-token/bearer token" }] });
        }
    }
};
