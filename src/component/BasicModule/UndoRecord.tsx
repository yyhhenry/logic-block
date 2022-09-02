
export class UndoRecord<RecordType,> {
  private records: RecordType[];
  private pointer: number;
  readonly recordDepth:number;
  constructor(origin: RecordType,recordDepth:number) {
    this.records = [origin];
    this.pointer = 0;
    this.recordDepth = recordDepth;
  }
  push(newData: RecordType) {
    while (this.pointer !== this.records.length - 1) {
      this.records.pop();
    }
    this.pointer++;
    this.records.push(newData);
    if (this.records.length > this.recordDepth) {
      this.pointer--;
      this.records.shift();
    }
  }
  undo(): RecordType | undefined {
    if (this.pointer === 0) {
      return undefined;
    } else {
      this.pointer--;
      return this.records[this.pointer];
    }
  }
  redo(): RecordType | undefined {
    if (this.pointer === this.records.length - 1) {
      return undefined;
    } else {
      this.pointer++;
      return this.records[this.pointer];
    }
  }
}
