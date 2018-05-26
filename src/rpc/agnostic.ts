import { reject, method } from "bluebird";
import { TheIds } from "../ids";
import { RPCAdapter } from "../types"
import { StubLogger } from '../log'
import { StubMeter } from '../meter'

import {
  AgnosticRPCOptions,
  RPCWaitingCalls,
  RpcMethods,
  LoggerType,
  RPCRequest,
  RPCResponse,
  RPCResponseError,
  RPCRequestParams,
  MeterFacade,
  RequestHandler
} from "../types";

const RPC20 = '2.0';

export class RPCAgnostic {

  ids: TheIds;
  meter: MeterFacade;
  started: boolean = false;
  timeout: number = 2000;
  log: LoggerType;
  queue: RPCWaitingCalls = {};
  methods: RpcMethods = {};
  adapter: RPCAdapter;
  listen_direct: boolean;
  listen_all: boolean;
  name: string;

  constructor(options: AgnosticRPCOptions) {
    const { name, listen_all, listen_direct, log, meter } = options;
    this.ids = new TheIds();
    this.name = name;
    this.listen_all = listen_all;
    this.listen_direct = listen_direct;
    this.log = log ? log : new StubLogger();
    this.meter = meter ? meter : new StubMeter();
  }

  setup(adapter: RPCAdapter) {
    this.adapter = adapter;
    this.adapter.on('message', (msg) => {
      this.dispatch(msg)
    })
    this.log.info('started');
  }

  publish(msg: RPCRequest | RPCResponse | RPCResponseError): void {
    if ('method' in msg && msg.method !== undefined) {
      msg.method = `${msg.to}:${msg.method}:${this.name}`;
    }
    this.adapter.send(msg.to, msg)
  }

  async dispatch(msg: RPCResponse | RPCResponseError | RPCRequest): Promise<void> {

    if ('method' in msg && msg.method !== undefined) {
      const names = msg.method.split(':');
      if (names.length === 3) {
        msg.to = names[0];
        msg.method = names[1];
        msg.from = names[2];
      }
    }
    // Handling request
    if ('method' in msg && msg.method !== undefined && msg.to && msg.params !== undefined) {
      this.dispatchRequest(msg).then(res => {
        if (res) {
          this.publish(res);
        }
      })
    }
    // Handling response
    else if ('id' in msg && msg.id !== undefined && ('result' in msg || 'error' in msg)) {
      this.dispatchResponse(msg)
    }
  }

  async dispatchResponse(msg: RPCResponse | RPCResponseError): Promise<void> {
    const call = this.queue[msg.id];
    if (call) {
      if (call.timeout) {
        clearTimeout(call.timeout)
      }
      if ('result' in msg && call.resolve) {
        call.timing();
        call.resolve(msg.result);
      }
      if ('error' in msg && call.reject) {
        this.meter.tick('rpc.error')
        call.reject(msg.error);
      }
      this.queue[msg.id] = undefined;
    }
  }

  async dispatchRequest(msg: RPCRequest): Promise<RPCResponse | RPCResponseError | undefined> {
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
        }
      }
    } catch (error) {
      return this.wrapError(msg, error);
      this.log.error('handler exec error', error);
    }
  }

  notify(service: string, method: string, params: RPCRequestParams = null): void {
    const msg: RPCRequest = {
      jsonrpc: RPC20,
      from: this.name,
      to: service,
      method: method,
      params: params
    }
    this.publish(msg)
  }

  request<T>(service: string, method: string, params: RPCRequestParams = null): Promise<T> {
    return new Promise<any>((resolve, reject) => {
      const id = this.ids.round();
      const msg: RPCRequest = {
        jsonrpc: RPC20,
        from: this.name,
        to: service,
        id: id,
        method: method,
        params: params || null
      }
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
      this.publish(msg)
    })
  }

  register<T>(method: string, func: RequestHandler<T>): void {
    this.methods[method] = func;
  }

  wrapError(msg: RPCRequest, error: Error, code?: number): RPCResponseError | undefined {
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
      }
    }
  }
}

