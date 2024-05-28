import * as StatsdClient from 'statsd-client'
import { MetricsCollector, StatsDUDPConfig } from '../types';


export class StatsdMeter implements MetricsCollector {

  client: StatsdClient;

  constructor(options: StatsDUDPConfig) {
    this.client = new StatsdClient(options);
  }

  tick(metric: string, tags?: { [k: string]: string | number }) {
    this.client.increment(metric, 1, tags);
  }


  incr(metric: string, delta?: number, tags?: { [k: string]: string | number }) {
    this.client.increment(metric, delta, tags);
  }

  gauge(metric: string, value: number, tags?: { [k: string]: string | number }) {
    this.client.gauge(metric, value, tags);
  }

  timenote(metric: string, tags?: { [k: string]: string | number }): () => number {
    const start = process.hrtime();
    return () => {
      const diff = process.hrtime(start);
      const time = Math.round(diff[0] * 1e3 + diff[1] * 1e-6);
      this.time(metric, time, tags);
      return time;
    }
  }

  time(metric: string, duration: number, tags?: { [k: string]: string | number }): void {
    this.client.timing(metric, duration, tags);
  }
}
