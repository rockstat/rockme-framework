import * as FlakeIdGen from 'flake-idgen';
import { Uint64BE } from 'int64-buffer'

export class IdGenShowFlake {

  idGen: FlakeIdGen;

  constructor() {
    this.idGen = new FlakeIdGen();
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
