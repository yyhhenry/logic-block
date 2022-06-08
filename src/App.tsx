import React from 'react';
import './App.css';
import { Layer, Rect, Stage, Text, Group, Circle } from 'react-konva';
import GroupInImage from './component/GroupInImage';


interface MyInputProps {
  type: string;
}

interface MyInputStates {
  value: string;
}



class MyInput extends React.Component<MyInputProps, MyInputStates> {
  state = { value: '' };
  render(): React.ReactNode {
    requestAnimationFrame(() => this.forceUpdate());
    const width = window.innerWidth / 5;
    const height = window.innerHeight / 5;
    const dateValue = new Date().toString();
    return (
      <div>
        <input
          type={this.props.type}
          onInput={ev => {
            this.setState({
              value: ev.currentTarget.value
            });
          }}
          style={{
            margin: '10px',
            background: 'rgb(255,255,255,.8)',
          }}
        ></input>
        <Stage id={'stage'} width={width} height={height}>
          <Layer>
            <Rect x={0} y={0} width={width} height={height} fill={'white'}></Rect>
            <Group globalCompositeOperation='xor'>
              <GroupInImage group={
                <Group>
                  <Circle x={width / 3} y={height / 2} radius={width / 5} fill={'white'}></Circle>
                  <Circle x={width * 2 / 3} y={height / 2} radius={width / 5} fill={'white'}></Circle>
                </Group>
              } width={width} height={height} />
            </Group>
            <Text text={dateValue} x={20} y={60} width={width - 40} fill={'white'} fontSize={20} fontFamily={'微软雅黑'} globalCompositeOperation='xor' />
          </Layer>
          <Layer>
            <Text text={this.state.value} x={10} y={10} fill={'gray'} fontSize={20} fontFamily={this.state.value === '233' ? '宋体' : '微软雅黑'} />
          </Layer>
        </Stage>
      </div>
    );
  }
}
interface AppHeaderProps {
}
interface AppHeaderStates {
}
class AppHeader extends React.Component<AppHeaderProps, AppHeaderStates> {
  render(): React.ReactNode {
    return (
      <header
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, height: 60,
          background: 'rgba(255,255,255)',
        }}
      >
        { }
      </header>
    );
  }
}

class App extends React.Component {
  render(): React.ReactNode {
    return (
      <div className="App">
        <AppHeader />
        <header className="App-header">
          <MyInput type={'input'}></MyInput>
        </header>
      </div>
    );
  }
}

export default App;
