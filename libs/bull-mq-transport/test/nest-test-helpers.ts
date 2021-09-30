import { Abstract, Provider, Type } from '@nestjs/common';
import { mock } from 'jest-mock-extended';

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type FunctionsOf<T> = Pick<T, FunctionPropertyNames<T>>;

export type Mock<T> = T & {
  [K in keyof FunctionsOf<T>]: jest.Mock<ReturnType<T[K]>, Parameters<T[K]>>;
};

export const createMock = <T>(): Mock<T> => mock<T>();

export const createMockFromClass = <T>(_Ctor: Type<T> | Abstract<T>): Mock<T> =>
  createMock<T>();

export const createMockProvider = <T>(
  Ctor: Type<any> | Abstract<any>,
): Provider<T> => ({
  provide: Ctor,
  useValue: createMockFromClass(Ctor),
});

export const createMockProviders = (
  ...ctors: Array<Type<any> | Abstract<any>>
): Provider<unknown>[] => ctors.map(createMockProvider);
