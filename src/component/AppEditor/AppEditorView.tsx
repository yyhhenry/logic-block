import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LogicBlockFileModule } from './AppFileContent';
import { LogicBlockRuntime, LogicBlockRuntimeController } from './LogicBlockRuntime';
import { Geometry } from '../BasicModule/Geometry';
import { EventEmitter } from 'stream';
import { AppOptionList } from '../BasicModule/AppOptionList';
import { AppAlert } from '../BasicModule/AppAlert';
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
    focus: boolean;
  }
  export const PointView: React.FC<PointViewProps> = props => {
    const { point, active, focus } = props;
    const sideLength = point.power ? 25 : 20;
    const shadowSide = sideLength + 15;
    return (
      <g>
        {
          focus
            ? (
              <rect
                x={point.x - shadowSide / 2}
                y={point.y - shadowSide / 2}
                width={shadowSide}
                height={shadowSide}
                rx={shadowSide / 3}
                ry={shadowSide / 3}
                style={{
                  fill: 'rgba(0,0,0,0.3)',
                }}
              />
            ) : (
              undefined
            )
        }
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
      </g>
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
    focus: boolean;
  }
  export const TextView: React.FC<TextViewProps> = props => {
    const { x, y, str, size, focus } = props;
    return (
      <g>
        {
          focus
            ? (
              <rect
                x={x - size / 2}
                y={y - size}
                width={size / 2}
                height={size / 2}
                stroke={'black'}
                rx={size / 8}
                fill={'rgba(0,0,0,0.3)'}
              />
            )
            : undefined
        }
        <text
          style={{ userSelect: 'none' }}
          x={x}
          y={y}
          fontSize={size}
        >{str}</text>
      </g>
    );
  };
  export interface TableViewProps {
    runtime: LogicBlockRuntime;
    emitter: EventEmitter;
  }
  interface CommonMenuArgs {
    controller: LogicBlockRuntimeController;
    ind: number;
    rect: DOMRect;
  }
  interface PointMenuArgs extends CommonMenuArgs {
    point: LogicBlockFileModule.Point;
  }
  interface LineMenuArgs extends CommonMenuArgs {
    line: LogicBlockFileModule.Line;
  }
  interface TextMenuArgs extends CommonMenuArgs {
    text: LogicBlockFileModule.Text;
  }
  export const TableView: React.FC<TableViewProps> = props => {
    const { runtime, emitter } = props;
    const fileContent = runtime.renderFileContent();
    const active = runtime.renderActive();
    const controller = runtime.getControllerCopy();
    const initState = () => ({
      menuType: 'none' as 'point' | 'line' | 'text' | 'text-resize' | 'none',
      pointMenu: undefined as PointMenuArgs | undefined,
      lineMenu: undefined as LineMenuArgs | undefined,
      textMenu: undefined as TextMenuArgs | undefined,
      textResizeBuff: undefined as number | undefined,
    });
    const [state, setState] = useState(initState);
    const scale = useRef(1);
    const mouseInfo = useRef({
      button0: false,
      x: 0,
      y: 0,
    });
    const commonMouseDown = (ev: React.MouseEvent<SVGGElement, MouseEvent>) => {
      mouseInfo.current = ({
        x: ev.clientX,
        y: ev.clientY,
        button0: true,
      });
      clearMenuState();
    };
    const focus = useRef({
      points: new Set<number>(),
      lines: new Set<number>(),
      texts: new Set<number>(),
    });
    const blurAll = useCallback(() => {
      focus.current.points.clear();
      focus.current.lines.clear();
      focus.current.texts.clear();
    }, []);
    const transformArgs = useRef({ x: 0, y: 0 });
    const { menuType, pointMenu, lineMenu, textMenu, textResizeBuff } = state;
    const clearMenuState = useCallback(() => {
      setState({
        menuType: 'none',
        pointMenu: undefined,
        lineMenu: undefined,
        textMenu: undefined,
        textResizeBuff: undefined,
      });
    }, []);
    const points = fileContent.points.map((point, ind) => (
      <g key={ind}
        onMouseDown={ev => {
          if (ev.button === 0) {
            const points = focus.current.points;
            if (!ev.ctrlKey) {
              blurAll();
              points.add(ind);
            } else {
              if (points.has(ind)) {
                points.delete(ind);
              } else {
                points.add(ind);
              }
            }
            commonMouseDown(ev);
            ev.stopPropagation();
          }
        }}
        onContextMenu={ev => {
          setState({ menuType: 'point', pointMenu: { controller, point, ind, rect: ev.currentTarget.getBoundingClientRect() }, lineMenu: undefined, textMenu: undefined, textResizeBuff: undefined });
          ev.preventDefault();
          ev.stopPropagation();
        }}
      >
        <PointView point={point} active={active[ind]} focus={focus.current.points.has(ind)} />
      </g>
    ));
    const lines = fileContent.lines.map((line, ind) => {
      const pointFrom = fileContent.points[line.pointFrom];
      const pointTo = fileContent.points[line.pointTo];
      return (
        <g key={ind}
          onContextMenu={ev => {
            setState({ menuType: 'line', pointMenu: undefined, lineMenu: { controller, line, ind, rect: ev.currentTarget.getBoundingClientRect() }, textMenu: undefined, textResizeBuff: undefined });
            ev.preventDefault();
            ev.stopPropagation();
          }}
        >
          <LineView pointFrom={pointFrom} pointTo={pointTo} notGate={line.notGate} active={active[line.pointFrom]} />
        </g>
      );
    });
    const texts = fileContent.texts.map((text, ind) => {
      return (
        <g key={ind}
          onMouseDown={ev => {
            if (ev.button === 0) {
              const texts = focus.current.texts;
              if (!ev.ctrlKey) {
                blurAll();
                texts.add(ind);
              } else {
                if (texts.has(ind)) {
                  texts.delete(ind);
                } else {
                  texts.add(ind);
                }
              }
              commonMouseDown(ev);
              ev.stopPropagation();
            }
          }}
          onContextMenu={ev => {
            setState({ menuType: 'text', pointMenu: undefined, lineMenu: undefined, textMenu: { controller, text, ind, rect: ev.currentTarget.getBoundingClientRect() }, textResizeBuff: undefined });
            ev.preventDefault();
            ev.stopPropagation();
          }}
        >
          <TextView x={text.x} y={text.y} str={text.str} size={text.size} focus={focus.current.texts.has(ind)} />
        </g>
      );
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
      } else if (menuType === 'line' && lineMenu) {
        const { line, controller, ind, rect } = lineMenu;
        return (
          <AppOptionList
            options={
              line.notGate
                ? ['取消非门', '转换方向', '', '删除连线']
                : ['设置非门', '', '删除连线']
            }
            symbol={line}
            headerNodeRect={{ left: (rect.left + rect.right) / 2, bottom: (rect.top + rect.bottom) / 2 }}
            curtain={false}
            resolve={res => {
              if (res === '取消非门' || res === '设置非门') {
                controller.setLine(ind, 'notGate');
                emitter.emit('save');
              } else if (res === '转换方向') {
                controller.setLine(ind, 'reverse');
                emitter.emit('save');
              } else if (res === '删除连线') {
                controller.removeLine(ind);
                emitter.emit('save');
              }
              clearMenuState();
            }}
          />
        );
      } else if (menuType === 'text' && textMenu) {
        const { text, controller, ind, rect } = textMenu;
        return (
          <AppOptionList
            options={['编辑文字', '改变大小 >', '', '删除文字']}
            symbol={text}
            headerNodeRect={{ left: rect.right, bottom: rect.bottom }}
            curtain={false}
            resolve={res => {
              if (res === '编辑文字') {
                AppAlert.prompt('编辑文字', text.str).then(v => {
                  if (v !== null) {
                    controller.setText(ind, { str: v });
                    emitter.emit('save');
                  }
                });
              } else if (res === '删除文字') {
                controller.removeText(ind);
                emitter.emit('save');
              } else if (res === '改变大小 >') {
                setState({ ...state, menuType: 'text-resize' });
                return;
              }
              clearMenuState();
            }}
          />
        );
      } else if (menuType === 'text-resize' && textMenu) {
        const { text, controller, ind, rect } = textMenu;
        const buffSize = textResizeBuff ?? text.size;
        return (
          <AppOptionList
            options={['< 取消', '放大', '缩小', '完成']}
            symbol={{ text, type: 'resize' }}
            headerNodeRect={{ left: rect.right, bottom: rect.bottom }}
            curtain={false}
            resolve={res => {
              if (res === '放大') {
                const size = buffSize + Math.max(1, Math.round(buffSize * .1));
                setState({ ...state, textResizeBuff: size });
                controller.setText(ind, { size });
              } else if (res === '缩小') {
                const size = Math.max(1, buffSize - Math.max(1, Math.round(buffSize * .1)));
                setState({ ...state, textResizeBuff: size });
                controller.setText(ind, { size });
              } else if (res === '< 取消') {
                controller.setText(ind, { size: text.size });
                setState({ ...state, menuType: 'text', textResizeBuff: undefined });
              } else if (res === '完成') {
                emitter.emit('save');
                clearMenuState();
              }
            }}
          />
        );
      }
      return undefined;
    };
    const disabled = useRef(false);
    const editing = useCallback(() => {
      disabled.current = true;
    }, []);
    const onSave = useCallback(() => {
      disabled.current = false;
    }, []);
    const moveActivated = useRef(false);
    const onMouseUp = useCallback((ev: MouseEvent) => {
      if (ev.button === 0) {
        mouseInfo.current = ({
          x: ev.clientX,
          y: ev.clientY,
          button0: false,
        });
        moveActivated.current = false;
        if (disabled.current) {
          emitter.emit('save');
        }
      }
    }, [emitter]);
    const onMouseMove = useCallback((ev: MouseEvent) => {
      if (mouseInfo.current.button0) {
        const movement = {
          x: (ev.clientX - mouseInfo.current.x) / scale.current,
          y: (ev.clientY - mouseInfo.current.y) / scale.current,
        };
        const dis = (x: number, y: number) => Math.sqrt(x * x + y * y);
        if (!moveActivated.current && dis(movement.x, movement.y) * scale.current < 10) {
          return;
        }
        moveActivated.current = true;
        const points = focus.current.points;
        const texts = focus.current.texts;
        if (points.size || texts.size) {
          if (!disabled.current) {
            emitter.emit('editing');
          }
          for (const point of points) {
            controller.movePoint(point, { dx: movement.x, dy: movement.y });
          }
          for (const text of texts) {
            controller.moveText(text, { dx: movement.x, dy: movement.y });
          }
        } else {
          transformArgs.current = ({
            x: transformArgs.current.x + movement.x,
            y: transformArgs.current.y + movement.y,
          });
        }
        mouseInfo.current = ({
          x: ev.clientX,
          y: ev.clientY,
          button0: mouseInfo.current.button0,
        });
      }
    }, [emitter, controller]);
    useEffect(() => {
      emitter.addListener('editing', editing);
      emitter.addListener('save', onSave);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
      return () => {
        emitter.removeListener('editing', editing);
        emitter.removeListener('save', onSave);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mousemove', onMouseMove);
      };
    }, [emitter, editing, onSave, onMouseUp, onMouseMove]);
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
          onWheel={ev => {
            const rate = 1.05;
            const rect = ev.currentTarget.getBoundingClientRect();
            const relMouse = {
              x: ev.clientX - rect.left,
              y: ev.clientY - rect.top,
            };
            if (ev.deltaY < 0) {
              transformArgs.current = ({
                x: transformArgs.current.x - relMouse.x * (rate - 1) / scale.current,
                y: transformArgs.current.y - relMouse.y * (rate - 1) / scale.current,
              });
              scale.current = (scale.current * rate);
            } else {
              transformArgs.current = ({
                x: transformArgs.current.x - relMouse.x * (1 / rate - 1) / scale.current,
                y: transformArgs.current.y - relMouse.y * (1 / rate - 1) / scale.current,
              });
              scale.current = (scale.current / 1.05);
            }
          }}
          onMouseDown={ev => {
            if (ev.button === 0) {
              commonMouseDown(ev);
              blurAll();
            }
          }}
          onContextMenu={ev => {
            clearMenuState();
            AppAlert.alert('空白处右键菜单：尚未开发');
            ev.stopPropagation();
            ev.preventDefault();
          }}
        >
          <g transform={`scale(${scale.current},${scale.current})`}>
            <g transform={`translate(${transformArgs.current.x},${transformArgs.current.y})`}>
              {lines}
              {points}
              {texts}
            </g>
          </g>
        </svg>
        {renderMenu()}
      </div>
    );
  };
}
