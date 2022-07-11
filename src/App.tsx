import React from 'react';
import { AppEditor } from './component/AppEditor/AppEditor';
import { AppHome } from './component/AppHome/AppHome';
import { AppAlert } from './component/BasicModule/AppAlert';
import { MyRoute } from './component/BasicModule/CommonHead';

class App extends React.Component<{}, {}> {
  render(): React.ReactNode {
    return (
      <div>
        <AppAlert />
        {(() => {
          let page = MyRoute.getRoute();
          if (page === '/') {
            return (
              <AppHome />
            );
          } else if (page === '/AppEditor') {
            return (
              <AppEditor />
            );
          }
          return (
            <div>
              <h1 style={{ textAlign: 'center' }}>404 Not Found</h1>
            </div>
          );
        })()}
      </div>
    );
  }
}

export default App;
