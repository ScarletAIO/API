"use strict";
/** @format */
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
const mysql_1 = __importDefault(require("mysql"));
const node_fs_1 = __importDefault(require("node:fs"));
const Importer = require("mysql-import");
const crypto_1 = __importDefault(require("crypto"));
const node_path_1 = __importDefault(require("node:path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../../functions/logger"));
const CacheManager_1 = __importDefault(require("../../common/services/CacheManager"));
const argon2_1 = __importDefault(require("argon2"));
const console = new logger_1.default();
const importer = new Importer({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT)
});
const transporter = nodemailer_1.default.createTransport({
    service: process.env.SERVICE,
    auth: {
        user: process.env.E_USER,
        pass: process.env.E_PASSWORD,
    },
});
const options = {
    from: process.env.E_HOST,
    to: process.env.E_TO,
    subject: process.env.SUBJECT,
    text: process.env.TEXT,
};
class DataHandler {
    createConnection() {
        const connection = mysql_1.default.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT)
        });
        return connection;
    }
    closeConnection() {
        this.createConnection().end();
    }
    importTable(file) {
        return __awaiter(this, void 0, void 0, function* () {
            importer.import(file).then(() => {
                var files = importer.getImported();
                console.verbose(`Exported to DB: ${files}`);
                return true;
            }).catch((err) => {
                console.error(err);
                return false;
            });
            importer.disconnect(true);
            return true;
        });
    }
    deleteUserTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.createConnection();
            const sql = `DROP TABLE \`users.table\`;`;
            connection.query(sql, (err, result) => {
                if (err) {
                    console.error(err);
                }
                console.info(result[0]);
                return true;
            });
            connection.end();
            return true;
        });
    }
    addUserToTable(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.createConnection();
            let { age, username, password, email, id } = userData;
            password = yield argon2_1.default.hash(String(password));
            const query = `INSERT INTO \`users_table\` (age, username, password, email, id) VALUES (?, ?, ?, ?, ?);`;
            connection.query(query, [age, username, password, email, id], (err) => {
                if (err) {
                    console.error(err);
                }
            });
            connection.end();
            new CacheManager_1.default().set(userData.id, userData);
            return true;
        });
    }
    /**
     *
     * @param {PutUserDto} userData - user data to update
     * @param {string} userId - user id to update
     * @param {Array} action - ["update_user", "create_jwt"] - action to perform
     * @returns {boolean}
     */
    updateUserInTable(userData, userId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.createConnection();
            const { age, username, password, email } = userData;
            let query;
            switch (action) {
                case "update_user":
                    // update the user data in the user.table
                    query = `UPDATE \`users_table\` SET age = ?, name = ?, password = ?, email = ? WHERE id = ?;`;
                    connection.query(query, [age, username, password, email, userId], (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                    connection.end();
                    new CacheManager_1.default().get(userId).then((user) => {
                        user.age = age;
                        user.username = username;
                        user.password = password;
                        user.email = email;
                        new CacheManager_1.default().del(userId);
                        new CacheManager_1.default().set(userId, user);
                    }).catch((err) => {
                        console.error(err);
                    });
                    return true;
                case "create_jwt":
                    const { token } = userData;
                    query = `UPDATE users_table SET token = ? WHERE id = ?`;
                    connection.query(query, [token, userId], (err) => {
                        if (err) {
                            console.error(err);
                        }
                        console.warn(`Token updated for user ${userId}`);
                    }).on("result", (result) => {
                        console.verbose(result);
                    });
                    connection.end();
                    /**new CacheManager().get(userId).then((user: any) => {
                        user.token = token;
                        new CacheManager().del(userId);
                        new CacheManager().set(userId, user);
                    }).catch((err: any) => {
                        console.error(err);
                    });*/
                    return true;
                default:
                    // update the user data in the user.table
                    query = `UPDATE \`users_table\` SET age = ?, name = ?, password = ?, email = ? WHERE id = ?;`;
                    connection.query(query, [age, username, password, email, userId], (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                    connection.end();
                    new CacheManager_1.default().get(userId).then((user) => {
                        user.age = age;
                        user.username = username;
                        user.password = password;
                        user.email = email;
                        new CacheManager_1.default().del(userId);
                        new CacheManager_1.default().set(userId, user);
                    }).catch((err) => {
                        console.error(err);
                    });
                    return true;
            }
        });
    }
    deleteUserFromTable(userid) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.createConnection();
            // delete the user data from the user.table
            const query = `DELETE FROM \`users_table\` WHERE id = ?;`;
            const result = yield connection.query(query, [userid]);
            connection.end();
            new CacheManager_1.default().del(userid);
            return result[0];
        });
    }
    getUserFromTable(userid) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.createConnection();
            let user = [];
            return connection.query(`SELECT * FROM users_table WHERE id = ?;`, [userid])
                .on("result", (res) => {
                return user.push(JSON.stringify(res));
            });
        });
    }
    getAllUsersFromTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.createConnection();
            // get all the user data from the user.table
            const query = `SELECT * FROM \`users_table\`;`;
            const result = yield connection.query(query);
            connection.end();
            return result[0];
        });
    }
    getUserFromTableByParam(userData, param) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.createConnection();
            // get the user data from the user.table
            const query = `SELECT * FROM \`users_table\` WHERE ? = ?;`;
            const result = yield connection.query(query, [param, userData[param]]);
            connection.end();
            return result[0];
        });
    }
    encryptDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.createConnection();
            const query = "select * from \`users_table\`;";
            const result = connection.query(query);
            connection.end();
            crypto_1.default.generateKey("aes", {
                length: 256,
            }, (err, key) => {
                if (err)
                    throw err;
                const iv = crypto_1.default.randomBytes(16).toString("hex").slice(0, 16);
                const cipher = crypto_1.default.createCipheriv("aes-256-cbc", key, iv);
                process.env.TEXT = iv;
                transporter.sendMail(options, (err, info) => {
                    if (err)
                        throw err;
                    console.log(String(info));
                });
                let encrypted = cipher.update(String(result), "utf8", "hex");
                encrypted += cipher.final("hex");
                node_fs_1.default.writeFile(node_path_1.default.resolve(`logs/database/backups/user.${Date.now()}.sql`), encrypted, {
                    flag: "a+",
                }, () => {
                    console.log("Database encrypted");
                });
            });
        });
    }
}
exports.default = DataHandler;
