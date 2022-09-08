import React, { useState, useEffect, useCallback } from "react";
import { AppButton } from "./AppButton";
import { ColorTable, isObject, ZIndexTable } from "./CommonHead";
import { EventEmitter } from 'events';
import './AppAlert.css';
import { HoveredNode } from "./HoveredNode";
interface AppConfirmInfo {
  content: string;
  enableCancel: boolean;
  symbol: Symbol;
  resolve: (res: boolean) => void;
}
interface AppPromptInfo {
  prompt: string;
  value: string;
  symbol: Symbol;
  resolve: (res: string | null) => void;
}
interface AppAlertInfo {
  content: string;
  endTime: number;
}
function isAppAlertInfo(v: unknown): v is AppAlertInfo {
  return isObject(v) && typeof v.content === 'string' && typeof v.endTime === 'number';
}
function isAppConfirmInfo(v: unknown): v is AppConfirmInfo {
  return isObject(v) && typeof v.content === 'string' && typeof v.symbol === 'symbol' && typeof v.enableCancel === 'boolean' && typeof v.resolve === 'function';
}
function isAppPromptInfo(v: unknown): v is AppPromptInfo {
  return isObject(v) && typeof v.prompt === 'string' && typeof v.symbol === 'symbol' && typeof v.value === 'string' && typeof v.resolve === 'function';
}
interface ConfirmBlockProps {
  confirmInfo: AppConfirmInfo;
}
const ConfirmBlock: React.FC<ConfirmBlockProps> = props => {
  const animeDuration = 150;
  let initState = useCallback(() => ({
    enable: true,
  }), []);
  let [state, setState] = useState(initState);
  useEffect(() => {
    setState(initState());
  }, [props.confirmInfo.symbol, initState]);
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

interface PromptBlockProps {
  promptInfo: AppPromptInfo;
}
const PromptBlock: React.FC<PromptBlockProps> = props => {
  const animeDuration = 150;
  const initState = useCallback(() => ({
    enable: true,
    value: props.promptInfo.value,
  }), [props.promptInfo.value]);
  const [state, setState] = useState(initState);
  useEffect(() => {
    setState(initState());
  }, [props.promptInfo.symbol, initState]);
  const { enable, value } = state;
  const fadeOut = (res: string | null) => {
    if (!enable) return;
    setState({ enable: false, value });
    setTimeout(() => {
      props.promptInfo.resolve(res);
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
        <div style={{ padding: 20, }}>
          {props.promptInfo.prompt}
        </div>
        <div style={{ textAlign: 'center', marginBottom: 15, }}>
          <input value={value}
            onInput={ev => {
              setState({ enable, value: ev.currentTarget.value });
            }}
            style={{
              width: '100%',
              textAlign: 'center',
              background: 'none',
              borderColor: ColorTable.curtain,
              borderRadius: '5px',
              fontSize: '18px',
            }}
          />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <AppButton textContent="确认" backgroundColor={{
            common: 'rgb(130,170,200)',
            hovered: 'rgb(100,130,160)',
          }} onClick={() => fadeOut(value)} />

          <AppButton textContent="取消" backgroundColor={{
            common: 'rgb(170,170,170)',
            hovered: 'rgb(100,100,100)',
          }} onClick={() => fadeOut(null)} />
        </div>
      </div>
    </div>
  );
};
export const maxAlertCount = 6;
const alertEventEmitter = new EventEmitter();
export const AppAlertElement: React.FC = () => {
  const initState = () => ({
    alertList: [] as AppAlertInfo[],
    confirmList: [] as AppConfirmInfo[],
    promptList: [] as AppPromptInfo[],
    alertRenderSymbol: Symbol(),
  });
  const [state, setState] = useState(initState);
  const { alertRenderSymbol, alertList, confirmList, promptList } = state;

  useEffect(() => {
    requestAnimationFrame(() => {
      const thisTime = Date.now();
      setState({ ...state, alertRenderSymbol: Symbol(), alertList: alertList.filter(info => info.endTime > thisTime) });
    });
  }, [state, alertRenderSymbol, alertList]);
  const onAlert = useCallback((v: unknown) => {
    if (isAppAlertInfo(v)) {
      alertList.push(v);
      if (alertList.length > maxAlertCount) {
        alertList.shift();
      }
    }
  }, [alertList]);
  const onConfirm = useCallback((v: unknown) => {
    if (isAppConfirmInfo(v)) {
      confirmList.push({
        ...v,
        resolve: res => {
          confirmList.shift();
          v.resolve(res);
        }
      });
    }
  }, [confirmList]);
  const onPrompt = useCallback((v: unknown) => {
    if (isAppPromptInfo(v)) {
      promptList.push({
        ...v,
        resolve: res => {
          promptList.shift();
          v.resolve(res);
        }
      });
    }
  }, [promptList]);
  useEffect(() => {
    alertEventEmitter.on('alert', onAlert);
    alertEventEmitter.on('confirm', onConfirm);
    alertEventEmitter.on('prompt', onPrompt);
    return () => {
      alertEventEmitter.removeListener('alert', onAlert);
      alertEventEmitter.removeListener('confirm', onConfirm);
      alertEventEmitter.removeListener('prompt', onPrompt);
    };
  }, [onAlert, onConfirm, onPrompt]);
  const getConfirmDiv = () => {
    if (confirmList.length !== 0) {
      const confirmInfo = confirmList[0];
      return (<ConfirmBlock confirmInfo={confirmInfo} />);
    } else if (promptList.length !== 0) {
      const promptInfo = promptList[0];
      return (<PromptBlock promptInfo={promptInfo} />);
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
        {alertList.map((alertInfo, ind) => (
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
};
export namespace AppAlert {
  export function alert(content: string, duration: number = 5000) {
    alertEventEmitter.emit('alert', {
      content,
      endTime: new Date().getTime() + duration,
    } as AppAlertInfo);
  }
  export function confirm(content: string, enableCancel = true) {
    return new Promise<boolean>(resolve => {
      const symbol = Symbol();
      alertEventEmitter.emit('confirm', {
        content,
        enableCancel,
        symbol,
        resolve,
      } as AppConfirmInfo);
    });
  }
  export function prompt(prompt: string, value = '') {
    return new Promise<string | null>(resolve => {
      const symbol = Symbol();
      alertEventEmitter.emit('prompt', {
        prompt,
        value,
        symbol,
        resolve,
      } as AppPromptInfo);
    });
  }
}
