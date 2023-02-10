import {
  AgnosticRPCOptions,
  RedisClientType,
  LoggerType
} from "../../types";
import { EventEmitter } from 'eventemitter3';
import { RPCAdapter } from '../../types';
import { StubLogger } from "../../log";

export class RPCAdapterRedis extends EventEmitter implements RPCAdapter {

  options: AgnosticRPCOptions;
  started: boolean;
  rsub: RedisClientType;
  rpub: RedisClientType;
  log: LoggerType;

  constructor(options: AgnosticRPCOptions) {
    super();
    this.options = options;
    const {
      redisFactory,
      channels,
      log
    } = options;

    this.log = log ? log.for(this) : new StubLogger();
    this.rsub = redisFactory.create();

    this.rsub.on('connect', () => {
      for (const chan of channels) {
        this.rsub.subscribe(chan, this.redisMsg);
      }
    })

    this.rpub = redisFactory.create();
    this.log.info('started');
  }

  private decode(raw: string): any {
    try {
      return JSON.parse(raw);
    } catch (error) {
      this.log.error('Redis decode payload error', error);
      return;
    }
  }

  private encode(data: any): string | void {
    try {
      return JSON.stringify(data);
    } catch (error) {
      this.log.error('Redis encode payload error', error);
      return;
    }
  }

  send(to: string, msg: any): void {
    const raw = this.encode(msg);
    this.rpub.publish(to, raw);
  }

  redisMsg = (redismsg: Array<string>) => {
    if (redismsg[0] === 'message' || redismsg[0] === 'pmessage') {
      const raw = redismsg[redismsg.length - 1];
      const msg = this.decode(raw);
      if (msg && msg.jsonrpc === '2.0') {
        this.emit('message', msg);
      }
    } else {
      this.log.debug('unhandled cmd', redismsg);
    }
  }


}
