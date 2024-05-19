

export type EnrichersRequirements = Array<[string, string]>

export interface MethodRegistrationOptions {
  // Rename method
  alias?: string;
  // For multiple requests. Defines key of final hash
  section?: string; 
  timeout?: number;
  props?: { [k: string]: string };
  keys?: Array<string>
}

export interface MethodRegRequest {
  register?: Array<MethodRegistration>
  state_hash?: string;
}

export interface MethodRegistration {
  // service: string;
  method: string;
  role: string;
  options: MethodRegistrationOptions;
}

export interface RPCAppStatus {
  name: string;
  app_state: "running";
  app_started: number;
  app_uptime: number;
  register: MethodRegistration[]
}

