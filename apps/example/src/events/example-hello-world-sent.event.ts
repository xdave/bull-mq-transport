import { IsString } from 'class-validator';

export class ExampleHelloWorldSent {
  @IsString() message: string;

  constructor(message: string) {
    this.message = message;
  }
}
