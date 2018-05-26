import { MeterFacade } from '../types';
export declare class StubMeter implements MeterFacade {
    tick(metric: string, tags?: {
        [k: string]: string | number;
    }): void;
    timenote(metric: string, tags?: {
        [k: string]: string | number;
    }): () => number;
    time(metric: string, duration: number, tags?: {
        [k: string]: string | number;
    }): void;
}
