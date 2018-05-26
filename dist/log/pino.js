"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pino = require("pino");
class Logger {
    constructor(config, instance) {
        this.methods = ['trace', 'info', 'debug', 'warn', 'error', 'fatal'];
        const pinoConig = config.pino;
        this.logger = instance && instance.child(pinoConig) || pino(pinoConig);
        for (const method of this.methods) {
            this[method] = this.logger[method].bind(this.logger);
        }
    }
    for(object) {
        const pinoConfig = {
            name: object.constructor.name
        };
        return this.child({ pino: pinoConfig });
    }
    child(config) {
        return new Logger(config, this.logger);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=pino.js.map