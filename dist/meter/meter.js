"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const statsd_1 = require("./statsd");
class Meter {
    constructor(options) {
        this.meters = [];
        if (options.statsd) {
            this.meters.push(new statsd_1.StatsdMeter(options.statsd));
        }
    }
    tick(metric, tags) {
        for (const m of this.meters) {
            m.tick(metric, tags);
        }
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
        for (const m of this.meters) {
            m.time(metric, duration, tags);
        }
    }
}
exports.Meter = Meter;
//# sourceMappingURL=meter.js.map