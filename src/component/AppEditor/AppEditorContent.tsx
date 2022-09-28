import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EventEmitter } from 'stream';
import { AppDataBase } from '../AppDataBase';
import { AppAlert } from '../BasicModule/AppAlert';
import { AppFileContent, isAppFileContent, localAppFileExtName, LogicBlockFileModule } from './AppFileContent';
import { LogicBlockRuntime } from './LogicBlockRuntime';
import { AppEditorView } from './AppEditorView';
import { UndoRecord } from '../BasicModule/UndoRecord';
import { createDownload } from '../BasicModule/CommonHead';
const database = AppDataBase.getDataBase();
export const AppEditorRecordDepth = 10;
export interface AppEditorContentProps {
  filename?: string;
  emitter: EventEmitter;
}
export const AppEditorContent: React.FC<AppEditorContentProps> = props => {
  const initState = () => {
    return {
      undoRecord: undefined as UndoRecord<LogicBlockFileModule.LogicBlockFileContent> | undefined,
      runtime: undefined as LogicBlockRuntime | undefined,
      failed: false,
      renderLoopCount: 0,
    };
  };
  const { emitter, filename } = props;
  const [state, setState] = useState(initState);
  const { undoRecord, runtime, failed, renderLoopCount } = state;
  const boxMargin = 10;
  useEffect(() => {
    setState(initState());
    if (filename !== undefined) {
      database.queryTransaction('file', isAppFileContent, filename).then(v => {
        if (v) {
          const runtime = new LogicBlockRuntime(v.content);
          const undoRecord = new UndoRecord(runtime.renderFileContent(), AppEditorRecordDepth);
          setState({
            undoRecord,
            runtime,
            failed: false,
            renderLoopCount: 0,
          });
        } else {
          setState({
            undoRecord: undefined,
            runtime: undefined,
            failed: true,
            renderLoopCount: 0,
          });
        }
      });
    }
  }, [filename]);
  const saveToDataBase = useCallback((content: LogicBlockFileModule.LogicBlockFileContent) => {
    (value => {
      database.modifyTransaction('file', store => {
        store.put(value);
      });
    })({
      filename,
      content,
    } as AppFileContent);
  }, [filename]);
  requestAnimationFrame(() => {
    setState({ ...state, renderLoopCount: renderLoopCount + 1 });
  });
  const undoDisabled = useRef(false);
  const editing = useCallback(() => {
    undoDisabled.current = true;
  }, []);
  const undo = useCallback(() => {
    if (undoRecord && !undoDisabled.current) {
      const content = undoRecord.undo();
      if (content) {
        setState({ ...state, runtime: new LogicBlockRuntime(content) });
        saveToDataBase(content);
      } else {
        AppAlert.confirm('已经没有可以撤销的项', false);
      }
    }
  }, [undoRecord, state, saveToDataBase]);
  const redo = useCallback(() => {
    if (undoRecord && !undoDisabled.current) {
      const content = undoRecord.redo();
      if (content) {
        setState({ ...state, runtime: new LogicBlockRuntime(content) });
        saveToDataBase(content);
      } else {
        AppAlert.confirm('已经没有可以重做的项', false);
      }
    }
  }, [undoRecord, state, saveToDataBase]);
  const save = useCallback(() => {
    if (runtime !== undefined && filename !== undefined) {
      const content = runtime.renderFileContent();
      undoDisabled.current = false;
      if (undoRecord) {
        undoRecord.push(content);
      }
      saveToDataBase(content);
    }
  }, [undoRecord, runtime, filename, saveToDataBase]);
  const saveToLocal = useCallback(() => {
    AppAlert.confirm('确定要保存到本地吗？').then(v => {
      if (v && runtime !== undefined && filename !== undefined) {
        const content = runtime.renderFileContent();
        createDownload(filename + localAppFileExtName, JSON.stringify(content));
      }
    });
  }, [runtime, filename]);
  useEffect(() => {
    emitter.addListener('undo', undo);
    emitter.addListener('redo', redo);
    emitter.addListener('editing', editing);
    emitter.addListener('save', save);
    emitter.addListener('saveToLocal', saveToLocal);
    return () => {
      emitter.removeListener('undo', undo);
      emitter.removeListener('redo', redo);
      emitter.removeListener('editing', editing);
      emitter.removeListener('save', save);
      emitter.removeListener('saveToLocal', saveToLocal);
    };
  }, [emitter, redo, undo, save, editing, saveToLocal]);
  return (
    <div
      style={{
        margin: boxMargin,
        height: `calc(100% - ${boxMargin * 2}px)`,
        width: `calc(100% - ${boxMargin * 2}px)`,
        backgroundColor: 'white',
        position: 'absolute',
        borderRadius: boxMargin,
        overflow: 'hidden',
        fontSize: 20,
      }}
    >
      {
        props.filename !== undefined
          ? (
            failed
              ? (
                <div style={{ textAlign: 'center' }}>
                  <h1>{'File Not Found: 不正确的filename'}</h1>
                </div>
              ) : (
                runtime === undefined ?
                  (
                    <div style={{ textAlign: 'center' }}>
                      <h1>{'加载中'}</h1>
                    </div>
                  ) : (
                    <AppEditorView.TableView runtime={runtime} emitter={emitter} />
                  )
              )
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h1>{'Filename Not Found: 缺少URL参数'}</h1>
            </div>
          )
      }
    </div>
  );
};
