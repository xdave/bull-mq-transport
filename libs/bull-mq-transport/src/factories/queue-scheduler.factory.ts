import { Injectable } from '@nestjs/common';
import { QueueScheduler, QueueSchedulerOptions } from 'bullmq';

@Injectable()
export class QueueSchedulerFactory {
  create(name: string, options?: QueueSchedulerOptions): QueueScheduler {
    return new QueueScheduler(name, options);
  }
}
