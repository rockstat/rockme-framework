import { MeterOptions, MetricsCollector, MeterFacade } from '../types';
import { StatsdMeter } from './statsd';

export class Meter implements MeterFacade {
  meters: MetricsCollector[] = [];

  constructor(options: MeterOptions) {
    if(options.statsd){
      this.meters.push(new StatsdMeter(options.statsd));
    }
  }

  tick(metric: string, tags?: { [k: string]: string | number }) {
    for(const m of this.meters){
      m.tick(metric, tags);
    }
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
    for(const m of this.meters){
      m.time(metric, duration, tags);
    }
  }
}
