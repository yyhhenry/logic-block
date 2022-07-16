import React from 'react';
import { AppAlert } from '../BasicModule/AppAlert';
import { AppCommonHeaderProps, AppHeader } from '../BasicModule/AppHeader';

type HomeMenuOptionType = '文件' | '选项';
export class AppHomeHeader extends React.Component<AppCommonHeaderProps>{
  render(): React.ReactNode {
    return (
      <AppHeader<HomeMenuOptionType>
        pageContent={this.props.pageContent}
        menu={[
          {
            name: '文件',
            options: ['新建文件', '导入文件', '', '退出'],
            resolve: res => {
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
            },
          },
          {
            name: '选项',
            options: ['设置'],
            resolve: res => {
              if (res === '设置') {
                AppAlert.alert('[设置] - 敬请期待');
              }
            },
          },
        ]}
      />
    );
  }
}
