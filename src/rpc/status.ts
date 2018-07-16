import { format as dateFormat } from 'cctz';
import { RPCAppStatus, RequestHandler } from '../types';

export class AppStatus {
  appStarted: Date = new Date();

  get: RequestHandler<object> = (params: object): RPCAppStatus => {
    const appUptime = Number(new Date()) - Number(this.appStarted);
    return {
      app_state: "running",
      app_started: Number(this.appStarted),
      app_uptime: appUptime,
      methods: []
    };
  }
}
