import {
  AgnosticRPCOptions,
  RedisClientType,
  LoggerType
} from "../../types";
import * as EventEmitter from 'eventemitter3';
import { RPCAdapter } from '../../types';
import { StubLogger } from "../../log";

type MsgReceiver = (data: any) => void;
type ReceiverObject = {
  dispatch: MsgReceiver
}

export class RPCAdapterRedis extends EventEmitter implements RPCAdapter {

  rsub: RedisClientType;
  rpub: RedisClientType;

  options: AgnosticRPCOptions;

  log: LoggerType;
  started: boolean;

  // receiver: MsgReceiver = (data) => {
  //   throw new Error('Adapter not attached');
  // };

  constructor(options: AgnosticRPCOptions) {
    super();
    this.options = options;
    const {
      redisFactory,
      channels,
      log
    } = options;

    this.log = log ? log.for(this) : new  StubLogger();
    this.rsub = redisFactory.create();

    this.rsub.on('connect', () => {
      for (const chan of channels) {
        this.rsub.subscribe(chan, this.redisMsg);
      }
    })

    this.rpub = redisFactory.create();
    this.log.info('started');
  }

  // setReceiver<K extends keyof ReceiverObject>(obj: ReceiverObject, fname: K): void {
  //   this.receiver = obj[fname];
  // }

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
    this.log.debug('\n <---', raw)
    this.rpub.publish(to, raw);
  }

  redisMsg = (redismsg: Array<string>) => {

    if (redismsg[0] === 'message' || redismsg[0] === 'pmessage') {
      const raw = redismsg[redismsg.length - 1];
      this.log.debug('\n --> ', raw);
      const msg = this.decode(raw);
      if (msg && msg.jsonrpc === '2.0') {
        // this.receiver(msg);
        this.emit('message', msg);
      }

    } else {
      this.log.warn('unhandled cmd', redismsg);
    }
  }


}
