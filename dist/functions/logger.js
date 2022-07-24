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
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importStar(require("winston"));
const chalk = require("chalk");
require("dotenv").config();
chalk.level = 3;
class Logger {
    constructor() {
        this.logger = winston_1.default.createLogger({
            transports: [
                new winston_1.default.transports.File({
                    level: "verbose",
                    filename: "logs/logs.log",
                    handleExceptions: true,
                }),
            ],
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.splat(), winston_1.format.errors({ stack: true }), winston_1.format.printf(({ service, message, level }) => {
                return `------------------- [${new Date().toISOString()}] = ${level} -------------------\n[${new Date().toISOString()}] ${service} - ${level}: ${message}\n-------------------\n`;
            })),
            defaultMeta: {
                service: "ScarletAI"
            },
            exitOnError: false,
        });
    }
    ;
    _log(level = "info", message, meta) {
        if (!meta) {
            switch (level) {
                case "info":
                    this.logger.info(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.bgYellow(`${chalk.black(` ScarletAI - `)}${chalk.whiteBright(level.toLocaleUpperCase())} `)}${chalk.bgGreen(chalk.black(` ${message} `))}`);
                case "error":
                    if (typeof message == "string") {
                        this.logger.error(level, message);
                        return console.error(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.bgYellow(chalk.black(` ScarletAI - ${chalk.red(level.toLocaleUpperCase())} `))}${chalk.bgRed(chalk.black(` ${message} `))}`);
                    }
                    else {
                        this.logger.error(level, message);
                        return console.error(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.bgYellow(chalk.black(` ScarletAI - ${chalk.red(level.toLocaleUpperCase())} `))}${chalk.bgRed(` ${chalk.black(`${message.message} \n`)}`)}    ${chalk.red(`${message.stack}`)}\n`);
                    }
                case "verbose":
                    this.logger.verbose(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.bgYellow(chalk.black(` ScarletAI - ${level.toLocaleUpperCase()} `))}${chalk.bgCyan(chalk.black(` ${message} `))}`);
                case "warn":
                    this.logger.warn(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.bgYellow(chalk.black(` ScarletAI - ${level.toLocaleUpperCase()} `))}${chalk.bgYellow(chalk.black(` ${message} `))}`);
                case "debug":
                    this.logger.debug(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.bgYellow(chalk.black(` ScarletAI - ${level.toLocaleUpperCase()} `))}${chalk.bgBlue(chalk.black(` ${message} `))}`);
                case "silly":
                    this.logger.silly(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.bgYellow(chalk.black(` ScarletAI - ${level.toLocaleUpperCase()} `))}${chalk.bgMagenta(chalk.black(` ${message} `))}`);
                default:
                    this.logger.info(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.bgYellow(chalk.black(` ScarletAI - ${level.toLocaleUpperCase()} `))}${chalk.bgGreen(chalk.black(` ${message} `))}`);
            }
        }
        else {
            switch (level) {
                case "info":
                    this.logger.info(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.yellow(`${meta} - ${level.toLocaleUpperCase()}`)} ${chalk.green(`${message}`)}`);
                case "error":
                    this.logger.error(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.red(`${meta} - ${level.toLocaleUpperCase()}`)} ${chalk.red(`${message.message}\n\t${message.stack}`)}`);
                case "verbose":
                    this.logger.verbose(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.cyan(`${meta} - ${level.toLocaleUpperCase()}`)} ${chalk.cyan(`${message}`)}`);
                case "warn":
                    this.logger.warn(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.yellow(`${meta} - ${level.toLocaleUpperCase()}`)} ${chalk.yellow(`${message}`)}`);
                case "debug":
                    this.logger.debug(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.blue(`${meta} - ${level.toLocaleUpperCase()}`)} ${chalk.blue(`${message}`)}`);
                case "silly":
                    this.logger.silly(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.magenta(`${meta} - ${level.toLocaleUpperCase()}`)} ${chalk.magenta(`${message}`)}`);
                default:
                    this.logger.info(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.yellow(`${meta} - ${level.toLocaleUpperCase()}`)} ${chalk.green(`${message}`)}`);
            }
        }
        ;
    }
    ;
    log(message, meta) {
        this._log("info", message, meta);
    }
    error(message, meta) {
        this._log("error", message, meta);
    }
    ;
    verbose(message, meta) {
        this._log("verbose", message, meta);
    }
    ;
    info(message, meta) {
        this._log("info", message, meta);
    }
    ;
    warn(message, meta) {
        this._log("warn", message, meta);
    }
    ;
    debug(message, meta) {
        this._log("debug", message, meta);
    }
    ;
    silly(message, meta) {
        this._log("silly", message, meta);
    }
    ;
}
exports.default = Logger;
;
