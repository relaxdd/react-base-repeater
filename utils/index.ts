import { SomeObject } from "../types";

export function removeElementByKey<T = any>(obj: SomeObject<T>, key: string) {
  return (Object.keys(obj) as (keyof typeof obj)[]).reduce((acc, item) => {
    if (item === key)
      return acc;
    else {
      acc[item] = obj[item];
      return acc;
    }
  }, {} as SomeObject<T>);
}