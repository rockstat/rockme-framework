import * as LRU from 'lru-cache';

const LRU_DEF_LIMIT = 500;

export class RPCCache {

  cache: LRU<string, { [k: string]: any }>;

  constructor() {
    const options = {
      max: LRU_DEF_LIMIT,
      maxAge: 5 * 6e4 // 5min
    }
    this.cache = new LRU(options);
  }

  /**
   *
   * @param key string key
   * @param val any value
   * @param maxAge seconds
   */
  set(key: string, val: any, maxAge?: number) {
    let options = {
      ttl: maxAge ? maxAge * 1e3 : maxAge
    }
    return this.cache.set(key, val, options);
  }

  get(key: string) {
    return this.cache.get(key);
  }


}
