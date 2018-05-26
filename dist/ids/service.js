"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const round_counter_1 = require("./round_counter");
class TheIds {
    constructor() {
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