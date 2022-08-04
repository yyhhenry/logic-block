import React from 'react';
import { AppEditorContent } from './AppEditorContent';
import { AppEditorHeader } from './AppEditorHeader';
export class AppEditor extends React.Component {
  render(): React.ReactNode {
    let filename = new URL(window.location.href).searchParams.get('filename') ?? undefined;
    return (
      <AppEditorHeader pageContent={
        <AppEditorContent filename={filename} />
      } />
    );
  }
}
