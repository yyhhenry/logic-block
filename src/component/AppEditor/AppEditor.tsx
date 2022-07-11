import React from 'react';
import { AppEditorHeader } from './AppEditorHeader';
export class AppEditor extends React.Component<{}, {}> {
  render(): React.ReactNode {
    return (
      <AppEditorHeader pageContent={<div/>
        // <AppHomeContent />
      } />
    );
  }
}
