import { RedisClient } from "../redis";
import { RedisClientOptions, RedisFactoryType } from "../types";
export declare class RedisFactory implements RedisFactoryType {
    options: RedisClientOptions;
    constructor(options: RedisClientOptions);
    create(): RedisClient;
}
