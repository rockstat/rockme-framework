import { format as dateFormat } from 'cctz';

import {
  Meter
} from '../meter';
import {
  RedisFactory,
} from '../redis';
import {
  TheIds,
} from '../ids';
import {
  AppConfig,
} from '../config';
import {
  Logger,
} from '../log';
import {
  RPCAdapterRedis,
  RPCAgnostic,
  BROADCAST,
  METHOD_STATUS,
  SERVICE_DIRECTOR,
  METHOD_IAMALIVE
} from '../rpc';
import {
  AgnosticRPCOptions,
  RPCAdapter,
  ConfigRoot
} from '../types';



export class Deps<T> {
  log: Logger;
  id: TheIds;
  config: AppConfig<T>;
  meter: Meter;
  rpc: RPCAgnostic;
  redisFactory: RedisFactory;
  constructor(obj: {
      config: AppConfig<ConfigRoot>,
      log: Logger,
      meter: Meter,
      ids: TheIds,
      rpc: RPCAgnostic
    }) {
    Object.assign(this, obj);
  }
}



export class AppRunner<T> {
  log: Logger;
  deps: Deps<T>;
  ids: TheIds;
  meter: Meter;
  config: AppConfig<ConfigRoot>
  name: string;
  rpcAdaptor: RPCAdapter;
  rpc: RPCAgnostic;
  appStarted: Date = new Date();

  constructor() {
    this.config = new AppConfig<ConfigRoot>();
    this.log = new Logger(this.config.log).for(this);
    this.meter = new Meter(this.config.meter);
    this.ids = new TheIds();
    this.name = this.config.rpc.name;
    this.log.info('Starting service');
  }

  /**
   * Required remote functuins
   */
  async setup() {

    // setup Redis
    const redisFactory = this.deps.redisFactory = new RedisFactory({ log: this.log, meter: this.meter, ...this.config.redis });

    // Setup RPC
    const channels: Array<string> = [];
    if (this.config.rpc.listen_all) {
      channels.push(BROADCAST);
    }

    if (this.config.rpc.listen_direct) {
      channels.push(this.name);
    }

    const rpcOptions: AgnosticRPCOptions = {
      channels,
      redisFactory,
      log: this.log,
      meter: this.meter,
      ...this.config.rpc
    };

    this.rpc = new RPCAgnostic(rpcOptions);

    const rpcAdaptor = new RPCAdapterRedis(rpcOptions);
    this.rpc.setup(rpcAdaptor);

    this.rpc.register(METHOD_STATUS, async () => {
      const appUptime = Number(new Date()) - Number(this.appStarted);
      return {
        status: "running",
        app_started: Number(this.appStarted),
        app_uptime: appUptime,
        app_uptime_h: dateFormat('%X', Math.round(appUptime / 1000)),
        methods: []
      };
    });
    const aliver = () => {
      this.rpc.notify(SERVICE_DIRECTOR, METHOD_IAMALIVE, { name: this.name })
    };

    setTimeout(aliver, 500);
    setInterval(aliver, 60000);
    this.log.info('Runner setup completed')
  }


}

