import { readFileSync } from 'fs';
import { loadAll } from 'js-yaml';
import { render as ejsRender } from 'ejs';
import { sync as globSync } from 'glob';
import * as dotenv from 'dotenv';
import * as mergeOptions from 'merge-options';
import {
  ENV_PROD,
  ENV_STAGE,
  ENV_DEV
} from './constants';
import * as consts from './constants';
import {
  ConfigRoot,
  AppConfigOptions,
  ImplicitConfig,
  AbstractConfig,
  Envs
} from '../types';
dotenv.config();
dotenv.config({ path: '.env.local' });

export class AppConfig<T> {

  configDir: string = './config';
  config: AbstractConfig<T>;
  env: Envs;

  get identify() { return this.get('identify'); }
  get http() { return this.get('http'); }
  get ws() { return this.get('websocket'); }
  get log() { return this.get('log'); }
  get static() { return this.get('static'); }
  get redis() { return this.get('redis'); }
  get client() { return this.get('client'); }
  get meter() { return this.get('metrics'); }
  get rpc() { return this.get('rpc'); }

  /**
   * Reading all accessible configuration files including custom
   */
  constructor(options: AppConfigOptions = {}) {
    this.config = this.load(options);
    this.env = this.config.env = AppConfig.env;
  }

  load(options: AppConfigOptions): AbstractConfig<T> {
    const parts = globSync(
      `${this.configDir}/**/*.yml`, { nosort: true }
    ).map(file => readFileSync(file).toString());
    const tmplData = {
      env: process.env,
      envName: AppConfig.env,
      consts,
      ...(options.vars || {})
    }
    const yaml = ejsRender(parts.join('\n'), tmplData, { async: false });
    const docs = loadAll(yaml).filter(cfg => cfg !== null && cfg !== undefined)
    const { dev, prod, ...common } = mergeOptions({}, ...<object[]>docs);
    return mergeOptions(common, this.isProd() ? prod : dev);
  }

  get<K extends keyof AbstractConfig<T>>(section: K): AbstractConfig<T>[K] {
    return this.config[section]
  }

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

