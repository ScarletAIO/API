import { threadId } from "node:worker_threads";
import * as redis from "redis";
import Logger from '../../functions/logger';

const console: Logger = new Logger();
const {
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASS,
    REDIS_USER
} = process.env;

export default class CacheManager {
    public redisClient:redis.RedisClientType;

    constructor() {
        this.redisClient = redis.createClient({
            url: `redis://default:HW01LmL8TgZCldcgywSkW7XG9F4QRVTc@redis-16609.c80.us-east-1-2.ec2.cloud.redislabs.com:16609`
        });
    };

    createConnection(): redis.RedisClientType {
        const connection = this.redisClient;
        return connection;
    }

    public async get(key:string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            this.redisClient.connect().then(() => {
                this.redisClient.get(`${key}`).then(async (res) => {
                    if (res) {
                        return resolve([res]);
                    }
                }).catch(err => {
                    reject(err);
                    console.error(err);
                })
            });
        })
    }

    public set(key: string, value: any, expire: number = 0): Promise<string | null> {
        return new Promise((resolve, reject) => {
            this.redisClient.connect().then(() => {
                this.redisClient.set(String(key), String(value)).then(async (res) => {
                    if (expire) {
                        this.redisClient.expire(key, expire);
                    }
                    resolve(res);
                }).catch(err => {
                    reject(err);
                    console.error(err);
                })
            });
        });
    };

    public del(key: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.redisClient.del(key).then((res) => {
                resolve(res);
            }).catch(err => {
                reject(err);
                console.error(err);
            });
        });
    };

    public clear(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.redisClient.flushAll().then(() => {
                resolve(console.info("Redis cache cleared"));
            }).catch(err => {
                reject(err);
                console.error(err);
            });
        });
    };
};

global.cache = new CacheManager();