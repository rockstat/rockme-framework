import { IdGenShowFlake } from './snow_flake';
import { IdGenRoundCounter } from './round_counter';
import { hash64 } from 'xxhash';
import { Uint64BE } from 'int64-buffer'


export class TheIds {

  sf: IdGenShowFlake;
  rpcCounter: IdGenRoundCounter;

  constructor() {
    this.sf = new IdGenShowFlake();
    this.rpcCounter = new IdGenRoundCounter();
  }

  flake(): string {
    return this.sf.take();
  }

  round(): string {
    return this.rpcCounter.take().toString(36);
  }

  xxhash(str: string): string {
    const buff = hash64<Buffer>(Buffer.from(str), 0xCACA3ADA, 'buffer')
    return new Uint64BE(buff).toString()
  }

  static SInt64ToBase64(str: string): string {
    return new Uint64BE(str, 10).toBuffer().toString('base64')
  }

}
