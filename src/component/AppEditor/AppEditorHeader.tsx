import React from 'react';
import { AppAlert } from '../BasicModule/AppAlert';
import { AppHeaderNode, AppOptionList } from '../BasicModule/AppHeader';
import { MyRoute } from '../BasicModule/CommonHead';

export interface AppEditorHeaderProps {
  pageContent?: React.ReactNode;
}
type EditorMenuOptionType = '文件' | '编辑' | '插入';
interface AppEditorHeaderState {
  menuState: EditorMenuOptionType | undefined;
  headerNodeRect: DOMRect | undefined;
}
export class AppEditorHeader extends React.Component<AppEditorHeaderProps, AppEditorHeaderState> {
  state: Readonly<AppEditorHeaderState> = {
    menuState: undefined,
    headerNodeRect: undefined,
  };
  render(): React.ReactNode {
    const headerHeight = 60;
    const contentMargin = 20;
    const menuList: EditorMenuOptionType[] = ['文件', '编辑', '插入'];
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
            position: 'relative',
          }}
        >
          {this.props.pageContent}
        </div>
        <div>
          {
            this.state.menuState === '文件' && this.state.headerNodeRect ?
              <AppOptionList
                headerNodeRect={this.state.headerNodeRect}
                options={['回到主界面', '', '退出']}
                resolve={res => {
                  if (res === '退出') {
                    AppAlert.confirm('确认要退出吗').then(v => {
                      if (v) {
                        window.close();
                      }
                    })
                  } else if (res === '回到主界面') {
                    AppAlert.confirm('确认要回到主界面吗').then(v => {
                      if (v) {
                        MyRoute.routeTo('/');
                      }
                    })
                  }
                  this.setState({ menuState: undefined });
                }}
              /> : undefined
          }
          {
            this.state.menuState === '编辑' && this.state.headerNodeRect ?
              <AppOptionList
                headerNodeRect={this.state.headerNodeRect}
                options={['撤销', '重做']}
                resolve={res => {
                  if (res === '撤销') {
                    AppAlert.alert('[撤销] - 敬请期待');
                  } else if (res === '重做') {
                    AppAlert.alert('[重做] - 敬请期待');
                  }
                  this.setState({ menuState: undefined });
                }}
              /> : undefined
          }
          {
            this.state.menuState === '插入' && this.state.headerNodeRect ?
              <AppOptionList
                headerNodeRect={this.state.headerNodeRect}
                options={['节点']}
                resolve={res => {
                  if (res === '节点') {
                    AppAlert.alert('[插入 - 节点] - 敬请期待');
                  }
                  this.setState({ menuState: undefined });
                }}
              /> : undefined
          }
        </div>
      </div>
    );
  }
}
