import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EventEmitter } from 'stream';
import { AppDataBase } from '../AppDataBase';
import { AppAlert } from '../BasicModule/AppAlert';
import { AppFileContent, isAppFileContent, LogicBlockFileModule } from './AppFileContent';
import { LogicBlockRuntime } from './LogicBlockRuntime';
import { AppEditorView } from './AppEditorView';
import { UndoRecord } from '../BasicModule/UndoRecord';
const database = AppDataBase.getDataBase('yyhhenry-logic-block');
const RecordDepth = 10;
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
          const undoRecord = new UndoRecord(runtime.renderFileContent(), RecordDepth);
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
        store.clear();
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
  useEffect(() => {
    emitter.addListener('undo', undo);
    emitter.addListener('redo', redo);
    emitter.addListener('editing', editing);
    emitter.addListener('save', save);
    return () => {
      emitter.removeListener('undo', undo);
      emitter.removeListener('redo', redo);
      emitter.removeListener('editing', editing);
      emitter.removeListener('save', save);
    };
  }, [emitter, redo, undo, save, editing]);
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

// (() => {
//   let database = AppDataBase.getDataBase('yyhhenry-logic-block');
//   database.modifyTransaction('file', store => {
//     store.clear();
//     store.put({ filename: 'yyh', content: { "points": [{ "x": 428, "y": 238, "power": false }, { "x": 424, "y": 405, "power": true }, { "x": 560, "y": 280, "power": false }, { "x": 601, "y": 308, "power": false }, { "x": 656, "y": 308, "power": false }, { "x": 564, "y": 334, "power": false }, { "x": 566, "y": 459, "power": false }, { "x": 660, "y": 458, "power": false }, { "x": 795, "y": 360, "power": false }, { "x": 835, "y": 385, "power": false }, { "x": 882, "y": 386, "power": false }, { "x": 792, "y": 410, "power": false }, { "x": 976, "y": 342, "power": false }, { "x": 239, "y": 431, "power": false }, { "x": 239, "y": 223, "power": false }, { "x": 1205, "y": 341, "power": false }], "lines": [{ "pointFrom": 2, "pointTo": 3, "notGate": true }, { "pointFrom": 3, "pointTo": 4, "notGate": true }, { "pointFrom": 5, "pointTo": 3, "notGate": true }, { "pointFrom": 0, "pointTo": 2, "notGate": false }, { "pointFrom": 1, "pointTo": 5, "notGate": false }, { "pointFrom": 1, "pointTo": 6, "notGate": false }, { "pointFrom": 6, "pointTo": 7, "notGate": true }, { "pointFrom": 8, "pointTo": 9, "notGate": true }, { "pointFrom": 9, "pointTo": 10, "notGate": true }, { "pointFrom": 11, "pointTo": 9, "notGate": true }, { "pointFrom": 4, "pointTo": 8, "notGate": false }, { "pointFrom": 7, "pointTo": 11, "notGate": false }, { "pointFrom": 10, "pointTo": 12, "notGate": false }, { "pointFrom": 1, "pointTo": 13, "notGate": false }, { "pointFrom": 0, "pointTo": 14, "notGate": false }, { "pointFrom": 12, "pointTo": 15, "notGate": false }], "texts": [{ "str": "输入1", "x": 200, "y": 180, "size": 25 }, { "str": "输入2", "x": 200, "y": 480, "size": 25 }, { "str": "AND", "x": 600, "y": 280, "size": 25 }, { "str": "NOT", "x": 600, "y": 500, "size": 25 }, { "str": "AND", "x": 800, "y": 440, "size": 25 }, { "str": "无论输入是什么，输出都是False", "x": 600, "y": 580, "size": 16 }] } } as AppFileContent);
//   });
// })();
