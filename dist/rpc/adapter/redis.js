"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("eventemitter3");
const log_1 = require("../../log");
class RPCAdapterRedis extends EventEmitter {
    constructor(options) {
        super();
        this.redisMsg = (redismsg) => {
            if (redismsg[0] === 'message' || redismsg[0] === 'pmessage') {
                const raw = redismsg[redismsg.length - 1];
                const msg = this.decode(raw);
                this.log.debug(msg, ' --> ');
                if (msg && msg.jsonrpc === '2.0') {
                    this.emit('message', msg);
                }
            }
            else {
                this.log.warn('unhandled cmd', redismsg);
            }
        };
        this.options = options;
        const { redisFactory, channels, log } = options;
        this.log = log ? log.for(this) : new log_1.StubLogger();
        this.rsub = redisFactory.create();
        this.rsub.on('connect', () => {
            for (const chan of channels) {
                this.rsub.subscribe(chan, this.redisMsg);
            }
        });
        this.rpub = redisFactory.create();
        this.log.info('started');
    }
    decode(raw) {
        try {
            return JSON.parse(raw);
        }
        catch (error) {
            this.log.error('Redis decode payload error', error);
            return;
        }
    }
    encode(data) {
        try {
            return JSON.stringify(data);
        }
        catch (error) {
            this.log.error('Redis encode payload error', error);
            return;
        }
    }
    send(to, msg) {
        const raw = this.encode(msg);
        this.log.debug(msg, '<---');
        this.rpub.publish(to, raw);
    }
}
exports.RPCAdapterRedis = RPCAdapterRedis;
//# sourceMappingURL=redis.js.map