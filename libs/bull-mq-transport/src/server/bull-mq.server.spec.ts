import { Test } from '@nestjs/testing';
import { QueueScheduler, Worker } from 'bullmq';
import { of } from 'rxjs';
import {
  IBullMqModuleOptions,
  QueueSchedulerFactory,
  WorkerFactory,
} from '../';
import {
  createMockFromClass,
  createMockProviders,
  Mock,
} from '../../test/nest-test-helpers';
import { BULLMQ_MODULE_OPTIONS } from '../constants';
import { BullMqServer } from './bull-mq.server';

describe('BullMqServer', () => {
  let server: BullMqServer;
  let schedulerFactory: Mock<QueueSchedulerFactory>;
  let workerFactory: Mock<WorkerFactory>;
  let scheduler: Mock<QueueScheduler>;
  let worker: Mock<Worker>;

  const bullMQModuleOptions: IBullMqModuleOptions = {
    connection: { host: '', port: 1111 },
    concurrency: 5,
    sharedConnection: true,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: BULLMQ_MODULE_OPTIONS,
          useValue: bullMQModuleOptions,
        },
        ...createMockProviders(QueueSchedulerFactory, WorkerFactory),
        BullMqServer,
      ],
    }).compile();

    server = module.get(BullMqServer);
    schedulerFactory = module.get(QueueSchedulerFactory);
    workerFactory = module.get(WorkerFactory);
  });

  beforeEach(async () => {
    scheduler = createMockFromClass(QueueScheduler);
    worker = createMockFromClass(Worker);

    schedulerFactory.create.mockReturnValue(scheduler);
    workerFactory.create.mockReturnValue(worker);
  });

  afterEach(async () => {
    await server.close();
  });

  it('should be defined', () => {
    expect(server).toBeDefined();
    expect(schedulerFactory).toBeDefined();
    expect(workerFactory).toBeDefined();
    expect(scheduler).toBeDefined();
    expect(worker).toBeDefined();
  });

  it('creates QueueSchedulers & Workers for the handlers when listening', () => {
    const handlerSpy = jest.fn(async () => of(undefined));
    const callback = jest.fn();
    server.addHandler('test', handlerSpy, true);
    server.listen(callback);
    expect(schedulerFactory.create).toHaveBeenCalledTimes(1);
    expect(workerFactory.create).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should be able to transmit worker options when using the worker factory', () => {
    const handlerSpy = jest.fn(async () => of(undefined));
    const callback = jest.fn();
    server.addHandler('test', handlerSpy, true);
    server.listen(callback);
    expect(workerFactory.create).toHaveBeenCalledWith(
      'test',
      expect.any(Function),
      bullMQModuleOptions,
    );
  });

  it('closes the QueueSchedulers & Workers when closing the server', async () => {
    const handlerSpy = jest.fn(async () => of(undefined));
    const callback = jest.fn();
    server.addHandler('test', handlerSpy, true);
    server.listen(callback);
    await server.close();
    expect(scheduler.close).toHaveBeenCalledTimes(1);
    expect(worker.close).toHaveBeenCalledTimes(1);
  });
});
