import React from 'react';
import { AppDataBase } from '../AppDataBase';
import { AppHomeContent } from './AppHomeContent';
import { AppHomeHeader } from './AppHomeHeader';
export class AppHome extends React.Component {
  render(): React.ReactNode {
    return (
      <AppHomeHeader pageContent={
        <AppHomeContent />
      } />
    );
  }
}

(() => {
  let database = AppDataBase.getDataBase('yyhhenry-logic-block');
  database.modifyTransaction('file-list', store => {
    store.clear();
    store.put({ filename: 'yyh', color: 'gray' });
  });
})();
