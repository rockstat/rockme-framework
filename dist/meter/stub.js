"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StubMeter {
    tick(metric, tags) { }
    timenote(metric, tags) {
        return () => 0;
    }
    time(metric, duration, tags) { }
}
exports.StubMeter = StubMeter;
//# sourceMappingURL=stub.js.map