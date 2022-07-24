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
const shortid_1 = __importDefault(require("shortid"));
const debug_1 = __importDefault(require("debug"));
const logger_1 = __importDefault(require("../../functions/logger"));
// import { PermissionFlags } from "../../common/middleware/common.permissionFlags.enum";
const log = (0, debug_1.default)('app:users-dao');
const console = new logger_1.default();
exports.default = new class UsersDao {
    constructor() {
        this.users = [];
        log('UsersDao constructor called.');
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = Object.assign(Object.assign({ 
                // @ts-ignore
                id: shortid_1.default.generate() }, user), { token: '', permissionFlags: 0 });
            this.users.push(newUser);
            console.log(`Created user: ${JSON.stringify(newUser)}`);
            return newUser;
        });
    }
    getUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.users.find((u) => u.id === id);
            if (!user) {
                throw new Error(`User with id ${id} not found.`);
            }
            return user;
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.users;
        });
    }
    putUser(id, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.getUser(id);
            const updatedUser = Object.assign(Object.assign({}, existingUser), user);
            const index = this.users.findIndex((u) => u.id === id);
            this.users[index] = updatedUser;
            console.log(`Updated user: ${JSON.stringify(updatedUser)}`);
            return updatedUser;
        });
    }
    patchUser(id, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.getUser(id);
            const updatedUser = Object.assign(Object.assign({}, existingUser), user);
            const index = this.users.findIndex((u) => u.id === id);
            this.users[index] = updatedUser;
            return updatedUser;
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.getUser(id);
            const index = this.users.findIndex((u) => u.id === id);
            this.users.splice(index, 1);
            return existingUser;
        });
    }
};
