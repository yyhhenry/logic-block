import React, { useState } from 'react';
import { AppEditorContent } from './AppEditorContent';
import { AppEditorHeader } from './AppEditorHeader';
import EventEmitter from 'events';
export interface AppEditorControllerMap {
  redo: never;
  undo: never;
  save: never;
}
export interface AppEditorControllerEvent {
  name: keyof AppEditorControllerMap;
  value: string[];
  time: number;
}
export class AppEditorController {
  private record: AppEditorControllerEvent[] = [];
  private timeStamp: number = 0;
  calcState() {
    return {
      controller: this,
      timeStamp: this.timeStamp,
    };
  }
  private refresh() {
    this.timeStamp = Date.now();
    this.forceUpdate && this.forceUpdate();
  }
  call(name: keyof AppEditorControllerMap, value: string[] = []) {
    this.record.push({ name, value, time: Date.now() });
    this.refresh();
  }
  forceUpdate: (() => void) | undefined = undefined;
  passOne() {
    if (this.record.length) {
      this.refresh();
    }
    return this.record.shift();
  }
}
export const AppEditor: React.FC = () => {
  const initState = () => new EventEmitter();
  const [emitter] = useState(() => initState());
  const filename = new URL(window.location.href).searchParams.get('filename') ?? undefined;
  if (filename) {
    document.title = `${filename} - LogicBlockEditor`;
  }
  return (
    <div tabIndex={-1} onKeyUp={ev => {
      if (ev.key.toLowerCase() === 'z' && ev.ctrlKey) {
        emitter.emit('undo');
      }
      if (ev.key.toLowerCase() === 'y' && ev.ctrlKey) {
        emitter.emit('redo');
      }
    }}>
      <AppEditorHeader emitter={emitter} pageContent={
        <AppEditorContent emitter={emitter} filename={filename} />
      } />
    </div>
  );
};
