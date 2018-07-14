"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snow_flake_1 = require("./snow_flake");
const round_counter_1 = require("./round_counter");
const xxhash_1 = require("xxhash");
const int64_buffer_1 = require("int64-buffer");
class TheIds {
    constructor() {
        this.sf = new snow_flake_1.IdGenShowFlake();
        this.rpcCounter = new round_counter_1.IdGenRoundCounter();
    }
    flake() {
        return this.sf.take();
    }
    round() {
        return this.rpcCounter.take().toString(36);
    }
    xxhash(str) {
        const buff = xxhash_1.hash64(Buffer.from(str), 0xCACA3ADA, 'buffer');
        return new int64_buffer_1.Uint64BE(buff).toString();
    }
}
exports.TheIds = TheIds;
//# sourceMappingURL=the-ids.js.map