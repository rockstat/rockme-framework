import * as FlakeIdGen from 'flake-idgen';
export declare class IdGenShowFlake {
    idGen: FlakeIdGen;
    constructor();
    take(): string;
    withTime(): {
        id: string;
    };
}
