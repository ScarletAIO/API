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
const console = new logger_1.default();
exports.default = new class CommonPermissionMiddleware {
    permissionFlagRequired(reqPermFlag) {
        return (req, res, next) => {
            try {
                const userPermFlags = parseInt(res.locals.jwt.permissionFlags);
                if (userPermFlags & reqPermFlag) {
                    next();
                }
                else {
                    res.status(403).send("Forbidden");
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Internal Server Error");
            }
        };
    }
    onlySameUserOrAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
            const uPermFlags = parseInt(res.locals.jwt.permissionFlags);
            if (
                req.params &&
                req.params.userId &&
                req.params.userId == res.locals.jwt.userId
            ) {
                return next();
            } else {
                if (uPermFlags & PermissionFlags.ADMIN_PERMISSION) {
                    return next();
                } else {
                    res.status(403).send("Forbidden");
                }
            }**/
            const user = (yield new users_service_1.default().getUserFromTable(req.params.userId));
            user.on("result", (u) => {
                if (u.permission_level === 1 &&
                    req.body.password === u.password &&
                    req.header["authorization"].split(" ")[1] === u.token) {
                    return next();
                }
                else {
                    res.status(403).send("Forbidden");
                }
            });
        });
    }
};
