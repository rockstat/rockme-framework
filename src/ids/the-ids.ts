import { IdGenShowFlake } from './snow_flake';
import { IdGenRoundCounter } from './round_counter';
import { hash64 } from 'xxhash';
import { Uint64BE } from 'int64-buffer'

export const xxhash = (str: string): string => {
  const buff = hash64<Buffer>(Buffer.from(str), 0xCACA3ADA, 'buffer')
  return new Uint64BE(buff).toString()
}


export class TheIds {

  sf: IdGenShowFlake;
  rpcCounter: IdGenRoundCounter;
  // log: Logger;

  constructor(datacenter?: number, worker?: number) {

    // this.log = Container.get(Logger).for(this);
    // this.log.info('Starting');
    // console.log('TheIds conf', config)
    const confDatacenter = process.env['DATACENTER_ID'] && Number(process.env['DATACENTER_ID']) || 1;
    const confWorker = process.env['WORKER_ID'] && Number(process.env['WORKER_ID']) || 1;

    this.sf = new IdGenShowFlake(confDatacenter, confWorker);
    this.rpcCounter = new IdGenRoundCounter();

    console.log('IdGenShowFlake', { confDatacenter, confWorker})

  }

  flake(): string {
    return this.sf.take();
  }

  round(): string {
    return this.rpcCounter.take().toString(36);
  }

  xxhash(str: string): string {
    return xxhash(str);
  }

  static SInt64ToBase64(str: string): string {
    return new Uint64BE(str, 10).toBuffer().toString('base64')
  }

}
