"use strict";
import redis from "redis";
import { promisify } from "util";
import Logger from '../../functions/logger';

const console: Logger = new Logger();

export default class CacheManager {
    private redisClient: any;
    constructor() {
        this.redisClient = redis.createClient({
            // @ts-expect-error
            host: process.env?.REDIS_HOST,
            port: process.env.REDIS_PORT,
        });

        if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.length > 0) {
            this.redisClient.auth(process.env.REDIS_PASSWORD, (err: Error, res:Response) => {
                if (err) {
                    console.error(err);
                }
                console.verbose(res);
            });
        }

        try {
            this.redisClient.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
            this.redisClient.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
            this.redisClient.lpushAsync = promisify(this.redisClient.lpush).bind(this.redisClient);
            this.redisClient.lrangeAsync = promisify(this.redisClient.lrange).bind(this.redisClient);
            this.redisClient.llenAsync = promisify(this.redisClient.llen).bind(this.redisClient);
            this.redisClient.lremAsync = promisify(this.redisClient.lrem).bind(this.redisClient);
            this.redisClient.lsetAsync = promisify(this.redisClient.lset).bind(this.redisClient);
            this.redisClient.hmsetAsync = promisify(this.redisClient.hmset).bind(this.redisClient);
            this.redisClient.hmgetAsync = promisify(this.redisClient.hmget).bind(this.redisClient);
            this.redisClient.clear = promisify(this.redisClient.del).bind(this.redisClient);
        } catch(err) {
            console.error(err);
        }

        this.redisClient.on("connected", () => {
            console.log("Redis connected");
        }).on("error", (err: Error) => {
            console.error(err);
        });

        setInterval(() => {
            this.redisClient.ping((err: Error, res: Response) => {
                if (err) {
                    console.error(err);
                }
                console.verbose(res);
            });
        }, (1000*60*5));
    };

    public get(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.redisClient.get(key, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    };

    public set(key: string, value: any, expire: number = 0): Promise<any> {
        return new Promise((resolve, reject) => {
            this.redisClient.set(key, value, (err, res) => {
                if (err) {
                    reject(err);
                }
                if (expire > 0) {
                    this.redisClient.expire(key, expire, (err, res) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(res);
                    });
                } else {
                    resolve(res);
                }
            });
        });
    };

    public del(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.redisClient.del(key, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    };

    public clear(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.redisClient.clear((err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    };
};

global.cache = new CacheManager();