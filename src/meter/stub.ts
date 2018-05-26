import { MeterFacade } from '../types';

export class StubMeter implements MeterFacade {
  tick(metric: string, tags?: { [k: string]: string | number }): void { }
  timenote(metric: string, tags?: { [k: string]: string | number }): () => number {
    return () => 0;
  }
  time(metric: string, duration: number, tags?: { [k: string]: string | number }): void { }
}
