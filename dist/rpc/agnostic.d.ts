import { TheIds } from "../ids";
import { RPCAdapter, RPCWaitingCall } from "../types";
import { AgnosticRPCOptions, RPCWaitingCalls, RpcMethods, LoggerType, RPCRequest, RPCResponse, RPCResponseError, RPCRequestParams, MeterFacade, RequestHandler } from "../types";
export declare class RPCAgnostic {
    ids: TheIds;
    meter: MeterFacade;
    started: boolean;
    timeout: number;
    log: LoggerType;
    queue: RPCWaitingCalls;
    methods: RpcMethods;
    adapter: RPCAdapter;
    listen_direct: boolean;
    listen_all: boolean;
    name: string;
    constructor(options: AgnosticRPCOptions);
    setup(adapter: RPCAdapter): void;
    publish(msg: RPCRequest | RPCResponse | RPCResponseError): void;
    dispatch(msg: RPCResponse | RPCResponseError | RPCRequest): Promise<void>;
    resolve(id: string, result: any, call: RPCWaitingCall): void;
    cleanWaiter(id: string, call: RPCWaitingCall): void;
    dispatchResponse(msg: RPCResponse | RPCResponseError): Promise<void>;
    dispatchRequest(msg: RPCRequest): Promise<RPCResponse | RPCResponseError | undefined>;
    notify(service: string, method: string, params?: RPCRequestParams): void;
    request<T>(target: string, method: string, params?: RPCRequestParams, services?: string[]): Promise<T>;
    register<T>(method: string, func: RequestHandler<T>): void;
    wrapError(msg: RPCRequest, error: Error, code?: number): RPCResponseError | undefined;
}
