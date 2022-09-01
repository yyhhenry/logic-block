import React, { useCallback, useEffect, useState } from 'react';
import { EventEmitter } from 'stream';
import { AppDataBase } from '../AppDataBase';
import { AppAlert } from '../BasicModule/AppAlert';
import { Geometry } from '../BasicModule/Geometry';
import { AppFileContent, isAppFileContent, LogicBlockFileModule } from './AppFileContent';
import { LogicBlockRuntime } from './LogicBlockRuntime';
const GeoPoint = Geometry.Point;
namespace EditorColorTable {
  export const activeLine = 'rgb(30,60,250)';
  export const activeNode = 'rgb(30,60,250)';
  export const powerNode = 'rgb(250,20,100)';
  export const inactiveNode = 'rgb(160,160,70)';
  export const inactiveLine = 'gray';
}
const database = AppDataBase.getDataBase('yyhhenry-logic-block');
namespace EditorView {
  export interface MenuViewProps {

  }
  export const MenuView: React.FC<MenuViewProps> = props => {
    return (
      <g>
      </g>
    );
  };
  export interface PointViewProps {
    point: LogicBlockFileModule.Point;
    active: boolean;
  }
  export const PointView: React.FC<PointViewProps> = props => {
    const { point, active } = props;
    const sideLength = point.power ? 25 : 20;
    return (
      <rect
        x={point.x - sideLength / 2}
        y={point.y - sideLength / 2}
        width={sideLength}
        height={sideLength}
        rx={sideLength / 4}
        ry={sideLength / 4}
        style={{
          fill: point.power ? EditorColorTable.powerNode : (active ? EditorColorTable.activeNode : EditorColorTable.inactiveNode),
        }}
      />
    );
  };
  export interface LineViewProps {
    pointFrom: LogicBlockFileModule.Point;
    pointTo: LogicBlockFileModule.Point;
    notGate: boolean;
    active: boolean;
  }
  export const LineView: React.FC<LineViewProps> = props => {
    const { pointFrom, pointTo, notGate, active } = props;
    const lineWidth = 7;
    const baseColor = [EditorColorTable.inactiveLine, EditorColorTable.activeLine];
    const [stroke, strokeRev] = active ? baseColor.reverse() : baseColor;
    if (!notGate) {
      return (
        <g>
          <line
            x1={pointFrom.x}
            y1={pointFrom.y}
            x2={pointTo.x}
            y2={pointTo.y}
            style={{
              strokeWidth: lineWidth,
              stroke,
              strokeLinecap: 'round',
            }}
          />
        </g>
      );
    }
    const gPtFrom = GeoPoint.fromJSON(pointFrom);
    const vec = gPtFrom.vecTo(pointTo);
    const dis = vec.dis();
    const midPoint = gPtFrom.midTo(pointTo);
    const iconLen = Math.min(20, dis / 3);
    const iconVec = vec.kMul(iconLen / dis / 2);
    const vertical = vec.rotate(Math.PI / 2).unit().kMul(iconLen / Math.sqrt(3));
    const endPoint = midPoint.add(iconVec);
    const basePoint = midPoint.sub(iconVec);
    return (
      <g>
        <line
          x1={pointFrom.x}
          y1={pointFrom.y}
          x2={basePoint.x}
          y2={basePoint.y}
          style={{
            strokeWidth: lineWidth,
            stroke,
            strokeLinecap: 'round',
          }}
        />
        <line
          x1={pointTo.x}
          y1={pointTo.y}
          x2={endPoint.x}
          y2={endPoint.y}
          style={{
            strokeWidth: lineWidth,
            stroke: strokeRev,
            strokeLinecap: 'round',
          }}
        />
        <g style={{
          strokeWidth: lineWidth / 2,
          stroke,
          fill: 'white',
          strokeLinejoin: 'round',
        }}>
          <path d={`M${basePoint.add(vertical)} L${endPoint} L${basePoint.sub(vertical)} Z`}></path>
          <circle cx={endPoint.x} cy={endPoint.y} r={iconLen / 5} style={{
            stroke: strokeRev,
          }} />
        </g>
      </g>
    );
  };
  export interface TextViewProps {
    x: number;
    y: number;
    str: string;
    size: number;
  }
  export const TextView: React.FC<TextViewProps> = props => {
    const { x, y, str, size } = props;
    return (
      <text style={{ userSelect: 'none' }} x={x} y={y} fontSize={size}>{str}</text>
    );
  };
  export interface TableViewProps {
    runtime: LogicBlockRuntime;
    controller: {
      save: () => void;
    };
  }
  export const TableView: React.FC<TableViewProps> = props => {
    const { runtime, controller } = props;
    const fileContent = runtime.renderFileContent();
    const active = runtime.renderActive();
    const points = fileContent.points.map((point, ind) => (
      <g key={ind} onClick={() => {
        runtime.setPointPower(ind);
        controller.save();
      }}>
        <PointView point={point} active={active[ind] ?? false} />
      </g>
    ));
    const lines = fileContent.lines.map((line, ind) => {
      const pointFrom = fileContent.points[line.pointFrom];
      const pointTo = fileContent.points[line.pointTo];
      return <LineView key={ind} pointFrom={pointFrom} pointTo={pointTo} notGate={line.notGate} active={active[line.pointFrom] ?? false} />;
    });
    const texts = fileContent.texts.map((text, ind) => {
      return (
        <TextView key={ind} x={text.x} y={text.y} str={text.str} size={text.size} />
      );
    });
    return (
      <svg style={{ width: '100%', height: '100%' }}>
        {lines}
        {points}
        {texts}
      </svg>
    );
  };
}
const RecordDepth = 10;
/**
 * TODO
 */
