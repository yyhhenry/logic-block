import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Layer, Rect, Stage, Text } from 'react-konva';

interface MyInputProps {
  type: string;
}

interface MyInputStates {
  value: string;
  dateValue: string;
  width: number;
  height: number;
}

function addRepaintListener(listener: () => void) {
  let callListener = () => {
    listener();
    requestAnimationFrame(callListener);
  };
  callListener();
}

class MyInput extends React.Component<MyInputProps, MyInputStates> {
  constructor(props: MyInputProps) {
    super(props);
    this.state = { value: '', dateValue: '', width: window.innerWidth / 5, height: window.innerHeight / 5 };
    addRepaintListener(() => {
      this.setState({
        width: window.innerWidth / 5,
        height: window.innerHeight / 5,
        dateValue: new Date().toString(),
      });
    });
  }
  render(): React.ReactNode {
    return (
      <div>
        <input
          type={this.props.type}
          onInput={ev => {
            this.setState({
              value: ev.currentTarget.value
            });
          }}
        ></input>
        <Stage width={this.state.width} height={this.state.height}>
          <Layer>
            {/* <Rect x={0} y={0} width={this.state.width} height={this.state.height} fill={'black'}></Rect> */}
          </Layer>
          <Layer>
            {
              this.state.value === '233' ? (
                <Text text={this.state.value} x={0} y={0} fill={'white'} fontSize={20} fontFamily={'宋体'} />
              ) : (
                <Text text={this.state.value} x={0} y={0} fill={'white'} fontSize={20} fontFamily={'微软雅黑'} />
              )
            }

            <Text text={this.state.dateValue} x={20} y={60} width={this.state.width - 40} fill={'white'} fontSize={20} fontFamily={'微软雅黑'} />
          </Layer>
        </Stage>
      </div>
    );
  }
}

class App extends React.Component {
  render(): React.ReactNode {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code style={{ background: 'black', padding: '10px' }}>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React 好极了
          </a>
          <MyInput type={'input'}></MyInput>
        </header>
      </div>
    );
  }
}

export default App;
