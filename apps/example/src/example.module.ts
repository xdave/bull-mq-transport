import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { BullMqModule } from '@xdave/bull-mq-transport';
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
      useValue: new ValidationPipe({ transform: true }),
    },
  ],
  controllers: [ExampleController],
})
export class ExampleModule {}