export class UndoRecord<RecordType,> {
  private records: RecordType[];
  private pointer: number;
  constructor(origin: RecordType) {
    this.records = [origin];
    this.pointer = 0;
  }
  push(newData: RecordType) {
    while (this.pointer !== this.records.length - 1) {
      this.records.pop();
    }
    this.pointer++;
    this.records.push(newData);
    if (this.records.length > RecordDepth) {
      this.pointer--;
      this.records.shift();
    }
    console.log(this.pointer, this.records);
  }
  undo(): RecordType | undefined {
    if (this.pointer === 0) {
      return undefined;
    } else {
      return this.records[--this.pointer];
    }
  }
  redo(): RecordType | undefined {
    if (this.pointer === this.records.length - 1) {
      return undefined;
    } else {
      return this.records[++this.pointer];
    }
  }
}
export interface AppEditorContentProps {
  filename?: string;
  emitter: EventEmitter;
}
export const AppEditorContent: React.FC<AppEditorContentProps> = props => {
  const initState = () => {
    return {
      undoRecord: undefined as UndoRecord<LogicBlockFileModule.LogicBlockFileContent> | undefined,
      runtime: undefined as LogicBlockRuntime | undefined,
      failed: false,
      renderLoopCount: 0,
    };
  };
  const { emitter } = props;
  const [state, setState] = useState(initState);
  const { undoRecord, runtime, failed, renderLoopCount } = state;
  const boxMargin = 10;
  useEffect(() => {
    setState(initState());
    if (props.filename !== undefined) {
      database.queryTransaction('file', isAppFileContent, props.filename).then(v => {
        if (v) {
          const runtime = new LogicBlockRuntime(v.content);
          const undoRecord = new UndoRecord(runtime.renderFileContent());
          setState({
            undoRecord,
            runtime,
            failed: false,
            renderLoopCount: 0,
          });
        } else {
          setState({
            undoRecord: undefined,
            runtime: undefined,
            failed: true,
            renderLoopCount: 0,
          });
        }
      });
    }
  }, [props.filename]);
  requestAnimationFrame(() => {
    setState({ ...state, renderLoopCount: renderLoopCount + 1 });
  });
  const undo = useCallback(() => {
    if (undoRecord) {
      const content = undoRecord.undo();
      if (content) {
        setState({ ...state, runtime: new LogicBlockRuntime(content) });
      } else {
        AppAlert.confirm('已经没有可以撤销的项', false);
      }
    }
  }, [undoRecord, state]);
  const redo = useCallback(() => {
    if (undoRecord) {
      const content = undoRecord.redo();
      if (content) {
        setState({ ...state, runtime: new LogicBlockRuntime(content) });
      } else {
        AppAlert.confirm('已经没有可以撤销的项', false);
      }
    }
  }, [undoRecord, state]);
  useEffect(() => {
    emitter.addListener('undo', undo);
    emitter.addListener('redo', redo);
    return () => {
      emitter.removeListener('undo', undo);
      emitter.removeListener('redo', redo);
    };
  }, [emitter, redo, undo]);
  const controller = {
    save: () => {
      if (runtime !== undefined && props.filename !== undefined) {
        const content = runtime.renderFileContent();
        if (undoRecord) {
          undoRecord.push(content);
        }
        (value => {
          database.modifyTransaction('file', store => {
            store.clear();
            store.put(value);
          });
        })({
          filename: props.filename,
          content,
        } as AppFileContent);
      }
    }
  };
  return (
    <div
      style={{
        margin: boxMargin,
        height: `calc(100% - ${boxMargin * 2}px)`,
        width: `calc(100% - ${boxMargin * 2}px)`,
        backgroundColor: 'white',
        position: 'absolute',
        borderRadius: boxMargin,
        overflow: 'hidden',
        fontSize: 20,
      }}
    >
      {
        props.filename !== undefined
          ? (
            failed
              ? (
                <div style={{ textAlign: 'center' }}>
                  <h1>{'File Not Found: 不正确的filename'}</h1>
                </div>
              ) : (
                runtime === undefined ?
                  (
                    <div style={{ textAlign: 'center' }}>
                      <h1>{'加载中'}</h1>
                    </div>
                  ) : (
                    <EditorView.TableView runtime={runtime} controller={controller} />
                  )
              )
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h1>{'Filename Not Found: 缺少URL参数'}</h1>
            </div>
          )
      }
    </div>
  );
};

