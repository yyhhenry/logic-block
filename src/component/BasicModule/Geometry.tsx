export namespace Geometry {
  export interface RangeLike {
    l: number;
    r: number;
  }
  export class Range {
    readonly l: number;
    readonly r: number;
    private constructor(v: RangeLike) {
      if (v.l > v.r) {
        this.l = v.r;
        this.r = v.l;
      } else {
        this.l = v.l;
        this.r = v.r;
      }
    }
    static fromRange(v: RangeLike) {
      return new Range(v);
    }
    static fromNumber(l: number, r: number) {
      return Range.fromRange({ l, r });
    }
    contains(x: number) {
      return x >= this.l && x <= this.r;
    }
    offset(x: number) {
      return Range.fromNumber(this.l + x, this.r + x);
    }
    kMul(x: number) {
      return Range.fromNumber(this.l * x, this.r * x);
    }
    dis() {
      return this.r - this.l;
    }
  }
  export interface PointLike {
    x: number;
    y: number;
  }
  export class Point {
    readonly x: number;
    readonly y: number;
    /**
     * @param v An angle measured in radians
     * @returns A unit vector
     */
    static unitFromAngle(v: number) {
      return Point.fromJSON({
        x: Math.cos(v),
        y: Math.sin(v),
      });
    }
    static fromNumber(x: number, y: number) {
      return Point.fromJSON({ x, y });
    }
    static fromJSON(v: PointLike) {
      return new Point(v);
    }
    private constructor(v: PointLike) {
      this.x = v.x;
      this.y = v.y;
    }
    vecTo(v: PointLike) {
      return Point.fromJSON({
        x: v.x - this.x,
        y: v.y - this.y,
      });
    }
    dis() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    disTo(v: PointLike) {
      return this.vecTo(v).dis();
    }
    kMul(k: number) {
      return Point.fromJSON({
        x: this.x * k,
        y: this.y * k,
      });
    }
    unit() {
      return this.kMul(1 / this.dis());
    }
    cpxMul(v: PointLike) {
      return Point.fromJSON({
        x: this.x * v.x - this.y * v.y,
        y: this.x * v.y + this.y * v.x,
      });
    }
    angle() {
      return Math.atan2(this.y, this.x);
    }
    rotate(v: number) {
      return this.cpxMul(Point.unitFromAngle(v));
    }
    add(v: PointLike) {
      return Point.fromJSON({
        x: this.x + v.x,
        y: this.y + v.y,
      });
    }
    sub(v: PointLike) {
      return Point.fromJSON({
        x: this.x - v.x,
        y: this.y - v.y,
      });
    }
    midTo(v: PointLike) {
      return this.add(this.vecTo(v).kMul(.5));
    }
    toString() {
      return `${this.x},${this.y}`;
    }
  }
}
