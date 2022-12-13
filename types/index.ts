export type SomeObject<T = any> = { [key: string | number | symbol]: T }
export type Arrayable<T> = T | T[];