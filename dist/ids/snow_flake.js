"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlakeIdGen = require("flake-idgen");
const int64_buffer_1 = require("int64-buffer");
class IdGenShowFlake {
    constructor() {
        this.idGen = new FlakeIdGen();
    }
    take() {
        const idBuff = this.idGen.next();
        return new int64_buffer_1.Uint64BE(idBuff).toString();
    }
    withTime() {
        return {
            id: this.take(),
        };
    }
}
exports.IdGenShowFlake = IdGenShowFlake;
//# sourceMappingURL=snow_flake.js.map