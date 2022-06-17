import React, { DOMAttributes } from 'react';
import { EaseAnime } from './EaseAnime';
import { HoveredNode } from './HoveredNode';

export interface AppHeaderNodeProps {
  content: string;
  originProps?: DOMAttributes<HTMLDivElement>;
  keepFocus?: boolean;
}
export interface AppHeaderNodeState {
}
export class AppHeaderNode extends React.Component<AppHeaderNodeProps, AppHeaderNodeState> {
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
  /**
   * 当用户单击空白处或者间隔标识的时候传入null，否则传入对应菜单选项（菜单选项应该避免重复）
   */
  onResolve: (option: string | null) => void;
}
export interface AppOptionListState {
}
export class AppOptionList extends React.Component<AppOptionListProps, AppOptionListState> {
  static readonly animeDuration = 150;
  anime = new EaseAnime(0).animeTo(1, AppOptionList.animeDuration);
  private enable = true;
  private fadeOut(option: string | null) {
    if (!this.enable) return;
    this.enable = false;
    this.anime.animeTo(0, AppOptionList.animeDuration);
    setTimeout(() => {
      this.props.onResolve(option);
    }, AppOptionList.animeDuration);
  }
  render(): React.ReactNode {
    requestAnimationFrame(() => this.forceUpdate());
    return (
      <div
        style={{
          position: 'fixed',
          left: 0, bottom: 0, right: 0, height: '100%',
          zIndex: 100,
          background: 'rgb(0,0,0,.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: this.anime.getValue(),
        }}
        onClick={ev => {
          ev.stopPropagation();
          this.fadeOut(null);
        }}
      >
        <div style={{ maxHeight: '80%', width: '65%', overflowY: 'auto' }}>
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
                    marginTop: 15,
                    marginBottom: 15,
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
                    padding: 15,
                    marginTop: 10,
                    marginBottom: 10,
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
export interface AppHeaderProps {
  pageContent?: React.ReactNode;
}
export type MenuOptionType = '文件' | '选项';
export interface AppHeaderState {
  menuState: MenuOptionType | undefined;
}
export class AppHeader extends React.Component<AppHeaderProps, AppHeaderState> {
  state: Readonly<AppHeaderState> = { menuState: undefined };
  render(): React.ReactNode {
    const headerHeight = 60;
    const contentMarginTop = headerHeight + 20;
    const menuList: MenuOptionType[] = ['文件', '选项'];
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
          }}
        >
          {menuList.map((str, ind) => {
            return (
              <AppHeaderNode key={ind} content={str} keepFocus={this.state.menuState === str}
                originProps={{
                  onClick: () => {
                    this.setState({ menuState: str });
                  }
                }}
              />
            );
          })}
        </header>
        <div
          style={{
            marginTop: contentMarginTop,
            position: 'relative',
          }}
        >
          {this.props.pageContent}
        </div>
        <div>
          {
            this.state.menuState === '文件' ?
              <AppOptionList options={['重启页面', '退出页面']} onResolve={res => {
                if (res === '退出页面') {
                  window.confirm('确认要退出吗') && window.close();
                } else if (res === '重启页面') {
                  window.confirm('确认要重启页面吗') && window.location.reload();
                }
                this.setState({ menuState: undefined });
              }} /> : undefined
          }
          {
            this.state.menuState === '选项' ?
              <AppOptionList options={['A', 'B', '', 'C']} onResolve={res => {
                this.setState({ menuState: undefined });
              }} /> : undefined
          }
        </div>
      </div>
    );
  }
}
