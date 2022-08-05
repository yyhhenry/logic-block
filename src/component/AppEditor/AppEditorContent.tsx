import React, { useEffect, useState } from 'react';
import { AppDataBase } from '../AppDataBase';
import { AppFileContent, isAppFileContent } from './AppFileContent';
export interface AppEditorContentProps {
  filename?: string;
}
const database = AppDataBase.getDataBase('yyhhenry-logic-block');
export const AppEditorContent: React.FC<AppEditorContentProps> = props => {
  const initState = () => {
    return {
      fileContent: undefined as AppFileContent | undefined,
      failed: false,
    };
  };
  const [state, setState] = useState(initState);
  let { fileContent, failed } = state;
  const boxMargin = 10;
  useEffect(() => {
    setState(initState());
    if (props.filename !== undefined) {
      database.queryTransaction('file', isAppFileContent, props.filename).then(v => {
        setState({ fileContent: v, failed: (v === undefined) });
      });
    }
  }, [props.filename]);
  let editorTableBuilder = (fileContent: AppFileContent) => {
    let points = fileContent.content.points.map((point, ind) => {
      const sideLength = 20;
      return (
        <div key={ind} style={{
          backgroundColor: point.power ? 'red' : 'blueviolet',
          left: point.x - sideLength / 2,
          top: point.y - sideLength / 2,
          width: sideLength,
          height: sideLength,
          position: 'absolute',
          borderRadius: sideLength / 4,
        }} />
      );
    });
    // let lines = fileContent.content.lines.map((line, ind) => {
    //   const lineWidth = 10;
    //   const pointFrom = fileContent.content.points[line.pointFrom];
    //   const pointTo = fileContent.content.points[line.pointTo];
    //   const midPoint = { x: (pointFrom.x + pointTo.x) / 2, y: (pointFrom.y + pointTo.y) / 2 };
    //   return (
    //     <div key={ind} style={{
    //       backgroundColor: 'gray',
    //     }} />
    //   );
    // });
    return (
      <div>
        {points}
      </div>
    );
  };
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
                fileContent === undefined ?
                  (
                    <div style={{ textAlign: 'center' }}>
                      <h1>{'加载中'}</h1>
                    </div>
                  ) : (
                    editorTableBuilder(fileContent)
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

(() => {
  let database = AppDataBase.getDataBase('yyhhenry-logic-block');
  database.modifyTransaction('file', store => {
    store.clear();
    store.put({ filename: 'yyh', content: { "points": [{ "x": 428, "y": 238, "power": false }, { "x": 424, "y": 405, "power": false }, { "x": 560, "y": 280, "power": false }, { "x": 601, "y": 308, "power": false }, { "x": 656, "y": 308, "power": false }, { "x": 564, "y": 334, "power": false }, { "x": 566, "y": 459, "power": false }, { "x": 660, "y": 458, "power": false }, { "x": 795, "y": 360, "power": false }, { "x": 835, "y": 385, "power": false }, { "x": 882, "y": 386, "power": false }, { "x": 792, "y": 410, "power": false }, { "x": 976, "y": 342, "power": false }, { "x": 239, "y": 431, "power": false }, { "x": 239, "y": 223, "power": false }, { "x": 1205, "y": 341, "power": false }], "lines": [{ "pointFrom": 2, "pointTo": 3, "notGate": true }, { "pointFrom": 3, "pointTo": 4, "notGate": true }, { "pointFrom": 5, "pointTo": 3, "notGate": true }, { "pointFrom": 0, "pointTo": 2, "notGate": false }, { "pointFrom": 1, "pointTo": 5, "notGate": false }, { "pointFrom": 1, "pointTo": 6, "notGate": false }, { "pointFrom": 6, "pointTo": 7, "notGate": true }, { "pointFrom": 8, "pointTo": 9, "notGate": true }, { "pointFrom": 9, "pointTo": 10, "notGate": true }, { "pointFrom": 11, "pointTo": 9, "notGate": true }, { "pointFrom": 4, "pointTo": 8, "notGate": false }, { "pointFrom": 7, "pointTo": 11, "notGate": false }, { "pointFrom": 10, "pointTo": 12, "notGate": false }, { "pointFrom": 1, "pointTo": 13, "notGate": false }, { "pointFrom": 0, "pointTo": 14, "notGate": false }, { "pointFrom": 12, "pointTo": 15, "notGate": false }], "texts": [{ "str": "输入1", "x": 200, "y": 180, "size": 25 }, { "str": "输入2", "x": 200, "y": 480, "size": 25 }, { "str": "AND", "x": 600, "y": 280, "size": 25 }, { "str": "NOT", "x": 600, "y": 500, "size": 25 }, { "str": "AND", "x": 800, "y": 440, "size": 25 }, { "str": "无论输入是什么，输出都是False", "x": 600, "y": 580, "size": 16 }] } } as AppFileContent);
  });
})();
