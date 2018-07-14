import { Meter } from '../meter';
import { RedisFactory } from '../redis';
import { TheIds } from '../ids';
import { AppConfig } from '../config';
import { Logger } from '../log';
import { RPCAgnostic } from '../rpc';
import { RPCAdapter, ConfigRoot } from '../types';
import { AppStatus } from '../rpc';
export declare class Deps<T> {
    log: Logger;
    id: TheIds;
    config: AppConfig<T>;
    meter: Meter;
    rpc: RPCAgnostic;
    redisFactory: RedisFactory;
    constructor(obj: {
        config: AppConfig<ConfigRoot>;
        log: Logger;
        meter: Meter;
        ids: TheIds;
        rpc: RPCAgnostic;
    });
}
export declare class AppRunner<T> {
    log: Logger;
    deps: Deps<T>;
    ids: TheIds;
    status: AppStatus;
    meter: Meter;
    config: AppConfig<ConfigRoot>;
    name: string;
    rpcAdaptor: RPCAdapter;
    rpc: RPCAgnostic;
    appStarted: Date;
    constructor();
    setup(): Promise<void>;
}
