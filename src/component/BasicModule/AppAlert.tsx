import React from "react";
import { AppButton } from "./AppButton";
import { ColorTable, ZIndexTable } from "./CommonHead";
import { EaseAnime } from "./EaseAnime";
import { HoveredNode } from "./HoveredNode";
interface AppConfirmInfo {
  content: string;
  resolve: (res: boolean) => void;
}
interface AppAlertInfo {
  content: string;
  endTime: number;
}
interface ConfirmBlockProps {
  confirmInfo: AppConfirmInfo;
}
class ConfirmBlock extends React.Component<ConfirmBlockProps>{
  static readonly animeDuration = 150;
  anime = new EaseAnime(0).animeTo(1, ConfirmBlock.animeDuration);
  private enable = true;
  private fadeOut(option: boolean) {
    if (!this.enable) return;
    this.enable = false;
    this.anime.animeTo(0, ConfirmBlock.animeDuration);
    setTimeout(() => {
      this.props.confirmInfo.resolve(option);
    }, ConfirmBlock.animeDuration);
  }
  render(): React.ReactNode {
    requestAnimationFrame(() => this.forceUpdate());
    return (
      <div
        style={{
          position: 'fixed',
          left: 0, bottom: 0, right: 0, height: '100%',
          zIndex: ZIndexTable.confirm,
          backgroundColor: ColorTable.curtain,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: this.anime.getValue(),
        }}

        onClick={ev => {
          ev.stopPropagation();
        }}
      >
        <div style={{
          maxHeight: '80%',
          maxWidth: '65%',
          minWidth: '35%',
          overflowY: 'auto',
          backgroundColor: 'white',
          padding: 15,
          marginTop: 10,
          marginBottom: 10,
          borderRadius: 15,
          fontSize: 20,
        }}>
          <div style={{ padding: 20, marginBottom: 15, }}>{this.props.confirmInfo.content}</div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
          }}>
            <AppButton textContent="确认" backgroundColor={{
              common: 'rgb(130,170,200)',
              hovered: 'rgb(100,130,160)',
            }} onClick={() => this.fadeOut(true)} />

            <AppButton textContent="取消" backgroundColor={{
              common: 'rgb(170,170,170)',
              hovered: 'rgb(100,100,100)',
            }} onClick={() => this.fadeOut(false)} />
          </div>
        </div>
      </div>
    );
  }
}
export class AppAlert extends React.Component {
  private static alertList: AppAlertInfo[] = [];
  private static confirmList: AppConfirmInfo[] = [];
  render(): React.ReactNode {
    requestAnimationFrame(() => this.forceUpdate());
    let thisTime = new Date().getTime();
    AppAlert.alertList = AppAlert.alertList.filter(info => info.endTime > thisTime);
    let confirmDiv: React.ReactNode = undefined;
    if (AppAlert.confirmList.length !== 0) {
      let confirmInfo = AppAlert.confirmList[0];
      confirmDiv = (<ConfirmBlock confirmInfo={{
        content: confirmInfo.content,
        resolve: res => {
          AppAlert.confirmList.shift();
          confirmInfo.resolve(res);
        },
      }} />);
    }
    return (
      <div>
        {confirmDiv}

        <div style={{
          zIndex: ZIndexTable.alert,
          position: 'fixed',
          width: '20%',
          right: 0,
          bottom: 0,
          fontSize: '16px',
        }}>
          {AppAlert.alertList.map((alertInfo, ind) => (
            <HoveredNode key={ind}
              style={hoverMark => ({
                background: hoverMark ? 'white' : 'rgb(255,255,255,.7)',
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: ColorTable.curtain,
                padding: 5,
                margin: 5,
                borderRadius: 10,
                cursor: 'pointer',
              })}
              content={() => (
                <p>{alertInfo.content}</p>
              )}
            />
          ))}
        </div>
      </div >
    );
  }
  static alert(content: string, duration: number = 5000) {
    this.alertList.push({
      content,
      endTime: new Date().getTime() + duration,
    });
  }
  static confirm(content: string) {
    return new Promise<boolean>(resolve => {
      this.confirmList.push({
        content,
        resolve,
      });
    });
  }
}
