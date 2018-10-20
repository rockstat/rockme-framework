import * as Redis from 'redis-fast-driver';
import { RedisConfig, LoggerType, RedisClientOptions, MeterFacade } from '../types';
import { StubLogger } from '../log';
import { StubMeter } from '../meter';
import { parse as urlParse } from 'url';

export class RedisClient {

  options: RedisConfig;
  log: LoggerType;
  meter: MeterFacade;
  client: Redis;
  started: boolean = false;

  constructor(options: RedisClientOptions) {

    const { log, meter, ...config } = options;

    this.log = log ? log.for(this) : new StubLogger();
    this.meter = meter ? meter : new StubMeter();


    const parts = urlParse(config.dsn)

    // if (parts.hostname && parts.port && parts.path) {
    const host: string = parts.hostname || 'localhost';
    const port: number = Number(parts.port || 6379)
    const db: number = Number((parts.path || '/0x').slice(1))

    this.log.info(`Starting redis client. DSN: ${config.dsn}`);
    this.client = new Redis({ host, port, db });

    //happen only once
    this.client.on('ready', () => {
      this.log.info('redis ready');
    });

    //happen each time when reconnected
    this.client.on('connect', () => {
      this.log.info('redis connected');
    });

    this.client.on('disconnect', () => {
      this.log.info('redis disconnected');
    });

    this.client.on('reconnecting', (num: number) => {
      this.log.info('redis reconnecting with attempt #' + num);
    });

    this.client.on('error', (e: Error) => {
      this.log.info('redis error', e);
    });

    // called on an explicit end, or exhausted reconnections
    this.client.on('end', () => {
      this.log.info('redis closed');
    });
  }

  get(key: string): Promise<string | null> {
    return this.client.rawCallAsync(['GET', key]);
  }

  hgetall(key: string): Promise<Array<string>> {
    return this.client.rawCallAsync(['HGETALL', key]);
  }

  set(key: string, value: string): Promise<any> {
    return this.client.rawCallAsync(['SET', key, value]);
  }

  on = (event: string, func: (...args: any[]) => void) => {
    this.client.on(event, func);
  }

  publish(topic: string, raw: any): void {
    this.client.rawCall(['PUBLISH', topic, raw], (error: Error, msg: any) => {
      if (error) {
        this.log.error('Redis publish error', error);
      }
    })
  }

  subscribe(channel: string, func: Function): void {
    this.client.rawCall(['SUBSCRIBE', channel], (error: Error, msg: Array<string>) => {
      if (error) {
        this.log.error('Redis error', error);
        return;
      }
      func(msg);
    })
  }
}
