import * as FlakeIdGen from 'flake-idgen';
import { Uint64BE } from 'int64-buffer'

export class IdGenShowFlake {

  idGen: FlakeIdGen;

  constructor(datacenter?: number, worker?: number) {
    datacenter = datacenter || 1;
    worker = worker || 1;
    this.idGen = new FlakeIdGen({datacenter, worker});

  }

  take(): string {
    const idBuff = this.idGen.next();
    return new Uint64BE(idBuff).toString();
  }

  withTime() {
    return {
      id: this.take(),

    }
  }
}
