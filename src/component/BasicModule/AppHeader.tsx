import React, { DOMAttributes } from 'react';
import { ColorTable, ZIndexTable } from './CommonHead';
import { HoveredNode } from './HoveredNode';
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
  fadeIn?: boolean;
  /**
   * 传入所点击菜单的DOMRect
   */
  headerNodeRect: DOMRect;
  /**
   * 当用户单击空白处或者间隔标识的时候传入null，否则传入对应菜单选项（菜单选项应该避免重复）
   */
  resolve: (option: string | null) => void;
}
export class AppOptionList extends React.Component<AppOptionListProps> {
  static readonly animeDuration = 150;
  private enable = true;
  private fadeOut(option: string | null) {
    if (!this.enable) return;
    this.enable = false;
    this.props.resolve(option);
  }
  render(): React.ReactNode {
    requestAnimationFrame(() => this.forceUpdate());
    return (
      <div
        style={{
          position: 'fixed',
          top: this.props.headerNodeRect.bottom,
          left: 0, right: 0, bottom: 0,
          zIndex: ZIndexTable.menuOption,
          backgroundColor: ColorTable.curtain,
        }}
        onClick={ev => {
          ev.stopPropagation();
          this.fadeOut(null);
        }}
      >
        <div style={{
          position: 'absolute',
          left: this.props.headerNodeRect.left + 5,
          maxHeight: '80%',
          width: 180,
          overflowY: 'auto',
          backgroundColor: 'white',
          borderRadius: 5,
          boxShadow: '0 0 4px 2px rgb(0,0,0,.4)',
        }}>
          {this.props.options.map((str, ind) => {
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
                      this.fadeOut(str);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}


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
}

export class AppHeader<MenuOptionType extends string> extends React.Component<AppHeaderProps<MenuOptionType>, AppHeaderState<MenuOptionType>> {
  state: Readonly<AppHeaderState<MenuOptionType>> = {
    menuState: undefined,
    headerNodeRect: undefined,
  };
  render(): React.ReactNode {
    requestAnimationFrame(() => this.forceUpdate());
    const headerHeight = 60;
    const contentMargin = 20;
    const menuList: MenuOptionType[] = this.props.menu.map(menuElement => menuElement.name);
    let optionListBlock: React.ReactNode = undefined;
    this.props.menu.forEach(menuElement => {
      if (this.state.menuState === menuElement.name && this.state.headerNodeRect) {
        optionListBlock = (
          <AppOptionList
            headerNodeRect={this.state.headerNodeRect}
            options={menuElement.options}
            resolve={res => {
              menuElement.resolve(res);
              this.setState({ menuState: undefined });
            }}
          />
        );
      }
    });
    return (
      <div>
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
            this.setState({ menuState: undefined });
          }}
        >
          {menuList.map((str, ind) => {
            return (
              <AppHeaderNode key={ind} content={str} keepFocus={this.state.menuState === str}
                originProps={{
                  onClick: ev => {
                    ev.stopPropagation();
                    if (this.state.menuState === str) {
                      this.setState({ menuState: undefined });
                      return;
                    }
                    this.setState({
                      menuState: str,
                      headerNodeRect: ev.currentTarget.getBoundingClientRect(),
                    });
                  },
                  onMouseMove: ev => {
                    if (this.state.menuState !== str && this.state.menuState !== undefined) {
                      this.setState({
                        menuState: str,
                        headerNodeRect: ev.currentTarget.getBoundingClientRect(),
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
          {optionListBlock}
        </div>
      </div>
    );
  }
}
