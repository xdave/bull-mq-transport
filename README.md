# BullMQ NestJS Microservice Transport

Like the `@nestjs/bull` module, except it works with `@nestjs/microservices` and uses the new `bullmq` version:
- Single module import with custom connection settings
- Synchronous or Asynchronous module configuration (ie. options factory)
- Queues/Workers are declared by creating `@EventPattern(...) `handlers on Controllers
- The `ClientProxy` (`BullMqClient`) can emit() to any Queue

# Getting Started

Install:

```
$ npm i @nestjs/microservices bullmq @xdave/bull-mq-transport
```

Import into AppModule and provide Redis connection settings (can also provide an existing `ioredis` connection instance):

```ts
import { Module } from '@nestjs/common';
import { BullMqModule } from '@xdave/bull-mq-transport';

@Module({
    imports: [
        BullMqModule.forRoot({
            connection: { host: 'localhost', port: 6379 }
            // connection: ioRedisConnection
        })
    ]
})
export class AppModule {}
```

Or, delcare an asynchronous factory to provide the module options:

```ts
import { Module } from '@nestjs/common';
import { BullMqModule } from '@xdave/bull-mq-transport';
import { ConfigService } from './config.service';

@Module({
    imports: [
        BullMqModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                connection: {
                    host: config.get('REDIS_SERVICE_HOST'),
                    port: +config.get('REDIS_SERVICE_PORT'),
                }
            })
        })
    ]
})
export class AppModule {}
```

Or, use an options factory class to provide the module options:

```ts
import { Module } from '@nestjs/common';
import {
    BullMqModule,
    IBullMqModuleOptions,
    IBullMqModuleOptionsFactory,
} from '@xdave/bull-mq-transport';
import { ConfigService } from './config.service';

@Injectable()
export class BullMqConfigService implements IBullMqModuleOptionsFactory {
    constructor(private readonly config: ConfigService) {}
    createModuleOptions(): IBullMqModuleOptions | Promise<IBullMqModuleOptions> {
        return {
            connection: {
                host: this.config.get('REDIS_SERVICE_HOST'),
                port: +this.config.get('REDIS_SERVICE_PORT'),
            }
        };
    }
}

@Module({
    imports: [
        BullMqModule.forRootAsync({
            imports: [ConfigModule],
            useClass: BullMqConfigService,
        })
    ]
})
export class AppModule {}
```

Then, create a microservice in `main.ts` and pass the `BullMqServer` as the strategy to the options, for example:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Hybrid approach
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const strategy = app.get(BullMqServer);
  app.connectMicroservice({ strategy }, { inheritAppConfig: true });
  await app.startAllMicroservicesAsync();
  await app.listen(3000);
}
bootstrap();
```

After you've done these things, you can use things like Pipes, Interceptors,
Guards, Filters, and Request Context in the Workers in the `rpc` context.

Finally, you'll need to declare some controllers to act as Workers for BullMQ:

```ts
@Controller()
export class SomethingController {
    @EventPattern('stuff')
    async handleStuff(@Payload() data: StuffDto, @Ctx() job: Job) {
        // ... do something with the stuff
    }
}
```

Add it to some module:

```ts
@Module({
    // ...
    controllers: [SomethingController],
})
export class AppModule {}
```

Then, publish something to the queue:

```ts
import { v4 } from 'uuid';

export class SomethingService {
    constructor(private readonly client: BullMqClient) {}

    doStuff() {
        const payload = new StuffDto('...');
        this.client.emit('stuff', { id: v4(), payload }).subscribe();
    }
}
```

You can also set a job to be delayed by some milliseconds into the future:
```ts
import { v4 } from 'uuid';

export class SomethingService {
    constructor(private readonly client: BullMqClient) {}

    doStuff() {
        const payload = new StuffDto('...'); // Custom type
        // Will be delayed by 5 seconds
        this.client.emit('stuff', { id: v4(), delay: 5000, payload }).subscribe();
    }
}
```

# Work in progress

This package is a work in progress. Planned features include:
- [ ] RPC-style request/response-style
- [ ] Ability to provide more Queue, Worker, and Job options
