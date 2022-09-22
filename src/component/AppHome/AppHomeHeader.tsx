import React from 'react';
import { AppDataBase } from '../AppDataBase';
import { createBlankAppFileContent } from '../AppEditor/AppFileContent';
import { AppAlert } from '../BasicModule/AppAlert';
import { AppCommonHeaderProps, AppHeader } from '../BasicModule/AppHeader';
import { globalAboutDoc, MyRoute } from '../BasicModule/CommonHead';
import { AppFileInfo } from './AppFileInfo';

type HomeMenuOptionType = '文件' | '选项';
export class AppHomeHeader extends React.Component<AppCommonHeaderProps>{
  render(): React.ReactNode {
    return (
      <AppHeader<HomeMenuOptionType>
        pageContent={this.props.pageContent}
        menu={[
          {
            name: '文件',
            options: ['新建文件', '导入文件', '', '关于'],
            resolve: res => {
              if (res === '关于') {
                AppAlert.confirm(globalAboutDoc, false);
              } else if (res === '新建文件') {
                AppAlert.prompt('输入一个合法的文件名', `${Date.now()}`).then(s => {
                  if (s !== null) {
                    const database = AppDataBase.getDataBase('yyhhenry-logic-block');
                    const modifyContent = () => {
                      database.modifyTransaction('file', db => {
                        db.put(createBlankAppFileContent(s));
                      }).then(() => {
                        MyRoute.routeTo('/AppEditor', {
                          filename: s,
                        });
                      });
                    };
                    database.countTransaction('file-list', s).then(cnt => {
                      if (cnt) {
                        AppAlert.confirm(`${s}是一个已经存在的文件，确定要覆盖吗`).then(v => {
                          if (v) {
                            modifyContent();
                          }
                        });
                      } else {
                        database.modifyTransaction('file-list', db => {
                          db.put({ filename: s, color: 'gray' } as AppFileInfo);
                        }).then(() => {
                          modifyContent();
                        });
                      }
                    });
                  }
                });
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
