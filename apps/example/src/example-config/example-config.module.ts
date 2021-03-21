import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExampleBullMqConfigService } from './example-bull-mq-config.service';
import { validate } from './example-environment.validation';
import { ExampleRedisConfigService } from './example-redis-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      expandVariables: true,
      cache: true,
      isGlobal: true,
    }),
  ],
  providers: [ExampleRedisConfigService, ExampleBullMqConfigService],
  exports: [ExampleRedisConfigService, ExampleBullMqConfigService],
})
export class ExampleConfigModule {}
