import * as LRU from 'lru-cache';
export declare class RPCCache {
    cache: LRU.Cache<string, {
        [k: string]: any;
    }>;
    constructor();
    set(key: string, val: any, maxAge?: number): boolean;
    get(key: string): {
        [k: string]: any;
    } | undefined;
}
