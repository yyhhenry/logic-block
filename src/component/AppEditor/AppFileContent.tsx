import { isObject, isTList } from "../BasicModule/CommonHead";

export namespace LogicBlockFileModule {
  export interface Point {
    x: number;
    y: number;
    power: boolean;
    interval?: number;
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
    return isObject<Point>(obj) && typeof obj.x === 'number' && typeof obj.y === 'number' && typeof obj.power === 'boolean' && (typeof obj.interval === 'number' || typeof obj.interval === 'undefined');
  }
  export function isLine(obj: unknown): obj is Line {
    return isObject<Line>(obj) && typeof obj.pointFrom === 'number' && typeof obj.pointFrom === 'number' && typeof obj.notGate === 'boolean';
  }
  export function isText(obj: unknown): obj is Text {
    return isObject<Text>(obj) && typeof obj.x === 'number' && typeof obj.y === 'number' && typeof obj.str === 'string' && typeof obj.size === 'number';
  }
  export function isRedstoneFileContent(obj: unknown): obj is LogicBlockFileContent {
    return isObject<LogicBlockFileContent>(obj) && isTList(obj.points, isPoint) && isTList(obj.lines, isLine) && isTList(obj.texts, isText);
  }
}
export interface AppFileContent {
  filename: string;
  content: LogicBlockFileModule.LogicBlockFileContent;
}
export function isAppFileContent(obj: unknown): obj is AppFileContent {
  return isObject<AppFileContent>(obj) && typeof obj.filename === 'string' && LogicBlockFileModule.isRedstoneFileContent(obj.content);
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
