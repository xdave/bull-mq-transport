import { Controller, Get } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { BullMqClient } from '@xdave/bull-mq-transport';
import { Job } from 'bullmq';
import { v4 } from 'uuid';
import { ExampleHelloWorldSent } from '../events/example-hello-world-sent.event';

@Controller('example')
export class ExampleController {
  constructor(private readonly client: BullMqClient) {}

  @Get('hello')
  sendHello() {
    return this.client.emit('events', {
      id: v4(),
      payload: new ExampleHelloWorldSent('Hello, world!'),
      // delay: 4000,
    });
  }

  @EventPattern('events')
  handleHello(@Payload() event: ExampleHelloWorldSent, @Ctx() job: Job) {
    console.log('got event:', event, job.id);
  }

  @Get('thing')
  thing() {
    return this.client.send('things', {
      id: v4(),
      payload: 'hello thing',
    });
  }

  @MessagePattern('things')
  async handleThing(@Payload() msg: string, @Ctx() job: Job) {
    console.log('got message:', msg, job.id);
    return { reply: msg.toUpperCase() };
  }
}
