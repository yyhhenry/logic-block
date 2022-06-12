import React from 'react';
import './App.css';
import { AppHeader } from './component/AppHeader'


class App extends React.Component {
  render(): React.ReactNode {
    return (
      <AppHeader pageContent={
        undefined
      } />
    );
  }
}

export default App;
