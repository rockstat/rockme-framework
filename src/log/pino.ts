import pino from 'pino';

import { LogLevel, LogFn, LoggerType, LoggerConfig } from '../types';

export class Logger implements LoggerType {

  warn: LogFn;
  fatal: LogFn;
  error: LogFn;
  debug: LogFn;
  info: LogFn;
  trace: LogFn;

  // debug: LogFn = (...args: any[]) => { };
  // info: LogFn = (...args: any[]) => { };
  // warn: LogFn = (...args: any[]) => { };
  // error: LogFn = (...args: any[]) => { };
  // trace: LogFn = (...args: any[]) => { };
  // fatal: LogFn = (...args: any[]) => { };

  logger: pino.Logger;

  methods: LogLevel[] = ['trace', 'info', 'debug', 'warn', 'error', 'fatal'];

  constructor(config: LoggerConfig, instance?: pino.Logger) {
    const pinoConig = config.pino;
    this.logger = instance && instance.child(pinoConig) || pino(pinoConig);
    for (const method of this.methods) {
      this[method as LogLevel] = this.logger[method].bind(this.logger);
    }
  }

  for(object: object): Logger {
    const pinoConfig = {
      name: object.constructor.name
    };
    return this.child({ pino: pinoConfig });
  }

  child(config: LoggerConfig): Logger {
    return new Logger(config, this.logger);
  }
}
