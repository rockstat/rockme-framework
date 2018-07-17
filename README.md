# RockME TS

Library with main components that needs for building Rockstat microservice on Node.js using TypeScript

## Usage

### Simple components
    const log = new Logger(config.log);
    const meter = new Meter(config.meter);

    this.log = log.for(this);
    this.log.info('Starting service');

### Redis RPC

    // setup Redis
    const redisFactory = new RedisFactory({ log, meter, ...config.redis });

    // Setup RPC
    const channels = [config.rpc.name, BROADCAST];
    const rpcOptions: AgnosticRPCOptions = { channels, redisFactory, log, meter, ...config.rpc }
    this.rpcAdaptor = new RPCAdapterRedis(rpcOptions);
    this.rpc = new RPCAgnostic(rpcOptions);

    this.rpc.setup(this.rpcAdaptor);
    this.rpc.register(BROADCAST, this.chw.write);
