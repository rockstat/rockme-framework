"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cctz_1 = require("cctz");
const meter_1 = require("../meter");
const redis_1 = require("../redis");
const ids_1 = require("../ids");
const config_1 = require("../config");
const log_1 = require("../log");
const rpc_1 = require("../rpc");
class Deps {
    constructor(obj) {
        Object.assign(this, obj);
    }
}
exports.Deps = Deps;
class AppRunner {
    constructor() {
        this.appStarted = new Date();
        this.config = new config_1.AppConfig();
        this.log = new log_1.Logger(this.config.log).for(this);
        this.meter = new meter_1.Meter(this.config.meter);
        this.ids = new ids_1.TheIds();
        this.name = this.config.rpc.name;
        this.log.info('Starting service');
    }
    /**
     * Required remote functuins
     */
    async setup() {
        // setup Redis
        const redisFactory = this.deps.redisFactory = new redis_1.RedisFactory({ log: this.log, meter: this.meter, ...this.config.redis });
        // Setup RPC
        const channels = [];
        if (this.config.rpc.listen_all) {
            channels.push(rpc_1.BROADCAST);
        }
        if (this.config.rpc.listen_direct) {
            channels.push(this.name);
        }
        const rpcOptions = {
            channels,
            redisFactory,
            log: this.log,
            meter: this.meter,
            ...this.config.rpc
        };
        this.rpc = new rpc_1.RPCAgnostic(rpcOptions);
        const rpcAdaptor = new rpc_1.RPCAdapterRedis(rpcOptions);
        this.rpc.setup(rpcAdaptor);
        this.rpc.register(rpc_1.METHOD_STATUS, async () => {
            const appUptime = Number(new Date()) - Number(this.appStarted);
            return {
                status: "running",
                app_started: Number(this.appStarted),
                app_uptime: appUptime,
                app_uptime_h: cctz_1.format('%X', Math.round(appUptime / 1000)),
                methods: []
            };
        });
        const aliver = () => {
            this.rpc.notify(rpc_1.SERVICE_DIRECTOR, rpc_1.METHOD_IAMALIVE, { name: this.name });
        };
        setTimeout(aliver, 500);
        setInterval(aliver, 60000);
        this.log.info('Runner setup completed');
    }
}
exports.AppRunner = AppRunner;
//# sourceMappingURL=runner.js.map