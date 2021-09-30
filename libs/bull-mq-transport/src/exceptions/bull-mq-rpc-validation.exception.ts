import { RpcException } from '@nestjs/microservices';

export class BullMqRpcValidationException extends RpcException {
  name = this.constructor.name;
}
