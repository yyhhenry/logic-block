import React from 'react';
import { AppDataBase } from '../AppDataBase';
import { AppFileContent, createBlankAppFileContent, isAppFileContent, localAppFileExtName } from '../AppEditor/AppFileContent';
import { AppAlert } from '../BasicModule/AppAlert';
import { AppCommonHeaderProps, AppHeader } from '../BasicModule/AppHeader';
import { globalAboutDoc, MyRoute, openFile } from '../BasicModule/CommonHead';
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
                    const database = AppDataBase.getDataBase();
                    const modifyContent = () => {
                      database.modifyTransaction('file', db => {
                        db.put(createBlankAppFileContent(s));
                      }).then(() => {
                        MyRoute.routeTo(MyRoute.RouteTable.AppEditor, {
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
                const saveToDB = (appFileContent: AppFileContent) => {
                  AppAlert.prompt('导入为文件名', appFileContent.filename).then(filename => {
                    if (filename !== null) {
                      appFileContent.filename = filename;
                      const database = AppDataBase.getDataBase();
                      const modifyDB = () => {
                        database.modifyTransaction('file-list', store => {
                          store.put({
                            filename,
                            color: 'gray',
                          } as AppFileInfo);
                        }).then(() =>
                          database.modifyTransaction('file', store => {
                            store.put(appFileContent);
                          })
                        ).then(() =>
                          MyRoute.routeTo(MyRoute.RouteTable.AppEditor, {
                            filename,
                          })
                        );
                      };
                      database.countTransaction('file-list', filename).then(v => {
                        if (v) {
                          AppAlert.confirm(`${filename}已经是存在的文件了，是否确认覆盖？`).then(v => {
                            if (v) {
                              modifyDB();
                            } else {
                              AppAlert.alert(`取消了${filename}的导入`);
                            }
                          });
                        } else {
                          modifyDB();
                        }
                      });
                    }
                  });
                };
                openFile(localAppFileExtName).then(({ filename, fileContent }) => {
                  const appFilename = filename.endsWith(localAppFileExtName)
                    ? filename.substring(0, filename.length - localAppFileExtName.length)
                    : filename;
                  (filename => {
                    try {
                      const content = JSON.parse(fileContent) as unknown;
                      const appFileContent = {
                        filename,
                        content,
                      } as AppFileContent as unknown;
                      if (!isAppFileContent(appFileContent)) {
                        throw appFileContent;
                      }
                      AppAlert.alert(`${filename}解析成功`);
                      saveToDB(appFileContent);
                    } catch (error) {
                      AppAlert.confirm(`${filename}不是一个合法的${localAppFileExtName}文件`);
                    }
                  })(appFilename);
                });
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
        ]
        }
      />
    );
  }
}
