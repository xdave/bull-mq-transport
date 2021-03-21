import { Inject, Injectable, Logger } from '@nestjs/common';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { Job, QueueScheduler, Worker } from 'bullmq';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BULLMQ_MODULE_OPTIONS } from '../constants/bull-mq.constants';
import { QueueSchedulerFactory } from '../factories/queue-scheduler.factory';
import { WorkerFactory } from '../factories/worker.factory';
import { IBullMqModuleOptions } from '../interfaces/bull-mq-module-options.interface';

@Injectable()
export class BullMqServer extends Server implements CustomTransportStrategy {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly workers = new Map<string, Worker>();
  protected readonly schedulers = new Map<string, QueueScheduler>();

  constructor(
    @Inject(BULLMQ_MODULE_OPTIONS)
    private readonly options: IBullMqModuleOptions,
    private readonly queueSchedulerFactory: QueueSchedulerFactory,
    private readonly workerFactory: WorkerFactory,
  ) {
    super();

    this.initializeSerializer(this.serializer);
    this.initializeDeserializer(this.deserializer);
  }

  listen(callback: () => void) {
    for (const [pattern, handler] of this.messageHandlers) {
      if (
        pattern &&
        handler &&
        !this.workers.has(pattern) &&
        !this.schedulers.has(pattern)
      ) {
        const scheduler = this.queueSchedulerFactory.create(pattern, {
          connection: this.options.connection,
        });
        const worker = this.workerFactory.create(
          pattern,
          async (job: Job) => {
            const value = await handler(job.data.payload, job);
            return new Promise((resolve, reject) => {
              const stream$ = this.transformToObservable(value).pipe(
                catchError((err) => of(err)),
              );
              this.send(stream$, (packet) => {
                if (packet.err) {
                  return reject(packet.err);
                }
                resolve(packet.response);
              });
            });
          },
          { connection: this.options.connection },
        );
        this.schedulers.set(pattern, scheduler);
        this.workers.set(pattern, worker);
        this.logger.log(`Registered queue "${pattern}"`);
      }
    }
    callback();
  }

  async close() {
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    for (const scheduler of this.schedulers.values()) {
      await scheduler.close();
    }
  }
}
