
export interface PinoConfig {
  name?: string;
  safe?: boolean;
  level?: string;
  prettyPrint?: boolean;
}

export interface LoggerConfig {
  pino: PinoConfig;
  logger?: LoggerType;
}

export interface LogFn {
  (msg: string, ...args: any[]): void;
  (obj: object, msg?: string, ...args: any[]): void;
}

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

export type LoggerType = LoggerMethods & LogLevels;

export type LogLevels = {
  [key in LogLevel]: LogFn;
}

export interface LoggerMethods {
  logger?: any;
  child:  (options: LoggerConfig) => LoggerType;
}
