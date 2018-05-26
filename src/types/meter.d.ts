export interface StatsDClientConfig {
  prefix?: string;
  tcp?: boolean;
  socketTimeout?: number;
  tags?: { [k: string]: string | number }
}

export interface StatsDUDPConfig extends StatsDClientConfig {
  tcp?: false;
  host: string;
  port: number;
  ipv6?: boolean;
}

export interface MeterOptions {
  statsd?: StatsDUDPConfig
}


export interface MetricsCollector {
  tick(metric: string, tags?: { [k: string]: string | number }):void;
  time(metric: string, duration: number, tags?: { [k: string]: string | number }): void;
}


interface MeterFacade extends MetricsCollector {
  timenote(metric: string, tags?: { [k: string]: string | number }): () => number;
}
