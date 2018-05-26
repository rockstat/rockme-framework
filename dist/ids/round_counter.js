"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_SIZE = 99999;
class IdGenRoundCounter {
    constructor(size = DEFAULT_SIZE) {
        this.num = Math.round(Math.random() * size);
        this.size = size;
    }
    take() {
        if (this.num === this.size) {
            this.num = 0;
        }
        return ++this.num;
    }
}
exports.IdGenRoundCounter = IdGenRoundCounter;
//# sourceMappingURL=round_counter.js.map