import winston, {format} from "winston";
const chalk = require("chalk")
require("dotenv").config();
chalk.level = 3;
export default class Logger {
    private logger:winston.Logger;
    constructor() {
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.File({
                    level: "verbose",
                    filename: "logs/logs.log",
                    handleExceptions: false,
                }),
            ],
            format: format.combine(
                format.colorize(),
                format.splat(),
                format.errors({ stack: true }),
                format.printf(({service, message, level}) => {
                    return `------------------- [${new Date().toISOString()}] = ${level} -------------------\n[${new Date().toISOString()}] ${service} - ${level}: ${message}\n-------------------\n`;
                }),
            ),
            defaultMeta: {
                service: "ScarletAI"
            },
            exitOnError: false,
        });
    };

    private _log(level: string = "info", message: any, meta?: string) {
        if (!meta)
        {
            switch (level)
            {
                case "info":
                    this.logger.info(level, message);
                    return console.log(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.bgYellow(`${chalk.black(` ScarletAI - `)}${chalk.whiteBright(level.toLocaleUpperCase())} `)}${chalk.bgGreen(chalk.black(` ${message} `))}`);
                case "error":
                    if (typeof message == "string") {
                        this.logger.error(level, message);
                        return console.error(`${chalk.bgWhite(chalk.black(`[${new Date().toISOString()}] `))}${chalk.bgYellow(chalk.black(` ScarletAI - ${chalk.red(level.toLocaleUpperCase())} `))}${chalk.bgRed(chalk.black(` ${message} `))}`);
                    } else {
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
        } else {
            switch (level)
            {
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
        };
    };

    public log(message: any, meta?: string) {
        this._log("info", message, meta);
    }

    public error(message: Error| unknown | string , meta?: string) {
        this._log("error", message, meta);
    };

    public verbose(message: any, meta?: string) {
        this._log("verbose", message, meta);
    };

    public info(message: string, meta?: string) {
        this._log("info", message, meta);
    };

    public warn(message: string, meta?: string) {
        this._log("warn", message, meta);
    };

    public debug(message: string, meta?: string) {
        this._log("debug", message, meta);
    };

    public silly(message: string | any, meta?: string) {
        this._log("silly", message, meta);
    };
};