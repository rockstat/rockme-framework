/// <reference types="pino" />
import * as pino from 'pino';
import { LogLevel, LogFn, LoggerType, LoggerConfig } from '../types';
export declare class Logger implements LoggerType {
    warn: LogFn;
    fatal: LogFn;
    error: LogFn;
    debug: LogFn;
    info: LogFn;
    trace: LogFn;
    logger: pino.Logger;
    methods: LogLevel[];
    constructor(config: LoggerConfig, instance?: pino.Logger);
    for(object: object): Logger;
    child(config: LoggerConfig): Logger;
}
