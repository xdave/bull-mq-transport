import { Injectable } from '@nestjs/common';
import {
  IBullMqModuleOptions,
  IBullMqModuleOptionsFactory,
} from '@xdave/bull-mq-transport';
import { ExampleRedisConfigService } from './example-redis-config.service';

@Injectable()
export class ExampleBullMqConfigService implements IBullMqModuleOptionsFactory {
  constructor(private readonly config: ExampleRedisConfigService) {}

  createModuleOptions(): IBullMqModuleOptions {
    return {
      connection: {
        host: this.config.host,
        port: this.config.port,
      },
      // logExceptionsAsLevel: 'warn',
    };
  }
}
