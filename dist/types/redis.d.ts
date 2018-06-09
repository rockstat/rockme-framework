import { MeterFacade } from "./meter";
import { LoggerType } from "./log";
export declare type RedisMessageHandler = (msg: Array<string>) => void;
export interface RedisClientType {
    on(event: string, func: (...args: any[]) => void): void;
    publish(topic: string, raw: any): void;
    subscribe(channel: string, func: Function): void;
}
export interface RedisFactoryType {
    create(): RedisClientType;
}
export interface RedusListenerFn {
    (...args: Array<any>): void;
}
export interface RedisConfig {
    host: string;
    port: number;
    db: number;
    auth: boolean;
    maxRetries: number;
    tryToReconnect: boolean;
    reconnectTimeout: number;
    autoConnect: boolean;
    doNotSetClientName: boolean;
    doNotRunQuitOnEnd: boolean;
}
export interface RedisClientOptions extends RedisConfig {
    log?: LoggerType;
    meter?: MeterFacade;
}
