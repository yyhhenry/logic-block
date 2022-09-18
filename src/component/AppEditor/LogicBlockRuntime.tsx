import { AppAlert } from "../BasicModule/AppAlert";
import { ModifyOption } from "../BasicModule/CommonHead";
import { LogicBlockFileModule } from "./AppFileContent";
const renderLoopInOneTick = 5;
type LogicPoint = LogicBlockFileModule.Point;
type LogicLine = LogicBlockFileModule.Line;
type LogicText = LogicBlockFileModule.Text;
export interface LogicBlockRuntimeController {
  setPoint: (u: number, value: ModifyOption<LogicPoint>) => void;
  movePoint: (u: number, value: { dx: number, dy: number; }) => void;
  addPoint: (value: LogicPoint) => void;
  removePoint: (u: number) => void;
  setLine: (u: number, operate: 'notGate' | 'reverse') => void;
  removeLine: (u: number) => void;
  addLine: (value: LogicLine) => void;
  setText: (u: number, value: ModifyOption<LogicText>) => void;
  moveText: (u: number, value: { dx: number, dy: number; }) => void;
  addText: (text: LogicText) => void;
  removeText: (u: number) => void;
}
export class LogicBlockRuntime {
  private points: (LogicPoint | null)[];
  private lines: (LogicLine | null)[];
  private texts: (LogicText | null)[];
  private fa: number[];
  private child: number[][];
  private active: boolean[];
  private lineWithPoint: LogicLine[][];
  constructor(originFileContent: LogicBlockFileModule.LogicBlockFileContent) {
    this.points = originFileContent.points.map(v => ({ ...v }));
    this.lines = originFileContent.lines.map(v => ({ ...v }));
    this.texts = originFileContent.texts.map(v => ({ ...v }));
    this.fa = this.points.map((_v, ind) => ind);
    this.child = this.points.map((_v, ind) => [ind]);
    this.active = originFileContent.points.map(v => v.power);
    this.lineWithPoint = this.points.map(() => []);
    this.lines.forEach(line => {
      if (line) {
        this.lineWithPoint[line.pointFrom].push(line);
        this.lineWithPoint[line.pointTo].push(line);
      }
    });
    this.rebuildMap();
    setTimeout(() => this.renderLoop());
  }
  private renderLoop() {
    const count = Math.max(1, Math.round((Math.random() + .5) * renderLoopInOneTick));
    for (let i = 0; i < count; i++) {
      this.rebuildMap();
    }
    setTimeout(() => this.renderLoop());
  }
  private getf(u: number): number {
    const fa = this.fa;
    return fa[u] === u ? u : (fa[u] = this.getf(fa[u]));
  }
  private adde(u: number, v: number) {
    const fu = this.getf(u);
    const fv = this.getf(v);
    if (fu !== fv) {
      this.fa[fu] = fv;
      this.active[fv] ||= this.active[fu];
    }
  }
  private rebuildPoint(u: number, originActive: boolean[]) {
    const point = this.points[u];
    if (point) {
      this.active[u] = point.power;
      this.lineWithPoint[u].forEach(line => {
        if (line && line.notGate && line.pointTo === u) {
          this.active[u] ||= !originActive[line.pointFrom];
        }
      });
    }
  }
  private rebuildMap() {
    const range = this.points.map((_v, ind) => ind);
    const originActive = [...this.active];
    range.forEach(u => {
      this.rebuildPoint(u, originActive);
    });
    range.forEach(u => {
      this.fa[u] = u;
    });
    range.forEach(u => {
      this.lineWithPoint[u].forEach(line => {
        if (line && !line.notGate) {
          this.adde(line.pointFrom, line.pointTo);
        }
      });
    });
    range.forEach(u => {
      this.child[u] = [];
    });
    range.forEach(u => {
      this.child[this.getf(u)].push(u);
    });
    this.active = this.fa.map((f) => this.active[f]);
  }
  renderActive() {
    return this.points.flatMap((v, ind) =>
      (v === null ? [] : [this.active[ind]]) as boolean[]);
  }
  renderFileContent(): LogicBlockFileModule.LogicBlockFileContent {
    const { pointPointer } = this.getPointer(false);
    const lineRebuilder = (v: LogicLine): LogicLine => ({
      pointFrom: pointPointer[v.pointFrom],
      pointTo: pointPointer[v.pointTo],
      notGate: v.notGate,
    });
    return {
      points: this.points.flatMap(v => (v !== null ? [{ ...v }] : []) as LogicPoint[]),
      lines: (this.lines.flatMap(v => (v !== null ? [lineRebuilder(v)] : []) as LogicLine[])),
      texts: this.texts.flatMap(v => (v !== null ? [{ ...v }] : []) as LogicText[]),
    };
  }
  private getPointer(rev: boolean) {
    const getPointerOf = <T,>(list: T[]) => {
      if (rev) {
        return list.flatMap((v, ind) => v === null ? [] : [ind]);
      }
      let ind = 0;
      return list.map(v => v === null ? ind : ind++);
    };
    return {
      pointPointer: getPointerOf(this.points),
      linePointer: getPointerOf(this.lines),
      textPointer: getPointerOf(this.texts),
    };
  }
  private setPoint(u: number, value: ModifyOption<LogicPoint>) {
    const point = this.points[u];
    if (point) {
      point.power = value.power ?? point.power;
      point.x = value.x ?? point.x;
      point.y = value.y ?? point.y;
      this.rebuildMap();
    }
  }
  private movePoint(u: number, { dx, dy }: { dx: number, dy: number; }) {
    const point = this.points[u];
    if (point) {
      point.x += dx;
      point.y += dy;
    }
  }
  private setText(u: number, value: ModifyOption<LogicText>) {
    const text = this.texts[u];
    if (value.str !== undefined && value.str.trim() === '') {
      AppAlert.confirm('无法添加空文本窗', false);
      return;
    }
    if (text) {
      text.size = value.size ?? text.size;
      text.x = value.x ?? text.x;
      text.y = value.y ?? text.y;
      text.str = value.str ?? text.str;
    }
  }
  private setLine(u: number, operate: 'notGate' | 'reverse') {
    const line = this.lines[u];
    if (line) {
      if (operate === 'notGate') {
        line.notGate = !line.notGate;
      } else if (operate === 'reverse') {
        const newLine = {
          notGate: line.notGate,
          pointFrom: line.pointTo,
          pointTo: line.pointFrom,
        };
        this.lines[u] = newLine;
        this.lineWithPoint[line.pointFrom] = this.lineWithPoint[line.pointFrom].map(v => v === line ? newLine : v);
        this.lineWithPoint[line.pointTo] = this.lineWithPoint[line.pointTo].map(v => v === line ? newLine : v);
      }
      this.rebuildMap();
    }
  }
  private addPoint(value: LogicPoint) {
    const u = this.points.length;
    this.points.push({ ...value });
    this.active.push(value.power);
    this.fa.push(u);
    this.child.push([u]);
    this.lineWithPoint.push([]);
    this.rebuildMap();
  }
  private addLine(value: LogicLine) {
    if (value.pointFrom !== value.pointTo && this.points[value.pointFrom] && this.points[value.pointTo]) {
      if (this.lineWithPoint[value.pointFrom].some(v => v.pointFrom === value.pointTo || v.pointTo === value.pointTo)) {
        return;
      }
      const line = { ...value };
      this.lines.push(line);
      this.lineWithPoint[value.pointFrom].push(line);
      this.lineWithPoint[value.pointTo].push(line);
      this.rebuildMap();
    }
  }
  private removeLine(u: number, asSubProc: boolean = false) {
    const line = this.lines[u];
    if (line) {
      this.lineWithPoint[line.pointFrom] = this.lineWithPoint[line.pointFrom].filter(v => v !== line);
      this.lineWithPoint[line.pointTo] = this.lineWithPoint[line.pointTo].filter(v => v !== line);
      this.lines[u] = null;
      if (!asSubProc) {
        this.rebuildMap();
      }
    }
  }
  private removePoint(u: number) {
    const lineNeedRemove = this.lines.flatMap((v, ind) => {
      return (v !== null && (v.pointFrom === u || v.pointTo === u) ? [ind] : []);
    });
    lineNeedRemove.forEach(v => {
      this.removeLine(v, true);
    });
    this.points[u] = null;
    this.rebuildMap();
  }
  private addText(text: LogicText) {
    if (text.str.trim() === '') {
      AppAlert.confirm('无法添加空文本窗', false);
      return;
    }
    this.texts.push({ ...text });
  }
  private moveText(u: number, { dx, dy }: { dx: number; dy: number; }): void {
    const text = this.texts[u];
    if (text) {
      text.x += dx;
      text.y += dy;
    }
  }
  private removeText(u: number) {
    this.texts[u] = null;
  }
  getControllerCopy(): LogicBlockRuntimeController {
    const { pointPointer, linePointer, textPointer } = this.getPointer(true);
    return {
      setPoint: (u: number, value: ModifyOption<LogicPoint>) => {
        const ru = pointPointer[u];
        return this.setPoint(ru, value);
      },
      movePoint: (u: number, value: { dx: number, dy: number; }) => {
        const ru = pointPointer[u];
        return this.movePoint(ru, value);
      },
      addPoint: (value: LogicPoint) => {
        this.addPoint(value);
      },
      removePoint: (u: number) => {
        const ru = pointPointer[u];
        this.removePoint(ru);
      },
      setLine: (u: number, operate: 'notGate' | 'reverse') => {
        const ru = linePointer[u];
        this.setLine(ru, operate);
      },
      removeLine: (u: number) => {
        const ru = linePointer[u];
        this.removeLine(ru);
      },
      addLine: (value: LogicLine) => {
        const pointFrom = pointPointer[value.pointFrom];
        const pointTo = pointPointer[value.pointTo];
        const notGate = value.notGate;
        this.addLine({ pointFrom, pointTo, notGate });
      },
      setText: (u: number, value: ModifyOption<LogicText>) => {
        const ru = textPointer[u];
        this.setText(ru, value);
      },
      moveText: (u: number, value: { dx: number, dy: number; }) => {
        const ru = textPointer[u];
        return this.moveText(ru, value);
      },
      addText: (text: LogicText) => {
        this.addText(text);
      },
      removeText: (u: number) => {
        const ru = textPointer[u];
        this.removeText(ru);
      },
    };
  }
}
