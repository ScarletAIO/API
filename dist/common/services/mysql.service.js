"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const node_path_1 = __importDefault(require("node:path"));
const logger_1 = __importDefault(require("../../functions/logger"));
const users_service_1 = __importDefault(require("../../users/services/users.service"));
const CacheManager_1 = __importDefault(require("./CacheManager"));
const console = new logger_1.default();
exports.default = new class MySQLService {
    constructor() {
        this.connectWithRetry = () => {
            console.verbose('connecting to mysql');
            new users_service_1.default().createConnection().connect((err) => {
                if (err) {
                    console.error(err);
                    setTimeout(new users_service_1.default().createConnection().connect, 5000);
                }
                console.verbose('connected to mysql');
            });
            new users_service_1.default().importTable(node_path_1.default.resolve("src\\users\\services\\users.schema.sql"));
            console.verbose('connecting to redis');
            new CacheManager_1.default().createConnection().connect()
                .then(() => {
                console.verbose('connected to redis');
            }).catch(e => {
                console.error(e);
                setTimeout(new CacheManager_1.default().createConnection().connect, 5000);
            });
            return;
        };
    }
    getMySQL() {
        return mysql_1.default;
    }
    ;
};
