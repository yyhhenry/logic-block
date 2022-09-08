import React, { useEffect, useState } from 'react';
import { ColorTable, ZIndexTable } from './CommonHead';
import { HoveredNode } from './HoveredNode';
import './AppOptionList.css';
export interface AppOptionListProps {
  /**
   * 形如['A', 'B', '', 'C']的列表，非空串表示一个要显示的菜单选项（菜单选项应该避免重复），空串代表一个间隔标识。
   */
  options: string[];
  symbol?: any;
  /**
   * 传入所点击菜单的DOMRect
   */
  headerNodeRect: DOMRect | { left: number; bottom: number; };
  /**
   * default: true
   */
  curtain?: boolean;
  /**
   * default: false
   */
  resolveNullAtOnce?: boolean;
  /**
   * 当用户单击空白处或者间隔标识的时候传入null，否则传入对应菜单选项（菜单选项应该避免重复）
   */
  resolve: (option: string | null) => void;
}
export const AppOptionList: React.FC<AppOptionListProps> = props => {
  const animeDuration = 150;
  const initState = () => ({
    enable: true,
  });
  const [state, setState] = useState(initState);
  let { enable } = state;
  const { curtain = true, resolveNullAtOnce = false, resolve, symbol, headerNodeRect, options } = props;
  useEffect(() => {
    setState(initState());
  }, [symbol]);
  const fadeOut = (option: string | null) => {
    if (!enable) return;
    enable = false;
    setState({ enable });
    setTimeout(() => {
      resolve(option);
    }, curtain ? animeDuration : undefined);
  };
  if (resolveNullAtOnce) {
    fadeOut(null);
  }
  const core = (
    <div style={{
      position: curtain ? 'absolute' : 'fixed',
      top: curtain ? 0 : headerNodeRect.bottom,
      left: headerNodeRect.left + 5,
      maxHeight: '80%',
      width: 180,
      overflowY: 'auto',
      backgroundColor: 'white',
      borderRadius: 5,
      boxShadow: '0 0 4px 2px rgb(0,0,0,.4)',
    }}>
      {options.map((str, ind) => {
        if (str === '') {
          return (
            <div key={ind}
              style={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <div style={{
                marginTop: 5,
                marginBottom: 5,
                height: 3,
                background: 'black',
                width: '75%',
              }} />
            </div>
          );
        }
        return (
          <div key={ind} style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
            <HoveredNode
              style={hoverMark => ({
                background: hoverMark ? 'rgb(230,230,230)' : 'white',
                width: '90%',
                padding: 10,
                borderRadius: 5,
                fontSize: 20,
                cursor: 'pointer',
              })}
              content={() => str}
              originProps={{
                onClick: ev => {
                  ev.stopPropagation();
                  fadeOut(str);
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
  if (!curtain) {
    return core;
  }
  return (
    <div
      className={enable ? 'app-option-list-show' : 'app-option-list-hide'}
      style={{
        position: 'fixed',
        top: headerNodeRect.bottom,
        left: 0, right: 0, bottom: 0,
        zIndex: ZIndexTable.menuOption,
        backgroundColor: curtain ? ColorTable.curtain : 'transparent',
      }}
      onClick={ev => {
        if (curtain) {
          ev.stopPropagation();
          fadeOut(null);
        }
      }}
    >
      {core}
    </div>
  );
};
