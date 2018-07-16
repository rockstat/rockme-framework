

export type EnrichersRequirements = Array<[string, string]>

export interface MethodRegistrationOptions {
  alias?: string;
  props?: { [k: string]: string };
  keys?: Array<string>
}

export interface MethodRegRequest {
  register?: Array<MethodRegistration>
}

export interface MethodRegistration {
  service: string;
  method: string;
  role: string;
  options: MethodRegistrationOptions;
}

export interface RPCAppStatus {
  app_state: "running",
  app_started: number;
  app_uptime: number;
  methods: Array<MethodRegistration>
}

