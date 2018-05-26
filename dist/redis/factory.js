"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../redis");
class RedisFactory {
    constructor(options) {
        this.options = options;
    }
    create() {
        return new redis_1.RedisClient(this.options);
    }
}
exports.RedisFactory = RedisFactory;
//# sourceMappingURL=factory.js.map