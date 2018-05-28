import { readFileSync } from 'fs';
import { safeLoadAll } from 'js-yaml';
import { render as ejsRender, Options as EjsOptions } from 'ejs';
import { sync as globSync } from 'glob';
import * as dotenv from 'dotenv';
import * as mergeOptions from 'merge-options';
import {
  ENV_PROD,
  ENV_STAGE,
  ENV_DEV
} from './constants';
import {
  ConfigRoot,
  ImplicitConfig,
  RedisConfig,
  AppConfigOptions
} from '../types';
import { Envs, LoggerConfig, MeterConfig, RPCConfig } from '../types';

dotenv.config();
dotenv.config({ path: '.env.local' });

export class AppConfig<T> {

  configDir: string = './config';
  config: ConfigRoot;
  env: Envs;
  ejsConfig: EjsOptions = {}

  get identify() { return this.get('identify'); }
  get http() { return this.get('http'); }
  get ws() { return this.get('websocket'); }
  get log() { return this.get('log'); }
  get static() { return this.get('static')[this.env]; }
  get redis() { return this.get('redis'); }
  get client() { return this.get('client'); }
  get meter() { return this.get('metrics'); }
  get rpc() { return this.get('rpc'); }

  /**
   * Reading all accessible configuration files including custom
   */
  constructor(options: AppConfigOptions = {}) {
    const parts = globSync(`${this.configDir}/**/*.yml`, { nosort: true })
      .map(file => readFileSync(file).toString());

    const yaml = ejsRender(parts.join('\n'), { env: process.env, ...(options.vars || {}) }, this.ejsConfig);

    this.config = mergeOptions({}, ...<object[]>safeLoadAll(yaml).filter(cfg => cfg !== null && cfg !== undefined));
    this.env = this.config.env = AppConfig.env;
  }

  get<K extends keyof N, N extends T & ConfigRoot>(section: K): N[K] {
    return this.config[section];
  }

  // get<S extends keyof Config>(section: S): Config[S] {
  //   return this.config[section];
  // }

  isDev(): boolean {
    return this.env === ENV_DEV;
  }

  isProd(): boolean {
    return this.env === ENV_PROD;
  }

  static get env(): Envs {
    switch (process.env.NODE_ENV) {
      case 'production':
      case 'prod':
        return ENV_PROD;
      case 'stage':
        return ENV_STAGE;
      default:
        return ENV_DEV;
    }
  }

}

