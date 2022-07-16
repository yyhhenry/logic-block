import React from "react";
import { AppDataBase } from "../AppDataBase";
import { AppFileInfo, isAppFileInfo } from "./AppFileInfo";
import { HoveredNode } from "../BasicModule/HoveredNode";

export interface AppFileCardProps {
  fileInfo: AppFileInfo;
}
export class AppFileCard extends React.Component<AppFileCardProps> {
  render() {
    return (
      <HoveredNode style={() => ({ display: 'inline-block' })}
        content={hoverMark => (
          <div style={{
            width: 200,
            height: 200,
            backgroundColor: 'rgb(210, 220, 220)',
            margin: 15,
            borderRadius: 15,
            overflow: 'hidden',
            transition: 'all .3s',
            boxShadow: hoverMark ? '5px 5px 5px gray' : 'none',
            transform: hoverMark ? 'translate(-5px,-5px)' : 'none',
          }}>
            <div style={{
              width: '100%',
              height: '90%',
              borderRadius: 15,
              backgroundColor: this.props.fileInfo.color,
            }}>
            </div>
            <div style={{
              width: '100%',
              height: '10%',
              display: 'flex',
              justifyContent: 'center',
            }}>
              <span>{this.props.fileInfo.filename}</span>
            </div>
          </div>
        )} />
    );
  }
}

export class AppADBoard extends React.Component {
  render() {
    const textContent = '广告位招租  有意者速来';
    return (
      <div style={{
        margin: 15,
        padding: 15,
        borderColor: 'pink',
        borderStyle: 'solid',
        borderWidth: 2
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            flexDirection: 'column',
            height: textContent.length * 35,
            fontSize: 22
          }}>
            {
              textContent.split('').map((str, ind) => (
                <div key={ind}>{str}</div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }
}

interface AppHomeContentState {
  fileList: AppFileInfo[] | undefined;
}

export class AppHomeContent extends React.Component<{}, AppHomeContentState> {
  state: Readonly<AppHomeContentState> = { fileList: undefined };
  requestFileListUpdate() {
    let database = AppDataBase.getDataBase('yyhhenry-logic-block');
    database.queryAllTransaction('file-list', isAppFileInfo).then(data => {
      this.setState({ fileList: data });
    });
  }
  render() {
    if (this.state.fileList === undefined) {
      this.requestFileListUpdate();
    }
    return (
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>

          <div style={{ width: '60%' }}>
            <div style={{
              minHeight: 1200,
              borderRadius: 20,
              padding: 20,
              margin: 15,
              backgroundColor: 'white',
            }}>
              {this.state.fileList !== undefined && (
                this.state.fileList.length === 0 ?
                  (<h2 style={{ color: 'gray', textAlign: 'center' }}>新建文件以开始</h2>) :
                  this.state.fileList.map(file => (
                    <AppFileCard key={file.filename} fileInfo={file} />
                  ))
              )}
            </div>
          </div>

          <div style={{ width: '20%' }}>
            <div style={{
              borderRadius: 20,
              padding: 20,
              margin: 15,
              backgroundColor: 'white',
            }}>
              <AppADBoard />
            </div>
          </div>
        </div>
      </div >
    );
  }
}
