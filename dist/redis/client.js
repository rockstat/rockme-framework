"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("redis-fast-driver");
const log_1 = require("../log");
const meter_1 = require("../meter");
class RedisClient {
    constructor(options) {
        this.started = false;
        this.on = (event, func) => {
            this.client.on(event, func);
        };
        const { log, meter, ...config } = options;
        this.log = log ? log.for(this) : new log_1.StubLogger();
        this.meter = meter ? meter : new meter_1.StubMeter();
        const { host, port, db } = config;
        this.log.info('Starting redis client. Server: %s:%s/%d', host, port, db);
        this.client = new Redis(config);
        this.client.on('ready', () => {
            this.log.info('redis ready');
        });
        this.client.on('connect', () => {
            this.log.info('redis connected');
        });
        this.client.on('disconnect', () => {
            this.log.info('redis disconnected');
        });
        this.client.on('reconnecting', (num) => {
            this.log.info('redis reconnecting with attempt #' + num);
        });
        this.client.on('error', (e) => {
            this.log.info('redis error', e);
        });
        this.client.on('end', () => {
            this.log.info('redis closed');
        });
    }
    publish(topic, raw) {
        this.client.rawCall(['publish', topic, raw], (error, msg) => {
            if (error) {
                this.log.error('Redis publish error', error);
            }
        });
    }
    subscribe(channel, func) {
        this.client.rawCall(['subscribe', channel], (error, msg) => {
            if (error) {
                this.log.error('Redis error', error);
                return;
            }
            func(msg);
        });
    }
}
exports.RedisClient = RedisClient;
//# sourceMappingURL=client.js.map