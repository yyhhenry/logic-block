import { AppAlert } from "../BasicModule/AppAlert";
import { ModifyOption } from "../BasicModule/CommonHead";
import { LogicBlockFileModule } from "./AppFileContent";
const renderLoopInOneTick = 5;
type LogicPoint = LogicBlockFileModule.Point;
type LogicLine = LogicBlockFileModule.Line;
type LogicText = LogicBlockFileModule.Text;
export class LogicBlockRuntime {
  private points: (LogicPoint | null)[];
  private lines: (LogicLine | null)[];
  private texts: (LogicText | null)[];
  private fa: number[];
  private child: number[][];
  private active: boolean[];
  private lineWithPoint: LogicLine[][];
  private needUpdate: number[];
  private needUpdateSet: Set<number>;
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
    this.needUpdate = [];
    this.needUpdateSet = new Set();
    this.rebuildMap();
    setTimeout(() => this.renderLoop());
  }
  private renderLoop() {
    const time = Date.now();
    for (const point of this.points) {
      if (!point) continue;
      if (point.interval === undefined) continue;
      const newPower = Math.floor(time / 1000 / (point.interval / 2)) % 2 === 1;
      if (newPower !== point.power) {
        point.power = newPower;
        this.rebuildMap();
      }
    }
    const count = Math.max(1, Math.round((Math.random() + .5) * renderLoopInOneTick));
    for (let i = 0; i < count; i++) {
      const toUpdate = [...this.needUpdate];
      this.clearNeedUpdate();
      toUpdate.forEach(u => {
        this.updateMap(u);
      });
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
  private clearNeedUpdate() {
    this.needUpdate = [];
    this.needUpdateSet = new Set();
  }
  private setNeedUpdate(u: number) {
    if (!this.needUpdateSet.has(u)) {
      this.needUpdateSet.add(u);
      this.needUpdate.push(u);
    }
  }
  private updateMap(u: number) {
    if (this.points[u] === undefined) {
      return;
    }
    const range = this.child[this.getf(u)];
    let newActive = false;
    range.forEach(u => {
      const point = this.points[u];
      if (point) {
        newActive ||= point.power;
        this.lineWithPoint[u].forEach(line => {
          if (line && line.notGate && line.pointTo === u) {
            newActive ||= !this.active[line.pointFrom];
          }
        });
      }
    });
    if (newActive !== this.active[u]) {
      range.forEach(u => {
        const point = this.points[u];
        if (point) {
          this.lineWithPoint[u].forEach(line => {
            if (line && line.notGate && line.pointFrom === u) {
              this.setNeedUpdate(line.pointTo);
            }
          });
        }
      });
    }
    range.forEach(u => {
      this.active[u] = newActive;
    });
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
    this.clearNeedUpdate();
    this.fa.filter((v, ind) => v === ind && this.points[v]).forEach(u => {
      this.setNeedUpdate(u);
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
  /**
   * 
   * @param value.interval 当需要传入undefined时，请使用0
   */
  private setPoint(u: number, value: ModifyOption<LogicPoint>) {
    const point = this.points[u];
    if (point) {
      point.power = value.power ?? point.power;
      point.x = value.x ?? point.x;
      point.y = value.y ?? point.y;
      if (value.interval !== undefined) {
        point.interval = value.interval === 0 ? undefined : value.interval;
      }
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
  private putStuff(stuff: LogicBlockFileModule.LogicBlockFileContent, offset: { x: number; y: number; } = { x: 0, y: 0 }) {
    const pointOffset = this.points.length;
    const positionOffset = Math.floor(Math.random() * 30 + 10);
    stuff.points.forEach(v => {
      this.addPoint({
        ...v,
        x: v.x + offset.x + positionOffset,
        y: v.y + offset.y + positionOffset,
      });
    });
    stuff.lines.forEach(v => {
      this.addLine({
        ...v,
        pointFrom: pointOffset + v.pointFrom,
        pointTo: pointOffset + v.pointTo,
      });
    });
    stuff.texts.forEach(v => {
      this.addText({
        ...v,
        x: v.x + offset.x + positionOffset,
        y: v.y + offset.y + positionOffset,
      });
    });
  }
  getControllerCopy() {
    const { pointPointer, linePointer, textPointer } = this.getPointer(true);
    return {
      sliceStuff: (pointSet: number[], textSet: number[]): LogicBlockFileModule.LogicBlockFileContent => {
        const map = {} as Record<number, number | undefined>;
        pointSet.forEach((v, ind) => {
          map[pointPointer[v]] = ind;
        });
        const points = pointSet.flatMap(u => {
          const point = this.points[pointPointer[u]];
          return point ? [{ ...point }] : [];
        });
        const lines = this.lines.flatMap(line => {
          if (!line) return [];
          const pointFrom = map[line.pointFrom];
          const pointTo = map[line.pointTo];
          return pointFrom !== undefined && pointTo !== undefined ? [{ ...line, pointFrom, pointTo }] : [];
        });
        const texts = textSet.flatMap(u => {
          const text = this.texts[textPointer[u]];
          return text ? [{ ...text }] : [];
        });
        return {
          points,
          lines,
          texts,
        };
      },
      putStuff: (stuff: LogicBlockFileModule.LogicBlockFileContent, offset: { x: number; y: number; } = { x: 0, y: 0 }) => {
        this.putStuff(stuff, offset);
      },
      /**
       * 
       * @param value.interval 当需要传入undefined时，请使用0
       */
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
type ReturnTypeOf<T extends Function> = T extends () => infer P ? P : unknown;
export type LogicBlockRuntimeController = ReturnTypeOf<typeof LogicBlockRuntime.prototype.getControllerCopy>;
