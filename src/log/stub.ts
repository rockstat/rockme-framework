import { LoggerType, LogFn, LoggerConfig } from "../types";

export class StubLogger implements LoggerType {
  debug: LogFn = (...args: any[]) => { };
  info: LogFn = (...args: any[]) => { };
  warn: LogFn = (...args: any[]) => { };
  error: LogFn = (...args: any[]) => { };
  trace: LogFn = (...args: any[]) => { };
  fatal: LogFn = (...args: any[]) => { };
  for(fn: Function): LoggerType {
    return new StubLogger();
  }
  child(options: LoggerConfig): LoggerType {
    return new StubLogger();
  };
}
