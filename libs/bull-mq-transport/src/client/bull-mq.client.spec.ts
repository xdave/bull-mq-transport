import { Test } from '@nestjs/testing';
import { Queue, QueueEvents } from 'bullmq';
import { BullMqClient } from '.';
import {
  createMockFromClass,
  createMockProviders,
  Mock,
} from '../../test/nest-test-helpers';
import { BULLMQ_MODULE_OPTIONS } from '../constants';
import { QueueEventsFactory } from '../factories/queue-events.factory';
import { QueueFactory } from '../factories/queue.factory';

describe('BullMqClient', () => {
  let client: BullMqClient;
  let queueFactory: Mock<QueueFactory>;
  let queueEventsFactory: Mock<QueueEventsFactory>;
  let queue: Mock<Queue>;
  let events: Mock<QueueEvents>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: BULLMQ_MODULE_OPTIONS, useValue: {} },
        ...createMockProviders(QueueFactory, QueueEventsFactory),
        BullMqClient,
      ],
    }).compile();

    client = module.get(BullMqClient);
    queueFactory = module.get(QueueFactory);
    queueEventsFactory = module.get(QueueEventsFactory);
  });

  beforeEach(async () => {
    queue = createMockFromClass(Queue);
    events = createMockFromClass(QueueEvents);

    queueFactory.create.mockReturnValue(queue);
    queueEventsFactory.create.mockReturnValue(events);
  });

  afterEach(async () => {
    await client.close();
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
    expect(queueFactory).toBeDefined();
    expect(queue).toBeDefined();
  });

  it('dispatches to Queue when emit() is called', async () => {
    client.connect = jest.fn().mockResolvedValueOnce(undefined);

    await client.emit('test', {}).toPromise();
    await client.close();

    expect(client.connect).toHaveBeenCalledTimes(1);
    expect(queueFactory.create).toHaveBeenCalledTimes(1);
    expect(queue.add).toHaveBeenCalledTimes(1);
    expect(queue.close).toHaveBeenCalledTimes(1);
  });
});
