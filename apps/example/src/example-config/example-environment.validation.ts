import { plainToClass } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

export class ExampleEnvironment {
  @IsString() REDIS_SERVICE_HOST!: string;
  @IsNumber() REDIS_SERVICE_PORT!: number;
  @IsString() REDIS_SERVICE_URI!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(ExampleEnvironment, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
