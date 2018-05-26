"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StubLogger {
    constructor() {
        this.debug = (...args) => { };
        this.info = (...args) => { };
        this.warn = (...args) => { };
        this.error = (...args) => { };
        this.trace = (...args) => { };
        this.fatal = (...args) => { };
    }
    child(options) {
        return new StubLogger();
    }
    ;
}
exports.StubLogger = StubLogger;
//# sourceMappingURL=stub.js.map