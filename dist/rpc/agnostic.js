"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ids_1 = require("../ids");
const log_1 = require("../log");
const meter_1 = require("../meter");
const RPC20 = '2.0';
class RPCAgnostic {
    constructor(options) {
        this.started = false;
        this.timeout = 1000;
        this.queue = {};
        this.methods = {};
        const { name, listen_all, listen_direct, log, meter } = options;
        this.ids = new ids_1.TheIds();
        this.name = name;
        this.listen_all = listen_all || false;
        this.listen_direct = listen_direct || true;
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
    resolve(id, result, call) {
        if (call.resolve && result) {
            call.timing();
            call.resolve(result);
        }
    }
    cleanWaiter(id, call) {
        if (call.timeout) {
            clearTimeout(call.timeout);
        }
        this.queue[id] = undefined;
    }
    async dispatchResponse(msg) {
        const call = this.queue[msg.id];
        if (call) {
            if (call.multi) {
                const idx = call.services.indexOf(msg.from);
                if (idx >= 0) {
                    call.services.splice(idx, 1);
                    if ('result' in msg) {
                        call.bag[msg.from] = msg.result;
                        if (call.services.length === 0 && call.resolve) {
                            this.resolve(msg.id, call.bag, call);
                            this.cleanWaiter(msg.id, call);
                        }
                    }
                }
            }
            else {
                if ('result' in msg && call.resolve) {
                    this.resolve(msg.id, msg.result, call);
                }
                if ('error' in msg && call.reject) {
                    this.meter.tick('rpc.error');
                    call.reject(msg.error);
                }
                this.cleanWaiter(msg.id, call);
            }
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
    notify(target, method, params = null) {
        const msg = {
            jsonrpc: RPC20,
            from: this.name,
            to: target,
            method: method,
            params: params
        };
        this.publish(msg);
    }
    request(target, method, params = null, services) {
        return new Promise((resolve, reject) => {
            const id = this.ids.round();
            if (services && services.length == 0) {
                return resolve();
            }
            services = services || [];
            const multi = services.length > 0;
            const msg = {
                jsonrpc: RPC20,
                from: this.name,
                to: target,
                id: id,
                method: method,
                params: params || null
            };
            this.queue[id] = {
                resolve,
                reject,
                bag: {},
                multi: multi,
                services: services,
                timing: this.meter.timenote('rpc.request', { target, method }),
                params: params,
                timeout: setTimeout(() => {
                    const call = this.queue[id];
                    if (call) {
                        this.queue[id] = undefined;
                        if (call.multi) {
                            call.resolve(call.bag);
                        }
                        else {
                            call.reject(new Error('Reuest timeout'));
                        }
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