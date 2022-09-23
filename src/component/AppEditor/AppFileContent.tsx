import { isObject, isTList } from "../BasicModule/CommonHead";

export namespace LogicBlockFileModule {
  export interface Point {
    x: number;
    y: number;
    power: boolean;
  }
  export interface Line {
    pointFrom: number;
    pointTo: number;
    notGate: boolean;
  }
  export interface Text {
    str: string;
    size: number;
    x: number;
    y: number;
  }
  export interface LogicBlockFileContent {
    points: Point[];
    lines: Line[];
    texts: Text[];
  }
  export function isPoint(obj: unknown): obj is Point {
    return isObject(obj) && typeof obj.x == 'number' && typeof obj.y == 'number' && typeof obj.power == 'boolean' && Object.keys(obj).length === 3;
  }
  export function isLine(obj: unknown): obj is Line {
    return isObject(obj) && typeof obj.pointFrom == 'number' && typeof obj.pointFrom == 'number' && typeof obj.notGate == 'boolean' && Object.keys(obj).length === 3;
  }
  export function isText(obj: unknown): obj is Text {
    return isObject(obj) && typeof obj.x == 'number' && typeof obj.y == 'number' && typeof obj.str == 'string' && typeof obj.size == 'number' && Object.keys(obj).length === 4;
  }
  export function isRedstoneFileContent(obj: unknown): obj is LogicBlockFileContent {
    return isObject(obj) && isTList(obj.points, isPoint) && isTList(obj.lines, isLine) && isTList(obj.texts, isText) && Object.keys(obj).length === 3;
  }
}
export interface AppFileContent {
  filename: string;
  content: LogicBlockFileModule.LogicBlockFileContent;
}
export function isAppFileContent(obj: unknown): obj is AppFileContent {
  return isObject(obj) && typeof obj.filename == 'string' && LogicBlockFileModule.isRedstoneFileContent(obj.content);
}
export const localAppFileExtName = '.logic-block.json';
export function createBlankAppFileContent(filename: string): AppFileContent {
  return {
    filename,
    content: {
      points: [],
      lines: [],
      texts: [],
    },
  };
}
