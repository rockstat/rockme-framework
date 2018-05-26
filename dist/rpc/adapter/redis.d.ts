import { AgnosticRPCOptions, RedisClientType, LoggerType } from "../../types";
import * as EventEmitter from 'eventemitter3';
import { RPCAdapter } from '../../types';
export declare class RPCAdapterRedis extends EventEmitter implements RPCAdapter {
    rsub: RedisClientType;
    rpub: RedisClientType;
    options: AgnosticRPCOptions;
    log: LoggerType;
    started: boolean;
    constructor(options: AgnosticRPCOptions);
    private decode(raw);
    private encode(data);
    send(to: string, msg: any): void;
    redisMsg: (redismsg: string[]) => void;
}
