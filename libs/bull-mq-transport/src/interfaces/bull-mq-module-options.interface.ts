import { LogLevel } from '@nestjs/common';
import { ConnectionOptions } from 'bullmq';

export interface IBullMqModuleOptions {
  connection: ConnectionOptions;
  logExceptionsAsLevel?: LogLevel | 'off';
}
