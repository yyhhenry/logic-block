import React from 'react';
import { AppAlert } from '../BasicModule/AppAlert';
import { AppHeaderNode, AppOptionList } from '../BasicModule/AppHeader';

export interface AppHomeHeaderProps {
  pageContent?: React.ReactNode;
}
type HomeMenuOptionType = '文件' | '选项';
interface AppHomeHeaderState {
  menuState: HomeMenuOptionType | undefined;
}
export class AppHomeHeader extends React.Component<AppHomeHeaderProps, AppHomeHeaderState> {
  state: Readonly<AppHomeHeaderState> = { menuState: undefined };
  render(): React.ReactNode {
    const headerHeight = 60;
    const contentMargin = 20;
    const menuList: HomeMenuOptionType[] = ['文件', '选项'];
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
            marginTop: headerHeight + contentMargin,
            marginBottom: contentMargin,
            position: 'relative',
          }}
        >
          {this.props.pageContent}
        </div>
        <div>
          {
            this.state.menuState === '文件' ?
              <AppOptionList options={['新建文件', '导入文件', '', '退出']} resolve={res => {
                if (res === '退出') {
                  AppAlert.confirm('确认要退出吗').then(v => {
                    if (v) {
                      window.close();
                    }
                  })
                } else if (res === '新建文件') {
                  AppAlert.alert('[新建文件] - 敬请期待');
                } else if (res === '导入文件') {
                  AppAlert.alert('[导入文件] - 敬请期待');
                }
                this.setState({ menuState: undefined });
              }} /> : undefined
          }
          {
            this.state.menuState === '选项' ?
              <AppOptionList options={['设置']} resolve={res => {
                if (res === '设置') {
                  AppAlert.alert('[设置] - 敬请期待');
                }
                this.setState({ menuState: undefined });
              }} /> : undefined
          }
        </div>
      </div>
    );
  }
}
