import { reject, method } from "bluebird";
import { TheIds } from "../ids";
import { RPCAdapter, RPCWaitingCall } from "../types"
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
  timeout: number;
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
    this.timeout = 200;
    this.listen_all = listen_all || false;
    this.listen_direct = listen_direct || true;
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
    if ('method' in msg && msg.method !== undefined && msg.to && msg.params !== undefined && msg.method in this.methods) {
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

  /**
   * Resolve waiting waiter
   * @param id
   * @param result
   * @param call
   */
  resolve(id: string, result: any, call: RPCWaitingCall) {
    if (call.resolve && result) {
      call.timing();
      call.resolve(result);
    }
  }

  /**
   * Cleaning request state
   * @param id RPC request ID
   * @param call waiter state struct
   */
  cleanWaiter(id: string, call: RPCWaitingCall) {
    if (call.timeout) {
      clearTimeout(call.timeout)
    }
    this.queue[id] = undefined;
  }

  async dispatchResponse(msg: RPCResponse | RPCResponseError): Promise<void> {
    const call = this.queue[msg.id];
    if (call) {
      // handling multi-destination request
      if (call.multi) {
        const idx = call.services.indexOf(msg.from);
        if (idx >= 0) {
          call.services.splice(idx, 1)
          if ('result' in msg) {
            call.bag[msg.from] = msg.result;
            // complete
            if (call.services.length === 0 && call.resolve) {
              this.resolve(msg.id, call.bag, call);
              this.cleanWaiter(msg.id, call)
            }
          }
        }

      }
      // single requests
      else {
        if ('result' in msg && call.resolve) {
          this.resolve(msg.id, msg.result, call);
        }
        if ('error' in msg && call.reject) {
          this.meter.tick('rpc.error')
          call.reject(msg.error);
        }
        this.cleanWaiter(msg.id, call)
      }
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

  notify(target: string, method: string, params: RPCRequestParams = null): void {
    const msg: RPCRequest = {
      jsonrpc: RPC20,
      from: this.name,
      to: target,
      method: method,
      params: params
    }
    this.publish(msg)
  }

  request<T>(target: string, method: string, params: RPCRequestParams = null, services?: string[]): Promise<T> {
    return new Promise<any>((resolve, reject) => {
      const id = this.ids.round();
      // if destination services is empty do not send request
      if (services && services.length == 0) {
        return resolve();
      }
      // fill services for simple request
      services = services || [];
      const multi = services.length > 0;
      const msg: RPCRequest = {
        jsonrpc: RPC20,
        from: this.name,
        to: target,
        id: id,
        method: method,
        params: params || null
      }
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

