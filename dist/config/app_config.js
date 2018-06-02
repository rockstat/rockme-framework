"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const ejs_1 = require("ejs");
const glob_1 = require("glob");
const dotenv = require("dotenv");
const mergeOptions = require("merge-options");
const constants_1 = require("./constants");
dotenv.config();
dotenv.config({ path: '.env.local' });
class AppConfig {
    /**
     * Reading all accessible configuration files including custom
     */
    constructor(options = {}) {
        this.configDir = './config';
        this.ejsConfig = {};
        const parts = glob_1.sync(`${this.configDir}/**/*.yml`, { nosort: true })
            .map(file => fs_1.readFileSync(file).toString());
        const yaml = ejs_1.render(parts.join('\n'), { env: process.env, ...(options.vars || {}) }, this.ejsConfig);
        this.config = mergeOptions({}, ...js_yaml_1.safeLoadAll(yaml).filter(cfg => cfg !== null && cfg !== undefined));
        this.env = this.config.env = AppConfig.env;
    }
    get identify() { return this.get('identify'); }
    get http() { return this.get('http'); }
    get ws() { return this.get('websocket'); }
    get log() { return this.get('log'); }
    get static() { return this.get('static')[this.env]; }
    get redis() { return this.get('redis'); }
    get client() { return this.get('client'); }
    get meter() { return this.get('metrics'); }
    get rpc() { return this.get('rpc'); }
    get(section) {
        return this.config[section];
    }
    isDev() {
        return this.env === constants_1.ENV_DEV;
    }
    isProd() {
        return this.env === constants_1.ENV_PROD;
    }
    static get env() {
        switch (process.env.NODE_ENV) {
            case 'production':
            case 'prod':
                return constants_1.ENV_PROD;
            case 'stage':
                return constants_1.ENV_STAGE;
            default:
                return constants_1.ENV_DEV;
        }
    }
}
exports.AppConfig = AppConfig;
//# sourceMappingURL=app_config.js.map