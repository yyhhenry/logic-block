import React from 'react';
import { EventEmitter } from 'stream';
import { AppAlert } from '../BasicModule/AppAlert';
import { AppCommonHeaderProps, AppHeader } from '../BasicModule/AppHeader';
import { globalAboutDoc, MyRoute } from '../BasicModule/CommonHead';
import { AppEditorRecordDepth } from './AppEditorContent';

type EditorMenuOptionType = '文件' | '编辑' | '帮助';
export interface AppEditorHeaderProps extends AppCommonHeaderProps {
  emitter: EventEmitter;
}
export class AppEditorHeader extends React.Component<AppEditorHeaderProps>{
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
                this.props.emitter.emit('undo');
              } else if (res === '重做') {
                this.props.emitter.emit('redo');
              }
            },
          },
          {
            name: '帮助',
            options: ['节点/连边/文本', '撤销/重做'],
            resolve: res => {
              if (res === '节点/连边/文本') {
                AppAlert.confirm('节点/连边/文本处右键查看菜单，左键拖动，或空白处右键添加（TODO）', false);
              } else if (res === '撤销/重做') {
                AppAlert.confirm(`撤销重做对一切元素均有效，并具有保存深度上限${AppEditorRecordDepth}，并且会导致所有节点的状态重置`, false);
              }
              this.setState({ menuState: undefined });
            },
          },
        ]}
      />
    );
  }
}
