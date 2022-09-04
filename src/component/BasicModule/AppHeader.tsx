import React, { DOMAttributes } from 'react';
import { AppOptionList } from './AppOptionList';
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
