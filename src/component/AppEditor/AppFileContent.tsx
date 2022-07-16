import { isObject } from "../BasicModule/CommonHead";

export interface AppFileContent {
  filename: string;
}

export function isAppFileContent(obj: unknown): obj is AppFileContent {
  return isObject(obj) && typeof obj.filename == 'string';
}
