import React from 'react';
import { AppHomeContent } from './AppHomeContent';
import { AppHomeHeader } from './AppHomeHeader';
export class AppHome extends React.Component {
  render(): React.ReactNode {
    document.title = '主页 - LogicBlock';
    return (
      <AppHomeHeader pageContent={
        <AppHomeContent />
      } />
    );
  }
}
