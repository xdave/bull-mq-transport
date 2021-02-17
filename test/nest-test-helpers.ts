import { Abstract, Provider, Type } from '@nestjs/common';
import * as sinon from 'ts-sinon';

export type Mock<T> = sinon.StubbedInstance<T>;

export const createMockFromClass = <T>(_Ctor: Type<T> | Abstract<T>): Mock<T> =>
  sinon.stubInterface<any>();

export const createMockProvider = <T>(
  Ctor: Type<any> | Abstract<any>,
): Provider<T> => ({
  provide: Ctor,
  useValue: createMockFromClass(Ctor),
});

export const createMockProviders = (
  ...ctors: Array<Type<any> | Abstract<any>>
): Provider<unknown>[] => ctors.map(createMockProvider);
