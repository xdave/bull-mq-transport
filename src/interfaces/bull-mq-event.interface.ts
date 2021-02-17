export interface IBullMqEvent<T> {
  id: string;
  delay?: number;
  payload: T;
}
