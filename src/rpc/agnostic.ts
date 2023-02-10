import { reject, method } from "bluebird";
import { TheIds } from "../ids";
import { RPCAdapter, RPCWaitingCall, RPCRequestOptions } from "../types"
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


  /**
   * Resolve waiting waiter
   * @param id
   * @param result
   * @param call
   */
  resolve(id: string, result: any, call: RPCWaitingCall) {
    this.log.debug('resolve')
    if (call.resolve && result !== undefined) {
      call.timing();
      call.resolve(result);
      this.cleanWaiter(id, call)
    } else {
      call.reject(new Error('Bad params to resolve request'))
    }
  }

  /**
   * Cleaning request state
   * @param id RPC request ID
   * @param call waiter state struct
   */
  cleanWaiter(id: string, call?: RPCWaitingCall) {
    if (call && call.timeout) {
      clearTimeout(call.timeout)
    }
    this.queue[id] = undefined;
  }

  onTimeout = (id: string) => {
    const call = this.queue[id];
    if (call) {
      this.queue[id] = undefined;
      if (call.multi) {
        call.resolve(call.bag);
      }
      else {
        call.reject(new Error('Request timeout'));
      }
      this.cleanWaiter(id);
    } else {
      this.log.error(`onTimeout called but call ${id} not found in stack`);
    }
  }

  async dispatch(msg: RPCResponse | RPCResponseError | RPCRequest): Promise<void> {
    // preparing incoming data
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
        if (res !== undefined) {
          this.publish(res);
        }
        // response can be empty if case of is notification
      })
      return;
    }
    // Handling response
    else if ('id' in msg && msg.id !== undefined && ('result' in msg || 'error' in msg)) {
      this.dispatchResponse(msg)
      return;
    }

    this.log.warn('unhandled message at dispatch', msg);
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
            if (call.services.length === 0 && call.resolve !== undefined) {
              this.resolve(msg.id, call.bag, call);
              this.cleanWaiter(msg.id, call)
            }
          } else if ('error' in msg) {
            this.log.warn(`Received error response from ${msg.from}`, msg);
          } else {
            this.log.warn(`Unknown message struce`, msg);
          }
        } else {
          // unneeded responses
        }
        return;
      }
      // single requests
      else {
        if ('result' in msg && call.resolve !== undefined) {
          this.resolve(msg.id, msg.result, call);
          return;
        }
        else if ('error' in msg && call.reject) {
          this.meter.tick('rpc.error')
          this.log.warn('rpc error')
          call.reject(msg.error);
          return;
        }
      }
    }
    this.log.warn('unhandled message at dispatchResponse', { msg, call });
  }

  /**
   * Low-level function for send messages
   * @param msg RPC-compatible message
   */
  publish(msg: RPCRequest | RPCResponse | RPCResponseError): void {
    if ('method' in msg && msg.method !== undefined) {
      msg.method = `${msg.to}:${msg.method}:${this.name}`;
    }
    this.adapter.send(msg.to, msg)
  }

  /**
   * Send notification to remote service(s)
   * @param target target service or channel
   * @param method remote method to call
   * @param params remote method params
   */
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

  /**
   * Execute remote function(s)
   * @param target target service or channel
   * @param method remote method to call
   * @param params remote method params
   * @param services services list for answer waiting
   */
  request<T>(target: string, method: string, params: RPCRequestParams = null, options: RPCRequestOptions = {}): Promise<T> {
    return new Promise<any>((resolve, reject) => {
      const id = this.ids.round();
      // if destination services is empty do not send request
      if (options.services && options.services.length == 0) {
        return resolve(null);
      }
      // fill services for simple request
      options.services = options.services || [];
      const multi = options.services.length > 0;
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
        services: options.services,
        timing: this.meter.timenote('rpc.request', { target, method }),
        params: params,
        timeout: setTimeout(() => this.onTimeout(id), options.timeout || this.timeout)
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

