import React from 'react';
import { AppEditor } from './component/AppEditor/AppEditor';
import { AppHome } from './component/AppHome/AppHome';
import { AppAlertElement } from './component/BasicModule/AppAlert';
import { MyRoute } from './component/BasicModule/CommonHead';

class App extends React.Component<{}, {}> {
  render(): React.ReactNode {
    return (
      <div>
        <AppAlertElement />
        {(() => {
          const page = MyRoute.getRoute();
          if (page === MyRoute.RouteTable.Home) {
            return (
              <AppHome />
            );
          } else if (page === MyRoute.RouteTable.AppEditor) {
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
