import { AppAlert } from "./AppAlert";

export function isObject(obj: unknown): obj is Record<keyof any, unknown> {
  if (typeof obj !== 'object' || obj === null) return false;
  return true;
}
export function isTList<T>(arr: unknown, isT: (v: unknown) => v is T): arr is T[] {
  return Array.isArray(arr) && arr.every(v => isT(v));
}
export function createDownload(filename: string, fileContent: string) {
  const aTag = document.createElement('a');
  aTag.download = filename;
  const blob = new Blob([fileContent]);
  aTag.href = URL.createObjectURL(blob);
  aTag.click();
}
export function openFile(accept: string) {
  return new Promise<{ filename: string, fileContent: string; }>(resolve => {
    const inputTag = document.createElement('input');
    inputTag.type = 'file';
    inputTag.accept = accept;
    inputTag.click();
    const callback = () => {
      inputTag.removeEventListener('change', callback);
      if (inputTag.files) {
        const files = [...inputTag.files];
        if (files.length) {
          const file = files[0];
          const filename = file.name;
          file.text().then(fileContent => {
            resolve({ filename, fileContent });
          });
        }
      } else {
        AppAlert.alert('发生了一些问题');
      }
    };
    inputTag.addEventListener('change', callback);
  });
}
export namespace ZIndexTable {
  export const menuOption = 5;
  export const confirm = 11;
  export const alert = 10;
}
export namespace ColorTable {
  export const curtain = 'rgb(0,0,0,.2)';
  export const starCard = 'rgb(220,220,160)';
  export const normalCard = 'gray';
}
export const globalAboutDoc = `
本软件由yyhhenry提供，采用React框架，详见
https://gitee.com/yyhhenry/logic-block
`;
export namespace MyRoute {
  export namespace RouteTable {
    export const Home = '/';
    export const AppEditor = '/AppEditor';
  }
  export function getParams() {
    let url = new URL(window.location.href);
    return url.searchParams;
  }
  export function getRoute() {
    let params = getParams();
    return params.get('page') ?? RouteTable.Home;
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
export type ModifyOption<T,> = {
  [K in keyof T]?: T[K];
};
