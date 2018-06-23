"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LRU = require("lru-cache");
const LRU_DEF_LIMIT = 500;
class RPCCache {
    constructor() {
        const options = {
            max: LRU_DEF_LIMIT,
            maxAge: 5 * 6e4
        };
        this.cache = LRU(options);
    }
    set(key, val, maxAge) {
        return this.cache.set(key, val, maxAge ? maxAge * 1e3 : maxAge);
    }
    get(key) {
        return this.cache.get(key);
    }
}
exports.RPCCache = RPCCache;
//# sourceMappingURL=cache.js.map