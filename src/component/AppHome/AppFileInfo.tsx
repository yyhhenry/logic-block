import { isObject } from "../BasicModule/CommonHead";

export interface AppFileInfo {
  filename: string;
  color: string;
}

export function isAppFileInfo(obj: unknown): obj is AppFileInfo {
  return isObject<AppFileInfo>(obj) && typeof obj.filename == 'string' && typeof obj.color == 'string';
}
