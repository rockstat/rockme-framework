import { MeterConfig, MetricsCollector, MeterFacade } from '../types';
export declare class Meter implements MeterFacade {
    meters: MetricsCollector[];
    constructor(options: MeterConfig);
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
