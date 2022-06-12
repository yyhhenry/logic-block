export function easeFunc(x: number) {
    return .5 - .5 * Math.cos(x * Math.PI);
}
export class EaseAnime {
    private startTime: number;
    private endTime: number;
    private startValue: number;
    private endValue: number;
    constructor(startValue: number) {
        this.startTime = new Date().getTime()
        this.endTime = this.startTime;
        this.startValue = startValue;
        this.endValue = startValue;
    }
    finished() {
        return new Date().getTime() > this.endTime;
    }
    animeTo(endValue: number, duration: number) {
        this.startValue = this.getValue();
        this.startTime = new Date().getTime();
        this.endTime = this.startTime + duration;
        this.endValue = endValue;
        return this;
    }
    getValue() {
        let thisTime = new Date().getTime();
        if (thisTime >= this.endTime || this.endTime - this.startTime < 1) {
            return this.endValue;
        } else if (thisTime <= this.startTime) {
            return this.startValue;
        } else {
            let timeRate = (thisTime - this.startTime) / (this.endTime - this.startTime);
            let valueDelta = easeFunc(timeRate) * (this.endValue - this.startValue);
            return valueDelta + this.startValue;
        }
    }
}
