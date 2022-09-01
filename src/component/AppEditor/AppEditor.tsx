import React from 'react';
import { AppEditorContent } from './AppEditorContent';
import { AppEditorHeader } from './AppEditorHeader';
export class AppEditor extends React.Component {
  render(): React.ReactNode {
    const filename = new URL(window.location.href).searchParams.get('filename') ?? undefined;
    if (filename) {
      document.title = `${filename} - LogicBlockEditor`;
    }
    return (
      <AppEditorHeader pageContent={
        <AppEditorContent filename={filename} />
      } />
    );
  }
}
