import React from "react";
import { HoveredNode } from "./HoveredNode";

export interface AppFileCardProps {
}
interface AppFileCardState {
}
export class AppFileCard extends React.Component<AppFileCardProps, AppFileCardState> {
  state: Readonly<AppFileCardState> = {};
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
              backgroundColor: 'gray',
            }}>
            </div>
            <div style={{
              width: '100%',
              height: '10%',
              display: 'flex',
              justifyContent: 'center',
            }}>
              <span>{'???'}</span>
            </div>
          </div>
        )} />
    );
  }
}

export interface AppADBoardProps {
}
interface AppADBoardState {
}
export class AppADBoard extends React.Component<AppADBoardProps, AppADBoardState> {
  state: Readonly<AppADBoardState> = {};
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

export interface AppContentProps {
}
interface AppContentState {
}
export class AppContent extends React.Component<AppContentProps, AppContentState> {
  state: Readonly<AppContentState> = {};
  render() {
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
              <AppFileCard />
              <AppFileCard />
              <AppFileCard />
              <AppFileCard />
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
