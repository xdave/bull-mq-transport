import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { BullMqModule } from '@xdave/bull-mq-transport';
import { BullMqRpcExceptionFilter } from '@xdave/bull-mq-transport/exceptions/bull-mq-rpc-exception.filter';
import { BullMqRpcValidationPipe } from '@xdave/bull-mq-transport/pipes/bull-mq-rpc-validation.pipe';
import { ExampleController } from './controllers/example.controller';
import { ExampleBullMqConfigService } from './example-config/example-bull-mq-config.service';
import { ExampleConfigModule } from './example-config/example-config.module';

@Module({
  imports: [
    BullMqModule.forRootAsync({
      imports: [ExampleConfigModule],
      useClass: ExampleBullMqConfigService,
    }),
    ExampleConfigModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new BullMqRpcValidationPipe({ transform: true }),
    },
    {
      provide: APP_FILTER,
      useClass: BullMqRpcExceptionFilter,
    },
  ],
  controllers: [ExampleController],
})
export class ExampleModule {}
