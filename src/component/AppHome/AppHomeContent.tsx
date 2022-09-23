import React, { useCallback, useState } from "react";
import { AppDataBase } from "../AppDataBase";
import { AppFileInfo, isAppFileInfo } from "./AppFileInfo";
import { HoveredNode } from "../BasicModule/HoveredNode";
import { ColorTable, MyRoute } from "../BasicModule/CommonHead";
import { AppOptionList } from "../BasicModule/AppOptionList";
import { AppAlert } from "../BasicModule/AppAlert";
import { AppFileContent, isAppFileContent } from "../AppEditor/AppFileContent";


export const AppHomeContent: React.FC = () => {
  const [fileList, setFileList] = useState(undefined as AppFileInfo[] | undefined);
  const resetFileList = () => {
    const database = AppDataBase.getDataBase();
    database.queryAllTransaction('file-list', isAppFileInfo).then(data => {
      setFileList(data);
    });
  };
  if (fileList === undefined) {
    resetFileList();
  }
  interface OptionListArgs {
    name: string;
    point: { x: number; y: number; };
    color: string;
  }
  const [optionListArgs, setOptionListArgs] = useState(undefined as OptionListArgs | undefined);
  const getCards = (fileList: AppFileInfo[]) => {
    if (fileList.length === 0) {
      return (
        <h2 style={{ color: 'gray', textAlign: 'center' }}>
          {'新建文件以开始'}
        </h2>
      );
    }
    const cmp = (a: AppFileInfo, b: AppFileInfo) => {
      return a.color === b.color ? 0 : (a.color === ColorTable.starCard ? -1 : 1);
    };
    return fileList.sort(cmp).map(file => {
      const onMenu = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setOptionListArgs({
          name: file.filename,
          point: {
            x: ev.clientX,
            y: ev.clientY,
          },
          color: file.color,
        });
        ev.stopPropagation();
        ev.preventDefault();
      };
      return (
        <HoveredNode style={() => ({ display: 'inline-block' })}
          content={hoverMark => (
            <div
              style={{
                width: 200,
                height: 200,
                backgroundColor: 'rgb(210, 220, 220)',
                margin: 15,
                borderRadius: 15,
                overflow: 'hidden',
                transition: 'all .3s',
                boxShadow: hoverMark ? '5px 5px 5px gray' : 'none',
                transform: hoverMark ? 'translate(-5px,-5px)' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                MyRoute.routeTo(MyRoute.RouteTable.AppEditor, {
                  filename: file.filename,
                });
              }}
              onDoubleClick={onMenu}
              onContextMenu={onMenu}
            >
              <div style={{
                width: '100%',
                height: '80%',
                borderRadius: 15,
                backgroundColor: file.color,
              }}>
              </div>
              <div style={{
                width: '100%',
                height: '20%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 18,
              }}>
                <span>{file.filename}</span>
              </div>
            </div>
          )} />
      );
    });
  };
  const getOptionList = () => {
    if (optionListArgs === undefined) {
      return undefined;
    }
    const { name: filename, point, color } = optionListArgs;
    return (
      <AppOptionList
        options={['重命名', '删除', color === ColorTable.starCard ? '设为普通' : '设为重要']}
        symbol={optionListArgs}
        headerNodeRect={{
          left: point.x,
          bottom: point.y,
        }}
        curtain={false}
        resolve={res => {
          const database = AppDataBase.getDataBase();
          if (res === '重命名') {
            AppAlert.prompt(`新名字`, filename).then(newName => {
              const modifyDB = () => {
                const queryDB = async () => {
                  const fileInfo = await database.queryTransaction('file-list', isAppFileInfo, filename);
                  const fileContent = await database.queryTransaction('file', isAppFileContent, filename);
                  if (fileInfo && fileContent) {
                    return {
                      fileInfo,
                      fileContent,
                    };
                  } else {
                    return undefined;
                  }
                };
                (async () => {
                  const pack = await queryDB();
                  if (pack !== undefined) {
                    const { fileInfo, fileContent } = pack;
                    await database.modifyTransaction('file-list', store => {
                      store.delete(filename);
                      store.put({ ...fileInfo, filename: newName } as AppFileInfo);
                    });
                    await database.modifyTransaction('file', store => {
                      store.delete(filename);
                      store.put({ ...fileContent, filename: newName } as AppFileContent);
                    });
                  }
                })().then(() => {
                  AppAlert.alert(`${filename}重命名到${newName}`);
                  resetFileList();
                });
              };
              if (newName === filename) {
                AppAlert.confirm('旧名字与新名字相同', false);
              } else if (newName !== null) {
                database.countTransaction('file-list', newName).then(cnt => {
                  if (cnt) {
                    AppAlert.confirm(`名为${newName}的文件已经存在了，确认覆盖吗`).then(v => {
                      if (v) {
                        modifyDB();
                      }
                    });
                  } else {
                    modifyDB();
                  }
                });
              }
            });
          } else if (res === '删除') {
            AppAlert.confirm(`确定要删除文件${filename}吗？`).then(v => {
              if (v) {
                const database = AppDataBase.getDataBase();
                database.modifyTransaction('file', store => {
                  store.delete(filename);
                }).then(() =>
                  database.modifyTransaction('file-list', store => {
                    store.delete(filename);
                  })
                ).then(() => {
                  AppAlert.alert(`成功删除${filename}`);
                  resetFileList();
                });
              }
            });
          } else if (res === '设为重要' || res === '设为普通') {
            database.modifyTransaction('file-list', store => {
              store.put({ filename, color: color === ColorTable.starCard ? ColorTable.normalCard : ColorTable.starCard });
            }).then(() => {
              resetFileList();
            });
          }
          setOptionListArgs(undefined);
        }}
      />
    );
  };
  const onMouseUp = useCallback((ev: { button: number; }) => {
    if (ev.button === 0) {
      setOptionListArgs(undefined);
    }
  }, []);
  return (
    <div
      onMouseUp={onMouseUp}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{ width: '90%' }}>
          <div style={{
            minHeight: 1200,
            borderRadius: 20,
            padding: 20,
            margin: 15,
            backgroundColor: 'white',
          }}>
            {fileList !== undefined
              ? getCards(fileList)
              : (
                <h2 style={{ color: 'gray', textAlign: 'center' }}>
                  {'加载中'}
                </h2>
              )
            }
          </div>
        </div>
      </div>
      <div
        onMouseUp={ev => {
          ev.stopPropagation();
          ev.preventDefault();
        }}
      >
        {getOptionList()}
      </div>
    </div >
  );
};
