"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snow_flake_1 = require("./snow_flake");
const round_counter_1 = require("./round_counter");
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
}
exports.TheIds = TheIds;
//# sourceMappingURL=service.js.map