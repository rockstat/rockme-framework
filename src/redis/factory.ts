import { RedisClient } from "../redis";
import { RedisClientOptions, RedisFactoryType } from "../types";


export class RedisFactory implements RedisFactoryType {
  options: RedisClientOptions;

  constructor(options: RedisClientOptions) {
    this.options = options;
  }

  create(): RedisClient {
    return new RedisClient(this.options)
  }
}