// (() => {
//   let database = AppDataBase.getDataBase('yyhhenry-logic-block');
//   database.modifyTransaction('file', store => {
//     store.clear();
//     store.put({ filename: 'yyh', content: { "points": [{ "x": 428, "y": 238, "power": false }, { "x": 424, "y": 405, "power": true }, { "x": 560, "y": 280, "power": false }, { "x": 601, "y": 308, "power": false }, { "x": 656, "y": 308, "power": false }, { "x": 564, "y": 334, "power": false }, { "x": 566, "y": 459, "power": false }, { "x": 660, "y": 458, "power": false }, { "x": 795, "y": 360, "power": false }, { "x": 835, "y": 385, "power": false }, { "x": 882, "y": 386, "power": false }, { "x": 792, "y": 410, "power": false }, { "x": 976, "y": 342, "power": false }, { "x": 239, "y": 431, "power": false }, { "x": 239, "y": 223, "power": false }, { "x": 1205, "y": 341, "power": false }], "lines": [{ "pointFrom": 2, "pointTo": 3, "notGate": true }, { "pointFrom": 3, "pointTo": 4, "notGate": true }, { "pointFrom": 5, "pointTo": 3, "notGate": true }, { "pointFrom": 0, "pointTo": 2, "notGate": false }, { "pointFrom": 1, "pointTo": 5, "notGate": false }, { "pointFrom": 1, "pointTo": 6, "notGate": false }, { "pointFrom": 6, "pointTo": 7, "notGate": true }, { "pointFrom": 8, "pointTo": 9, "notGate": true }, { "pointFrom": 9, "pointTo": 10, "notGate": true }, { "pointFrom": 11, "pointTo": 9, "notGate": true }, { "pointFrom": 4, "pointTo": 8, "notGate": false }, { "pointFrom": 7, "pointTo": 11, "notGate": false }, { "pointFrom": 10, "pointTo": 12, "notGate": false }, { "pointFrom": 1, "pointTo": 13, "notGate": false }, { "pointFrom": 0, "pointTo": 14, "notGate": false }, { "pointFrom": 12, "pointTo": 15, "notGate": false }], "texts": [{ "str": "输入1", "x": 200, "y": 180, "size": 25 }, { "str": "输入2", "x": 200, "y": 480, "size": 25 }, { "str": "AND", "x": 600, "y": 280, "size": 25 }, { "str": "NOT", "x": 600, "y": 500, "size": 25 }, { "str": "AND", "x": 800, "y": 440, "size": 25 }, { "str": "无论输入是什么，输出都是False", "x": 600, "y": 580, "size": 16 }] } } as AppFileContent);
//   });
// })();
