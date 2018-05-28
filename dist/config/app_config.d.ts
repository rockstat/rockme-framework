import { Options as EjsOptions } from 'ejs';
import { ConfigRoot, ImplicitConfig, AppConfigOptions } from '../types';
import { Envs } from '../types';
export declare class AppConfig<T> {
    configDir: string;
    config: ConfigRoot;
    env: Envs;
    ejsConfig: EjsOptions;
    readonly identify: (T & ImplicitConfig & {
        [k: string]: any;
    })["identify"];
    readonly http: (T & ImplicitConfig & {
        [k: string]: any;
    })["http"];
    readonly ws: (T & ImplicitConfig & {
        [k: string]: any;
    })["websocket"];
    readonly log: (T & ImplicitConfig & {
        [k: string]: any;
    })["log"];
    readonly static: any;
    readonly redis: (T & ImplicitConfig & {
        [k: string]: any;
    })["redis"];
    readonly client: (T & ImplicitConfig & {
        [k: string]: any;
    })["client"];
    readonly meter: (T & ImplicitConfig & {
        [k: string]: any;
    })["metrics"];
    readonly rpc: (T & ImplicitConfig & {
        [k: string]: any;
    })["rpc"];
    /**
     * Reading all accessible configuration files including custom
     */
    constructor(options?: AppConfigOptions);
    get<K extends keyof N, N extends T & ConfigRoot>(section: K): N[K];
    isDev(): boolean;
    isProd(): boolean;
    static readonly env: Envs;
}
