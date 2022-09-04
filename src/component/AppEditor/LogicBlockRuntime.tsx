import { ModifyOption } from "../BasicModule/CommonHead";
import { LogicBlockFileModule } from "./AppFileContent";

const MaxOperatorInOneTick = 128;

type LogicPoint = LogicBlockFileModule.Point;
type LogicLine = LogicBlockFileModule.Line;
type LogicText = LogicBlockFileModule.Text;
export interface LogicBlockRuntimeController {
  setPoint: (u: number, value: ModifyOption<LogicPoint>) => void;
  addPoint: (value: LogicPoint) => void;
  removePoint: (u: number) => void;
  removeLine: (u: number) => void;
  addLine: (value: LogicLine) => void;
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
  private queue: number[];
  private vis: Set<number>;
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
    this.queue = this.points.map((_v, ind) => ind);
    this.vis = new Set(this.queue);
    this.rebuildMap();
    setTimeout(() => this.renderLoop());
  }
  private renderLoop() {
    const maxTime = Math.min(MaxOperatorInOneTick, this.queue.length);
    for (let i = 0; i < maxTime; i++) {
      const u = this.queue.shift();
      if (u !== undefined) {
        this.vis.delete(u);
        this.rebuildMap(u);
      } else {
        break;
      }
    }
    setTimeout(() => this.renderLoop());
  }
  private needUpdate(u: number) {
    if (!this.vis.has(u)) {
      this.queue.push(u);
      this.vis.add(u);
    }
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
  private rebuildMap(u?: number) {
    const range = u ? this.child[this.getf(u)] : this.points.map((_v, ind) => ind);
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
    range.forEach(u => {
      if (this.active[this.getf(u)] !== originActive[u]) {
        this.lineWithPoint[u].forEach(line => {
          if (line && line.notGate && line.pointFrom === u) {
            this.needUpdate(line.pointTo);
          }
        });
      }
    });
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
      this.rebuildMap(u);
    }
  }
  private addPoint(value: LogicPoint) {
    const u = this.points.length;
    this.points.push({ ...value });
    this.active.push(false);
    this.fa.push(u);
    this.child.push([u]);
    this.lineWithPoint.push([]);
    this.rebuildMap(u);
  }
  private addLine(value: LogicLine) {
    if (value.pointFrom !== value.pointTo && this.points[value.pointFrom] && this.points[value.pointTo]) {
      const line = { ...value };
      this.lines.push(line);
      this.lineWithPoint[value.pointFrom].push(line);
      this.lineWithPoint[value.pointTo].push(line);
      this.rebuildMap(value.pointFrom);
    }
  }
  private removeLine(u: number) {
    const line = this.lines[u];
    if (line) {
      this.lineWithPoint[line.pointFrom] = this.lineWithPoint[line.pointFrom].filter(v => v !== line);
      this.lineWithPoint[line.pointTo] = this.lineWithPoint[line.pointTo].filter(v => v !== line);
      this.lines[u] = null;
      this.rebuildMap(line.pointFrom);
      this.rebuildMap(line.pointTo);
    }
  }
  private removePoint(u: number) {
    const lineNeedRemove = this.lines.flatMap((v, ind) => {
      return (v !== null && (v.pointFrom === u || v.pointTo === u) ? [ind] : []);
    });
    lineNeedRemove.forEach(v => {
      this.removeLine(v);
    });
    this.points[u] = null;
    this.rebuildMap(u);
  }
  private addText(text: LogicText) {
    this.texts.push({ ...text });
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
      addPoint: (value: LogicPoint) => {
        this.addPoint(value);
      },
      removePoint: (u: number) => {
        const ru = pointPointer[u];
        this.removePoint(ru);
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
