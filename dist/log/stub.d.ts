import { LoggerType, LogFn, LoggerConfig } from "../types";
export declare class StubLogger implements LoggerType {
    debug: LogFn;
    info: LogFn;
    warn: LogFn;
    error: LogFn;
    trace: LogFn;
    fatal: LogFn;
    for(fn: Function): LoggerType;
    child(options: LoggerConfig): LoggerType;
}
