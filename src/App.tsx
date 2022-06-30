import React from 'react';
import { AppContent } from './component/AppContent';
import { AppHeader } from './component/AppHeader';
import { getRoute } from './component/CommonHead';

class App extends React.Component {
  render(): React.ReactNode {
    let page = getRoute();
    if (page === '/') {
      return (
        <AppHeader pageContent={
          <AppContent />
        } />
      );
    } else if (page === '/component/AppContent') {
      return (
        <AppContent />
      );
    }
    return <div />;
  }
}

export default App;
