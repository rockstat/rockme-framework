"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cctz_1 = require("cctz");
class AppStatus {
    constructor() {
        this.appStarted = new Date();
        this.get = (params) => {
            const appUptime = Number(new Date()) - Number(this.appStarted);
            return {
                status: "running",
                app_started: Number(this.appStarted),
                app_uptime: appUptime,
                app_uptime_h: cctz_1.format('%X', Math.round(appUptime / 1000)),
                methods: []
            };
        };
    }
}
exports.AppStatus = AppStatus;
//# sourceMappingURL=status.js.map