import { Options as EjsOptions } from 'ejs';
import { AppConfigOptions, AbstractConfig, Envs } from '../types';
export declare class AppConfig<T> {
    configDir: string;
    config: AbstractConfig<T>;
    env: Envs;
    ejsConfig: EjsOptions;
    readonly identify: AbstractConfig<T>["identify"];
    readonly http: AbstractConfig<T>["http"];
    readonly ws: AbstractConfig<T>["websocket"];
    readonly log: AbstractConfig<T>["log"];
    readonly static: any;
    readonly redis: AbstractConfig<T>["redis"];
    readonly client: AbstractConfig<T>["client"];
    readonly meter: AbstractConfig<T>["metrics"];
    readonly rpc: AbstractConfig<T>["rpc"];
    /**
     * Reading all accessible configuration files including custom
     */
    constructor(options?: AppConfigOptions);
    load(options: AppConfigOptions): AbstractConfig<T>;
    get<K extends keyof AbstractConfig<T>>(section: K): AbstractConfig<T>[K];
    isDev(): boolean;
    isProd(): boolean;
    static readonly env: Envs;
}
