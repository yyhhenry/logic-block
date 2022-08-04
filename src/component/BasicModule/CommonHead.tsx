export function isObject(obj: unknown): obj is Record<keyof any, unknown> {
  if (typeof obj !== 'object' || obj === null) return false;
  return true;
}
export function isTList<T>(arr: unknown, isT: (v: unknown) => v is T): arr is T[] {
  return Array.isArray(arr) && arr.every(v => isT(v));
}
export namespace ZIndexTable {
  export const menuOption = 5;
  export const confirm = 11;
  export const alert = 10;
}
export namespace ColorTable {
  export const curtain = 'rgb(0,0,0,.2)';
}
export namespace MyRoute {
  export function getParams() {
    let url = new URL(window.location.href);
    return url.searchParams;
  }
  export function getRoute() {
    let params = getParams();
    return params.get('page') ?? '/';
  }
  export function routeTo(src: string, otherParams?: Record<string, string>) {
    let url = new URL(window.location.href);
    let params = url.searchParams;
    if (otherParams !== undefined) {
      for (const [key, value] of Object.entries(otherParams)) {
        params.set(key, value);
      }
    }
    params.set('page', src);
    window.location.href = url.href;
  }
}
