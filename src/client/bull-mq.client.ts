/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { Queue } from 'bullmq';
import { BULLMQ_MODULE_OPTIONS } from '../constants/bull-mq.constants';
import { QueueFactory } from '../factories/queue.factory';
import { IBullMqEvent } from '../interfaces/bull-mq-event.interface';
import { IBullMqModuleOptions } from '../interfaces/bull-mq-module-options.interface';

@Injectable()
export class BullMqClient extends ClientProxy {
  protected readonly queues = new Map<string, Queue>();

  constructor(
    @Inject(BULLMQ_MODULE_OPTIONS)
    private readonly options: IBullMqModuleOptions,
    private readonly queueFactory: QueueFactory,
  ) {
    super();
  }

  async connect(): Promise<void> {
    return;
  }

  async close(): Promise<void> {
    for (const [, queue] of this.queues) {
      await queue.close();
    }
  }

  protected publish(
    _packet: ReadPacket<any>,
    _callback: (packet: WritePacket<any>) => void,
  ): Function {
    throw new Error('Method not implemented. (TODO)');
  }

  protected async dispatchEvent(
    packet: ReadPacket<IBullMqEvent<any>>,
  ): Promise<any> {
    const queue =
      this.queues.get(packet.pattern) ??
      this.queueFactory.create(packet.pattern, {
        connection: this.options.connection,
      });
    this.queues.set(packet.pattern, queue);
    return await queue.add(packet.pattern, packet.data, {
      jobId: packet.data.id,
      delay: packet.data.delay,
    });
  }
}
