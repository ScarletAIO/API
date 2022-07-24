"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const redis = __importStar(require("redis"));
const logger_1 = __importDefault(require("../../functions/logger"));
const console = new logger_1.default();
const { REDIS_HOST, REDIS_PORT, REDIS_PASS, REDIS_USER } = process.env;
class CacheManager {
    constructor() {
        this.redisClient = redis.createClient({
            url: `redis://${REDIS_USER}:${REDIS_PASS}@${REDIS_HOST}:${REDIS_PORT}`
        });
        setInterval(() => {
            try {
                this.redisClient.ping();
                console.verbose(`Pinging redis server at ${REDIS_HOST}:${REDIS_PORT}`);
            }
            catch (e) {
                console.error(e);
            }
        }, /**ping every 5 minutes */ 5000 * 60);
    }
    ;
    createConnection() {
        const connection = this.redisClient;
        return connection;
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.redisClient.connect().then(() => {
                    this.redisClient.get(`${key}`).then((res) => __awaiter(this, void 0, void 0, function* () {
                        if (res) {
                            return resolve([res]);
                        }
                    })).catch(err => {
                        reject(err);
                        console.error(err);
                    });
                });
            });
        });
    }
    set(key, value, expire = 0) {
        return new Promise((resolve, reject) => {
            this.redisClient.connect().then(() => {
                this.redisClient.set(String(key), String(value)).then((res) => __awaiter(this, void 0, void 0, function* () {
                    if (expire) {
                        this.redisClient.expire(key, expire);
                    }
                    resolve(res);
                })).catch(err => {
                    reject(err);
                    console.error(err);
                });
            });
        });
    }
    ;
    del(key) {
        return new Promise((resolve, reject) => {
            this.redisClient.del(key).then((res) => {
                resolve(res);
            }).catch(err => {
                reject(err);
                console.error(err);
            });
        });
    }
    ;
    clear() {
        return new Promise((resolve, reject) => {
            this.redisClient.flushAll().then(() => {
                resolve(console.info("Redis cache cleared"));
            }).catch(err => {
                reject(err);
                console.error(err);
            });
        });
    }
    ;
}
exports.default = CacheManager;
;
global.cache = new CacheManager();
