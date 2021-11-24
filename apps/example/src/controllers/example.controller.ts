import { Controller, Get } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { BullMqClient } from '@xdave/bull-mq-transport';
import { Job } from 'bullmq';
import { ExampleHelloWorldSent } from '../events/example-hello-world-sent.event';

@Controller('example')
export class ExampleController {
  constructor(private readonly client: BullMqClient) {}

  @Get('hello')
  sendHello() {
    return this.client.emit('events', {
      payload: new ExampleHelloWorldSent('Hello, world!'),
    });
  }

  @EventPattern('events', Transport.REDIS)
  handleHello(@Payload() event: ExampleHelloWorldSent, @Ctx() job: Job) {
    console.log('got event:', event, job.id);
  }

  @Get('event_error')
  sendEventError() {
    return this.client.emit('event_error_tests', {
      payload: {},
      options: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });
  }

  @EventPattern('event_error_tests', Transport.REDIS)
  handleEventErrorTest(@Payload() event: any, @Ctx() job: Job) {
    console.log('got event:', event, job.id);
    throw new RpcException('Some event error!');
  }

  @Get('thing')
  thing() {
    return this.client.send('things', {
      payload: 'hello thing',
    });
  }

  @MessagePattern('things', Transport.REDIS)
  async handleThing(@Payload() msg: string, @Ctx() job: Job) {
    console.log('got message:', msg, job.id);
    return { reply: msg.toUpperCase() };
  }

  @Get('rpc_error')
  sendRpcErrorTest() {
    return this.client.send('rpc_error_tests', {
      payload: {},
      options: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });
  }

  @MessagePattern('rpc_error_tests', Transport.REDIS)
  async handleRpcErrorTest(@Payload() msg: any, @Ctx() job: Job) {
    console.log('got message:', msg, job.id);
    throw new RpcException('Some random RPC error!');
  }

  @MessagePattern('some_other_transport', Transport.RMQ)
  async someOtherThing(@Payload() _msg: any, @Ctx() _ctx: any) {
    // This is to test if BullMQ server ends up registering a queue for this,
    // which it shouldn't.
  }
}
