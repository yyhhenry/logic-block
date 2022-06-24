import React from 'react';
import { AppContent } from './component/AppContent';
import { AppHeader } from './component/AppHeader'


class App extends React.Component {
  render(): React.ReactNode {
    return (
      <AppHeader pageContent={
        <AppContent />
      } />
    );
  }
}

export default App;
