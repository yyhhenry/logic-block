import React from 'react';
import { LogicBlockFileModule } from './AppFileContent';
import { LogicBlockRuntime } from './LogicBlockRuntime';
import { Geometry } from '../BasicModule/Geometry';
const GeoPoint = Geometry.Point;
export namespace EditorColorTable {
  export const activeLine = 'rgb(30,60,250)';
  export const activeNode = 'rgb(30,60,250)';
  export const powerNode = 'rgb(250,20,100)';
  export const inactiveNode = 'rgb(160,160,70)';
  export const inactiveLine = 'gray';
}
export namespace AppEditorView {
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
