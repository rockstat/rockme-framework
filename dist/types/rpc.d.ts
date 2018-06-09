/// <reference types="node" />
import { MeterFacade } from "./meter";
import { RedisFactoryType } from "./redis";
import { Logger } from "../log";
export interface RPCRequestHandler {
    (arg: any): void;
}
export declare type RequestHandler<T> = (params: T) => any;
export interface RpcMethods {
    [k: string]: RequestHandler<any>;
}
export interface RPCAdapter {
    send(to: string, msg: any): void;
    on(event: string, fn: RPCRequestHandler, context?: any): this;
}
export interface RPCRegisterStruct {
    methods?: Array<[string, string, string]>;
}
export interface RPCRegisterHandler {
    (params: RPCRegisterStruct): any;
}
export interface RPCBase {
    jsonrpc: '2.0';
    to: string;
    from: string;
}
export declare type RPCRequestParams = {
    [k: string]: any;
} | null;
export interface RPCRequest extends RPCBase {
    id?: string;
    method: string;
    params: RPCRequestParams;
}
export interface RPCResponse extends RPCBase {
    id: string;
    result: any;
}
export interface RPCErrorDetails {
    message: string;
    code: number;
    data?: any;
}
export interface RPCResponseError extends RPCBase {
    id: string;
    error: RPCErrorDetails;
}
export interface RPCWaitingCall {
    resolve: (value?: any | PromiseLike<any>) => void;
    reject: (reason?: any) => void;
    timing: Function;
    timeout: NodeJS.Timer;
}
export declare type RPCWaitingCalls = {
    [k: string]: RPCWaitingCall | undefined;
};
export interface RPCConfig {
    name: string;
    listen_all: boolean;
    listen_direct: boolean;
}
export interface AgnosticRPCOptions extends RPCConfig {
    redisFactory: RedisFactoryType;
    channels: Array<string>;
    log?: Logger;
    meter?: MeterFacade;
}
