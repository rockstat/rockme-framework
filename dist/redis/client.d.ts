/// <reference types="redis-fast-driver" />
import * as Redis from 'redis-fast-driver';
import { RedisConfig, LoggerType, RedisClientOptions, MeterFacade } from '../types';
export declare class RedisClient {
    options: RedisConfig;
    log: LoggerType;
    meter: MeterFacade;
    client: Redis;
    started: boolean;
    constructor(options: RedisClientOptions);
    on: (event: string, func: (...args: any[]) => void) => void;
    publish(topic: string, raw: any): void;
    subscribe(channel: string, func: Function): void;
}
