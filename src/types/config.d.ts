export type Envs = 'dev' | 'prod' | 'stage';

import { RPCConfig } from './rpc'
import { RedisConfig } from './redis'
import { LoggerConfig } from './log'
import { MeterConfig } from './meter';

export type ConfigRoot = ImplicitConfig & { [k: string]: any };

export interface ImplicitConfig {
  env: Envs;
  name: string;
  redis: RedisConfig;
  log: LoggerConfig;
  metrics: MeterConfig;
  rpc: RPCConfig;
}

export interface AppConfigOptions {
  dir?: string;
  vars?: { [k: string]: any }
}
