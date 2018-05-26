/// <reference types="statsd-client" />
import * as StatsdClient from 'statsd-client';
import { MetricsCollector, StatsDUDPConfig } from '../types';
export declare class StatsdMeter implements MetricsCollector {
    client: StatsdClient;
    constructor(options: StatsDUDPConfig);
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
