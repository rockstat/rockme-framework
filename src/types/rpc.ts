
import { MeterFacade } from "./meter";
import { RedisFactoryType } from "./redis";
import { Logger } from "../log";

// RPC

export interface RPCRequestHandler {
  (arg: any): void;
}

export type RequestHandler<T> = (params: T) => any;

export interface RpcMethods {
  [k: string]: RequestHandler<any>;
}

export interface RPCAdapter {
  send(to: string, msg: any): void;
  on(event: string, fn: RPCRequestHandler, context?: any): this;
}

export interface RPCRegisterStruct {
  methods?: Array<[string, string, string]>
}


export interface RPCRegisterHandler {
  (params: RPCRegisterStruct): any
}

export interface RPCBase {
  jsonrpc: '2.0';
  to: string;
  from: string;
}

export type RPCRequestParams = { [k: string]: any } | null;

export interface RPCRequest extends RPCBase {
  id?: string;
  method: string;
  params: RPCRequestParams;
}

export interface RPCRequestOptions {
  timeout?: number;
  services?: string[];
}

export interface RPCResponse extends RPCBase {
  id: string;
  result: any;
  cache?: number;
}

export interface RPCErrorDetails {
  message: string;
  code: number;
  data?: any;
}

export interface RPCResponseError extends RPCBase {
  id: string;
  error: RPCErrorDetails;
}

export interface RPCWaitingCall {
  resolve: (value?: any | PromiseLike<any>) => void;
  reject: (reason?: any) => void;
  timing: Function;
  timeout: NodeJS.Timer;
  params: RPCRequestParams;
  multi: boolean;
  bag: { [k: string]: any };
  services: string[];
}

// export type RPCWaitingCalls = { [k: string]: RPCWaitingCall | undefined };

export type RPCWaitingCalls = Map<string, RPCWaitingCall | undefined>;



export interface RPCConfig {
  name: string;
  listen_all?: boolean;
  listen_enrich?: boolean;
  listen_direct?: boolean;
}


export interface AgnosticRPCOptions extends RPCConfig {
  redisFactory: RedisFactoryType;
  channels: Array<string>;
  log?: Logger;
  meter?: MeterFacade;
}

