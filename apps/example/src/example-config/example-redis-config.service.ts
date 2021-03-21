import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExampleEnvironment } from './example-environment.validation';

@Injectable()
export class ExampleRedisConfigService {
  constructor(private readonly config: ConfigService<ExampleEnvironment>) {}

  get host(): string {
    return this.config.get('REDIS_SERVICE_HOST') as string;
  }

  get port(): number {
    return this.config.get('REDIS_SERVICE_PORT') as number;
  }

  get uri(): string {
    return this.config.get('REDIS_SERVICE_URI') as string;
  }
}
