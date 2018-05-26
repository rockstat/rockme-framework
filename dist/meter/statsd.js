"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StatsdClient = require("statsd-client");
class StatsdMeter {
    constructor(options) {
        this.client = new StatsdClient(options);
    }
    tick(metric, tags) {
        this.client.increment(metric, undefined, tags);
    }
    timenote(metric, tags) {
        const start = process.hrtime();
        return () => {
            const diff = process.hrtime(start);
            const time = Math.round(diff[0] * 1e3 + diff[1] * 1e-6);
            this.time(metric, time, tags);
            return time;
        };
    }
    time(metric, duration, tags) {
        this.client.timing(metric, duration, tags);
    }
}
exports.StatsdMeter = StatsdMeter;
//# sourceMappingURL=statsd.js.map