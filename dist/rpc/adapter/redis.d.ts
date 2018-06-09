import { AgnosticRPCOptions, RedisClientType, LoggerType } from "../../types";
import * as EventEmitter from 'eventemitter3';
import { RPCAdapter } from '../../types';
export declare class RPCAdapterRedis extends EventEmitter implements RPCAdapter {
    options: AgnosticRPCOptions;
    started: boolean;
    rsub: RedisClientType;
    rpub: RedisClientType;
    log: LoggerType;
    constructor(options: AgnosticRPCOptions);
    private decode;
    private encode;
    send(to: string, msg: any): void;
    redisMsg: (redismsg: string[]) => void;
}
