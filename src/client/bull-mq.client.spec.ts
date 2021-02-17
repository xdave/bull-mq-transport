import { Test } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { BullMqClient } from '.';
import {
  createMockFromClass,
  createMockProviders,
  Mock,
} from '../../test/nest-test-helpers';
import { BULLMQ_MODULE_OPTIONS } from '../constants';
import { QueueFactory } from '../factories/queue.factory';

describe('BullMqClient', () => {
  let client: BullMqClient;
  let queueFactory: Mock<QueueFactory>;
  let queue: Mock<Queue>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: BULLMQ_MODULE_OPTIONS, useValue: {} },
        ...createMockProviders(QueueFactory),
        BullMqClient,
      ],
    }).compile();

    client = module.get(BullMqClient);
    queueFactory = module.get(QueueFactory);
  });

  beforeEach(async () => {
    queue = createMockFromClass(Queue);

    queueFactory.create.returns(queue);
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
