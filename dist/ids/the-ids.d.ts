import { IdGenShowFlake } from './snow_flake';
import { IdGenRoundCounter } from './round_counter';
export declare class TheIds {
    sf: IdGenShowFlake;
    rpcCounter: IdGenRoundCounter;
    constructor();
    flake(): string;
    round(): string;
    xxhash(str: string): string;
}
