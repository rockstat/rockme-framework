import { IdGenShowFlake } from './snow_flake';
import { IdGenRoundCounter } from './round_counter';

export class TheIds {

  sf: IdGenShowFlake;
  rpcCounter: IdGenRoundCounter;

  constructor(){
    this.sf = new IdGenShowFlake();
    this.rpcCounter = new IdGenRoundCounter();
  }

  flake(): string {
    return this.sf.take();
  }

  round(): string {
    return this.rpcCounter.take().toString(36);
  }

}
