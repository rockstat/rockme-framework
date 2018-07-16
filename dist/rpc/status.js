"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppStatus {
    constructor() {
        this.appStarted = new Date();
        this.get = (params) => {
            const appUptime = Number(new Date()) - Number(this.appStarted);
            return {
                app_state: "running",
                app_started: Number(this.appStarted),
                app_uptime: appUptime,
                methods: []
            };
        };
    }
}
exports.AppStatus = AppStatus;
//# sourceMappingURL=status.js.map