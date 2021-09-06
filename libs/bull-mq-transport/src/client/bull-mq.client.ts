/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { Queue } from 'bullmq';
import { BULLMQ_MODULE_OPTIONS } from '../constants/bull-mq.constants';
import { QueueEventsFactory } from '../factories/queue-events.factory';
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
    private readonly queueEventsFactory: QueueEventsFactory,
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
    packet: ReadPacket<IBullMqEvent<any>>,
    callback: (packet: WritePacket<any>) => void,
  ): () => void {
    const queue = this.getQueue(packet.pattern);
    const events = this.queueEventsFactory.create(packet.pattern, {
      connection: this.options.connection,
    });
    events.on('completed', (job) =>
      callback({
        response: job.returnvalue,
        isDisposed: true,
      }),
    );
    events.on('failed', (job) =>
      callback({
        err: job.failedReason,
        isDisposed: true,
      }),
    );
    queue
      .add(packet.pattern, packet.data, {
        jobId: packet.data.id,
        delay: packet.data.delay,
      })
      .then(async (job) => await job.waitUntilFinished(events));
    return () => events.close().then();
  }

  protected async dispatchEvent(
    packet: ReadPacket<IBullMqEvent<any>>,
  ): Promise<any> {
    const queue = this.getQueue(packet.pattern);
    await queue.add(packet.pattern, packet.data, {
      jobId: packet.data.id,
      delay: packet.data.delay,
    });
  }

  protected getQueue(pattern: any): Queue {
    const queue =
      this.queues.get(pattern) ??
      this.queueFactory.create(pattern, {
        connection: this.options.connection,
      });
    this.queues.set(pattern, queue);
    return queue;
  }
}
