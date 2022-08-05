import React, { useState, useEffect } from "react";
import { AppButton } from "./AppButton";
import { ColorTable, ZIndexTable } from "./CommonHead";
import { HoveredNode } from "./HoveredNode";
import './AppAlert.css';
interface AppConfirmInfo {
  content: string;
  enableCancel: boolean;
  resolve: (res: boolean) => void;
}
interface AppAlertInfo {
  content: string;
  endTime: number;
}
interface ConfirmBlockProps {
  confirmInfo: AppConfirmInfo;
  confirmId: number;
}
const ConfirmBlock: React.FC<ConfirmBlockProps> = props => {
  const animeDuration = 150;
  let initState = () => ({
    enable: true,
  });
  let [state, setState] = useState(() => initState());
  useEffect(() => {
    setState(initState());
  }, [props.confirmId]);
  let { enable } = state;
  let fadeOut = (option: boolean) => {
    if (!enable) return;
    enable = false;
    setState({ enable: enable });
    setTimeout(() => {
      props.confirmInfo.resolve(option);
    }, animeDuration);
  };
  return (
    <div
      className={enable ? "app-alert-confirm-show" : "app-alert-confirm-hide"}
      style={{
        position: 'fixed',
        left: 0, bottom: 0, right: 0, height: '100%',
        zIndex: ZIndexTable.confirm,
        backgroundColor: ColorTable.curtain,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
        <div style={{ padding: 20, marginBottom: 15, }}>
          {props.confirmInfo.content}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <AppButton textContent="确认" backgroundColor={{
            common: 'rgb(130,170,200)',
            hovered: 'rgb(100,130,160)',
          }} onClick={() => fadeOut(true)} />

          {
            props.confirmInfo.enableCancel
              ? (<AppButton textContent="取消" backgroundColor={{
                common: 'rgb(170,170,170)',
                hovered: 'rgb(100,100,100)',
              }} onClick={() => fadeOut(false)} />)
              : undefined
          }
        </div>
      </div>
    </div>
  );
};
export class AppAlert extends React.Component {
  private static alertList: AppAlertInfo[] = [];
  private static confirmList: AppConfirmInfo[] = [];
  private static confirmId = 0;
  render(): React.ReactNode {
    requestAnimationFrame(() => this.forceUpdate());
    let thisTime = Date.now();
    AppAlert.alertList = AppAlert.alertList.filter(info => info.endTime > thisTime);
    let getConfirmDiv = () => {
      if (AppAlert.confirmList.length !== 0) {
        let confirmInfo = AppAlert.confirmList[0];
        return (<ConfirmBlock confirmInfo={confirmInfo} confirmId={AppAlert.confirmId} />);
      }
      return undefined;
    };
    return (
      <div>
        {getConfirmDiv()}

        <div style={{
          zIndex: ZIndexTable.alert,
          position: 'fixed',
          maxWidth: '35%',
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
  static confirm(content: string, enableCancel = true) {
    return new Promise<boolean>(resolve => {
      this.confirmList.push({
        content,
        enableCancel,
        resolve: res => {
          AppAlert.confirmList.shift();
          AppAlert.confirmId++;
          resolve(res);
        },
      });
    });
  }
}
