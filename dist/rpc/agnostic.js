"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ids_1 = require("../ids");
const log_1 = require("../log");
const meter_1 = require("../meter");
const RPC20 = '2.0';
class RPCAgnostic {
    constructor(options) {
        this.started = false;
        this.timeout = 2000;
        this.queue = {};
        this.methods = {};
        const { name, listen_all, listen_direct, log, meter } = options;
        this.ids = new ids_1.TheIds();
        this.name = name;
        this.listen_all = listen_all;
        this.listen_direct = listen_direct;
        this.log = log ? log : new log_1.StubLogger();
        this.meter = meter ? meter : new meter_1.StubMeter();
    }
    setup(adapter) {
        this.adapter = adapter;
        this.adapter.on('message', (msg) => {
            this.dispatch(msg);
        });
        this.log.info('started');
    }
    publish(msg) {
        if ('method' in msg && msg.method !== undefined) {
            msg.method = `${msg.to}:${msg.method}:${this.name}`;
        }
        this.adapter.send(msg.to, msg);
    }
    async dispatch(msg) {
        if ('method' in msg && msg.method !== undefined) {
            const names = msg.method.split(':');
            if (names.length === 3) {
                msg.to = names[0];
                msg.method = names[1];
                msg.from = names[2];
            }
        }
        if ('method' in msg && msg.method !== undefined && msg.to && msg.params !== undefined && msg.method in this.methods) {
            this.dispatchRequest(msg).then(res => {
                if (res) {
                    this.publish(res);
                }
            });
        }
        else if ('id' in msg && msg.id !== undefined && ('result' in msg || 'error' in msg)) {
            this.dispatchResponse(msg);
        }
    }
    async dispatchResponse(msg) {
        const call = this.queue[msg.id];
        if (call) {
            if (call.timeout) {
                clearTimeout(call.timeout);
            }
            if ('result' in msg && call.resolve) {
                call.timing();
                call.resolve(msg.result);
            }
            if ('error' in msg && call.reject) {
                this.meter.tick('rpc.error');
                call.reject(msg.error);
            }
            this.queue[msg.id] = undefined;
        }
    }
    async dispatchRequest(msg) {
        const { method, from } = msg;
        try {
            const result = await this.methods[method](msg.params || {});
            if ('id' in msg && msg.id !== undefined) {
                return {
                    jsonrpc: RPC20,
                    id: msg.id,
                    from: this.name,
                    to: from,
                    result: result || null
                };
            }
        }
        catch (error) {
            return this.wrapError(msg, error);
            this.log.error('handler exec error', error);
        }
    }
    notify(service, method, params = null) {
        const msg = {
            jsonrpc: RPC20,
            from: this.name,
            to: service,
            method: method,
            params: params
        };
        this.publish(msg);
    }
    request(service, method, params = null) {
        return new Promise((resolve, reject) => {
            const id = this.ids.round();
            const msg = {
                jsonrpc: RPC20,
                from: this.name,
                to: service,
                id: id,
                method: method,
                params: params || null
            };
            this.queue[id] = {
                resolve,
                reject,
                timing: this.meter.timenote('rpc.request', { service, method }),
                timeout: setTimeout(() => {
                    const call = this.queue[id];
                    if (call) {
                        this.queue[id] = undefined;
                        call.reject(new Error('Reuest timeout'));
                    }
                }, this.timeout)
            };
            this.publish(msg);
        });
    }
    register(method, func) {
        this.methods[method] = func;
    }
    wrapError(msg, error, code) {
        if ('id' in msg && msg.id !== undefined) {
            return {
                id: msg.id,
                from: this.name,
                to: msg.from,
                jsonrpc: RPC20,
                error: {
                    code: code || 0,
                    message: error.message,
                    data: error.stack || {}
                }
            };
        }
    }
}
exports.RPCAgnostic = RPCAgnostic;
//# sourceMappingURL=agnostic.js.map