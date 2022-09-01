import React, { DOMAttributes, useEffect, useState } from 'react';
import { ColorTable, ZIndexTable } from './CommonHead';
import { HoveredNode } from './HoveredNode';
import './AppHeader.css';
export interface AppHeaderNodeProps {
  content: string;
  originProps?: DOMAttributes<HTMLDivElement>;
  keepFocus?: boolean;
}
export class AppHeaderNode extends React.Component<AppHeaderNodeProps> {
  render(): React.ReactNode {
    return (
      <div {...this.props.originProps} style={{ position: 'relative' }}>
        <HoveredNode
          style={hoverMark => ({
            height: '100%',
            paddingLeft: 25,
            paddingRight: 25,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: hoverMark || this.props.keepFocus === true ? 'rgb(220,220,220)' : undefined,
            cursor: 'pointer',
            borderRadius: '20px 20px 0 0',
          })}
          content={hoverMark =>
            <div>
              <div style={{ fontSize: 18, }}>{this.props.content}</div>
              {hoverMark || this.props.keepFocus === true ?
                <div style={{
                  position: 'absolute',
                  left: 15, right: 15, bottom: 3, height: 3,
                  background: 'green',
                }} />
                : undefined}
            </div>
          }
        />
      </div>
    );
  }
}
export interface AppOptionListProps {
  /**
   * 形如['A', 'B', '', 'C']的列表，非空串表示一个要显示的菜单选项（菜单选项应该避免重复），空串代表一个间隔标识。
   */
  options: string[];
  symbol?: any;
  /**
   * 传入所点击菜单的DOMRect
   */
  headerNodeRect: DOMRect;
  resolveNullAtOnce: boolean;
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
  useEffect(() => {
    setState(initState());
  }, [props.symbol]);
  const fadeOut = (option: string | null) => {
    if (!enable) return;
    enable = false;
    setState({ enable });
    setTimeout(() => {
      props.resolve(option);
    }, animeDuration);
  };
  if (props.resolveNullAtOnce) {
    fadeOut(null);
  }
  return (
    <div
      className={enable ? 'app-option-list-show' : 'app-option-list-hide'}
      style={{
        position: 'fixed',
        top: props.headerNodeRect.bottom,
        left: 0, right: 0, bottom: 0,
        zIndex: ZIndexTable.menuOption,
        backgroundColor: ColorTable.curtain,
      }}
      onClick={ev => {
        ev.stopPropagation();
        fadeOut(null);
      }}
    >
      <div style={{
        position: 'absolute',
        left: props.headerNodeRect.left + 5,
        maxHeight: '80%',
        width: 180,
        overflowY: 'auto',
        backgroundColor: 'white',
        borderRadius: 5,
        boxShadow: '0 0 4px 2px rgb(0,0,0,.4)',
      }}>
        {props.options.map((str, ind) => {
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
    </div>
  );
};
export interface MenuElementType<MenuOptionType extends string> {
  name: MenuOptionType;
  /**
   * 形如['A', 'B', '', 'C']的列表，非空串表示一个要显示的菜单选项（菜单选项应该避免重复），空串代表一个间隔标识。
   */
  options: string[];
  /**
   * 当用户单击空白处或者间隔标识的时候传入null，否则传入对应菜单选项（菜单选项应该避免重复）
   */
  resolve: (res: string | null) => void;
}
export interface AppCommonHeaderProps {
  pageContent?: React.ReactNode;
}
export interface AppHeaderProps<MenuOptionType extends string> extends AppCommonHeaderProps {
  menu: MenuElementType<MenuOptionType>[];
}
interface AppHeaderState<MenuOptionType extends string> {
  menuState: MenuOptionType | undefined;
  headerNodeRect: DOMRect | undefined;
  resolveNullAtOnce: boolean;
}
export class AppHeader<MenuOptionType extends string> extends React.Component<AppHeaderProps<MenuOptionType>, AppHeaderState<MenuOptionType>> {
  state: Readonly<AppHeaderState<MenuOptionType>> = {
    menuState: undefined,
    headerNodeRect: undefined,
    resolveNullAtOnce: false,
  };
  render(): React.ReactNode {
    const headerHeight = 60;
    const contentMargin = 20;
    const menuList: MenuOptionType[] = this.props.menu.map(menuElement => menuElement.name);
    const getOptionListBlock = () => {
      for (const menuElement of this.props.menu) {
        if (this.state.menuState === menuElement.name && this.state.headerNodeRect) {
          return (
            <AppOptionList
              headerNodeRect={this.state.headerNodeRect}
              options={menuElement.options}
              resolve={res => {
                menuElement.resolve(res);
                this.setState({ menuState: undefined });
              }}
              symbol={menuElement}
              resolveNullAtOnce={this.state.resolveNullAtOnce}
            />
          );
        }
      }
    };
    return (
      <div style={{ userSelect: 'none' }}>
        <header
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, height: headerHeight,
            background: 'rgba(255,255,255)',
            boxShadow: '0 0 5px 3px gray',
            display: 'flex',
            justifyContent: 'flex-start',
            zIndex: 4,
          }}
          onClick={() => {
            this.setState({ resolveNullAtOnce: true });
          }}
        >
          {menuList.map((str, ind) => {
            return (
              <AppHeaderNode key={ind} content={str} keepFocus={this.state.menuState === str}
                originProps={{
                  onClick: ev => {
                    ev.stopPropagation();
                    if (this.state.menuState === str) {
                      this.setState({ resolveNullAtOnce: true });
                      return;
                    }
                    this.setState({
                      menuState: str,
                      headerNodeRect: ev.currentTarget.getBoundingClientRect(),
                      resolveNullAtOnce: false,
                    });
                  },
                  onMouseMove: ev => {
                    if (this.state.menuState !== str && this.state.menuState !== undefined) {
                      this.setState({
                        menuState: str,
                        headerNodeRect: ev.currentTarget.getBoundingClientRect(),
                        resolveNullAtOnce: false,
                      });
                    }
                  },
                }}
              />
            );
          })}
        </header>
        <div
          style={{
            marginTop: headerHeight + contentMargin,
            marginBottom: contentMargin,
            minHeight: window.innerHeight - (headerHeight + contentMargin) - contentMargin,
            position: 'relative',
          }}
        >
          {this.props.pageContent}
        </div>
        <div>
          {getOptionListBlock()}
        </div>
      </div>
    );
  }
}
