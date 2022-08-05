import React from 'react';
import { AppAlert } from '../BasicModule/AppAlert';
import { AppCommonHeaderProps, AppHeader } from '../BasicModule/AppHeader';
import { globalAboutDoc, MyRoute } from '../BasicModule/CommonHead';

type EditorMenuOptionType = '文件' | '编辑' | '插入';
export class AppEditorHeader extends React.Component<AppCommonHeaderProps>{
  render(): React.ReactNode {
    return (
      <AppHeader<EditorMenuOptionType>
        pageContent={this.props.pageContent}
        menu={[
          {
            name: '文件',
            options: ['回到主界面', '', '关于'],
            resolve: res => {
              if (res === '关于') {
                AppAlert.confirm(globalAboutDoc, false);
              } else if (res === '回到主界面') {
                AppAlert.confirm('确认要回到主界面吗').then(v => {
                  if (v) {
                    MyRoute.routeTo('/');
                  }
                });
              }
            },
          },
          {
            name: '编辑',
            options: ['撤销', '重做'],
            resolve: res => {
              if (res === '撤销') {
                AppAlert.alert('[撤销] - 敬请期待');
              } else if (res === '重做') {
                AppAlert.alert('[重做] - 敬请期待');
              }
            },
          },
          {
            name: '插入',
            options: ['节点'],
            resolve: res => {
              if (res === '节点') {
                AppAlert.alert('[插入 - 节点] - 敬请期待');
              }
              this.setState({ menuState: undefined });
            },
          },
        ]}
      />
    );
  }
}
