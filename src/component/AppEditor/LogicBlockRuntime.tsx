import { LogicBlockFileModule } from "./AppFileContent";

const MaxOperatorInOneTick = 128;

type LogicPoint = LogicBlockFileModule.Point;
type LogicLine = LogicBlockFileModule.Line;
type LogicText = LogicBlockFileModule.Text;
export class LogicBlockRuntime {
  private points: (LogicPoint | undefined)[];
  private lines: (LogicLine | undefined)[];
  private texts: (LogicText | undefined)[];
  private fa: number[];
  private child: number[][];
  private active: boolean[];
  private lineWithPoint: LogicLine[][];
  private queue: number[];
  private vis: Set<number>;
  constructor(originFileContent: LogicBlockFileModule.LogicBlockFileContent) {
    this.points = originFileContent.points;
    this.lines = originFileContent.lines;
    this.texts = originFileContent.texts;
    this.fa = this.points.map((_v, ind) => ind);
    this.child = this.points.map((_v, ind) => [ind]);
    this.active = originFileContent.points.map((v) => v.power);
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
    for (let i = 0; i < MaxOperatorInOneTick; i++) {
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
  private rebuildPoint(u: number) {
    const point = this.points[u];
    if (point) {
      this.active[u] = point.power;
      this.lineWithPoint[u].forEach(line => {
        if (line && line.notGate && line.pointTo === u) {
          this.active[u] ||= !this.active[line.pointFrom];
        }
      });
    }
  }
  private rebuildMap(u?: number) {
    const range = u ? this.child[this.getf(u)] : this.points.map((_v, ind) => ind);
    const originActive = [...this.active];
    range.forEach(u => {
      this.rebuildPoint(u);
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
      (v === undefined ? [] : [this.active[ind]]) as boolean[]);
  }
  /**
   * 
   * @returns 数据的深拷贝
   */
  renderFileContent() {
    let ind = 0;
    const pointer = this.points.map(v => v === undefined ? ind : ind++);
    const lineRebuilder = (v: LogicLine): LogicLine => ({
      pointFrom: pointer[v.pointFrom],
      pointTo: pointer[v.pointTo],
      notGate: v.notGate,
    });
    return {
      points: this.points.flatMap(v => (v !== undefined ? [{ ...v }] : []) as LogicPoint[]),
      lines: (this.lines.flatMap(v => (v !== undefined ? [lineRebuilder(v)] : []) as LogicLine[])),
      texts: this.texts.flatMap(v => (v !== undefined ? [{ ...v }] : []) as LogicText[]),
    };
  }
  setPointPower(u: number, v?: boolean) {
    const point = this.points[u];
    if (point) {
      point.power = v ?? !point.power;
      this.needUpdate(u);
    }
  }
}
