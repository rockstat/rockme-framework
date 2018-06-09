export type Envs = 'dev' | 'prod' | 'stage';

import { RPCConfig } from './rpc'
import { RedisConfig } from './redis'
import { LoggerConfig } from './log'
import { MeterConfig } from './meter';

export type AnyConfig = { [k: string]: any };


export type AbstractConfig<T> = T & ImplicitConfig & AnyConfig;

export type ConfigRoot = ImplicitConfig & AnyConfig;

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
