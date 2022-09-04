import React, { useState } from 'react';
import { LogicBlockFileModule } from './AppFileContent';
import { LogicBlockRuntime, LogicBlockRuntimeController } from './LogicBlockRuntime';
import { Geometry } from '../BasicModule/Geometry';
import { EventEmitter } from 'stream';
import { AppOptionList } from '../BasicModule/AppOptionList';
const GeoPoint = Geometry.Point;
export namespace EditorColorTable {
  export const activeLine = 'rgb(30,60,250)';
  export const activeNode = 'rgb(30,60,250)';
  export const powerNode = 'rgb(250,20,100)';
  export const inactiveNode = 'rgb(160,160,70)';
  export const inactiveLine = 'gray';
}
export namespace AppEditorView {
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
    emitter: EventEmitter;
  }
  interface PointMenuArgs {
    controller: LogicBlockRuntimeController;
    point: LogicBlockFileModule.Point;
    ind: number;
    rect: DOMRect;
  }
  export const TableView: React.FC<TableViewProps> = props => {
    const { runtime, emitter } = props;
    const fileContent = runtime.renderFileContent();
    const active = runtime.renderActive();
    const controller = runtime.getControllerCopy();
    const initState = () => ({
      menuType: 'none' as 'point' | 'line' | 'text' | 'none',
      pointMenu: undefined as PointMenuArgs | undefined,
    });
    const [state, setState] = useState(initState);
    const { menuType, pointMenu } = state;
    const clearMenuState = () => {
      setState({
        menuType: 'none',
        pointMenu: undefined,
      });
    };
    const points = fileContent.points.map((point, ind) => (
      <g key={ind}
        onContextMenu={ev => {
          setState({ menuType: 'point', pointMenu: { controller, point, ind, rect: ev.currentTarget.getBoundingClientRect() } });
          ev.preventDefault();
          ev.stopPropagation();
        }}
      >
        <PointView point={point} active={active[ind]} />
      </g>
    ));
    const lines = fileContent.lines.map((line, ind) => {
      const pointFrom = fileContent.points[line.pointFrom];
      const pointTo = fileContent.points[line.pointTo];
      return <LineView key={ind} pointFrom={pointFrom} pointTo={pointTo} notGate={line.notGate} active={active[line.pointFrom]} />;
    });
    const texts = fileContent.texts.map((text, ind) => {
      return <TextView key={ind} x={text.x} y={text.y} str={text.str} size={text.size} />;
    });
    const renderMenu = () => {
      if (menuType === 'point' && pointMenu) {
        const { point, controller, ind, rect } = pointMenu;
        return (
          <AppOptionList
            options={[point.power ? '清除源' : '生成源', '', '删除节点']}
            symbol={point}
            headerNodeRect={{ left: rect.right, bottom: rect.bottom }}
            curtain={false}
            resolve={res => {
              if (res === '清除源' || res === '生成源') {
                controller.setPoint(ind, { power: !point.power });
                emitter.emit('save');
              } else if (res === '删除节点') {
                controller.removePoint(ind);
                emitter.emit('save');
              }
              clearMenuState();
            }}
          />
        );
      }
      return undefined;
    };
    return (
      <div style={{
        width: '100%',
        height: '100%',
      }}>
        <svg
          style={{
            width: '100%',
            height: '100%',
          }}
          onClick={() => clearMenuState()}
          onContextMenu={() => clearMenuState()}
        >
          {lines}
          {points}
          {texts}
        </svg>
        {renderMenu()}
      </div>
    );
  };
}
