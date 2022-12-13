import { SomeObject } from "../types";

class CompareData {
  private static detectTypeAndCompare(x: any, y: any): boolean {
    const tx = typeof x, ty = typeof y;

    if (tx === "undefined" || ty === "undefined")
      return false;

    if (CompareData.byScalar(x, y))
      return true;

    if (Array.isArray(x) && Array.isArray(x))
      return CompareData.byArray(x, y);

    if ((tx === "object" && ty === "object") && (!Array.isArray(x) && !Array.isArray(y)))
      return CompareData.byObject(x, y);

    return false;
  }

  private static byScalar(x: any, y: any): boolean {
    const scalar = ["string", "number", "undefined", "boolean"];
    return [scalar.includes(typeof x), scalar.includes(typeof y), x === y].every(item => item);
  }

  private static byArray(x: any[], y: any[]) {
    return x.length === y.length && x.every((item, i) => {
      return CompareData.detectTypeAndCompare(item, y[i]);
    });
  }

  private static byObject(x: SomeObject, y: SomeObject): boolean {
    const ok = Object.keys;
    const byLength = ok(x).length === ok(y).length;

    return byLength && ok(x).every((key) => {
      return CompareData.detectTypeAndCompare(x[key], y[key]);
    });
  }

  public static isEquals(n1: any, n2: any) {
    return CompareData.detectTypeAndCompare(n1, n2);
  }
}

export default CompareData;
