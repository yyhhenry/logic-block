export interface StoreInfoType {
  storeName: string;
  keyPath: string | string[];
}
export type StoreInfoRecordType = Record<string, StoreInfoType[] | undefined>;
const storeInfoRecord: StoreInfoRecordType = {
  'yyhhenry-logic-block': [
    {
      storeName: 'file-list',
      keyPath: 'filename',
    },
    {
      storeName: 'file',
      keyPath: 'filename',
    },
  ],
};

interface openDataBaseOption {
  version: number;
  upgradeListener: (database: IDBDatabase) => void;
}
function openDataBase(databaseName: string, option?: openDataBaseOption) {
  let { version, upgradeListener } = option || {};
  return new Promise<IDBDatabase>(async resolve => {
    let dbRequest = indexedDB.open(databaseName, version);
    dbRequest.addEventListener('success', () => {
      console.info('indexedDB.open(): [success]');
      resolve(dbRequest.result);
    });
    dbRequest.addEventListener('upgradeneeded', () => {
      console.info('indexedDB.open(): [upgradeneeded]');
      upgradeListener && upgradeListener(dbRequest.result);
    });
    dbRequest.addEventListener('blocked', () => {
      console.info('indexedDB.open(): [blocked]');
    })
    dbRequest.addEventListener('error', () => {
      console.info('indexedDB.open(): [error]');
    });
  });
}
async function initDataBase(databaseName: string, storeNames: StoreInfoType[], autoClose: boolean, callback: (database: IDBDatabase) => Promise<void>) {
  async function initStoreNameBase(databaseName: string, storeNames: StoreInfoType[]) {
    let database = await openDataBase(databaseName);
    let currentNames = database.objectStoreNames;
    if (storeNames.every(storeInfo => currentNames.contains(storeInfo.storeName))) {
      console.log('initStoreName(): 全部Store已经建立');
      return database;
    }
    let version = database.version + 1;
    database.close();
    (await openDataBase(databaseName, {
      version,
      upgradeListener(database) {
        storeNames.forEach(storeInfo => {
          let { storeName, keyPath } = storeInfo;
          if (!currentNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath });
            console.log(`initStoreName(): 创建${storeName}`);
          }
        });
      },
    })).close();
    return await openDataBase(databaseName);
  }
  let database = await initStoreNameBase(databaseName, storeNames);
  await callback(database);
  autoClose && database.close();
}
type MyTransactionType = (database: IDBDatabase) => (Promise<void> | void);

export class AppDataBase {
  private static dbList: Record<string, AppDataBase | undefined> = {};
  static getDataBase(dbName: string): AppDataBase {
    let dbInList = this.dbList[dbName];
    if (dbInList !== undefined) {
      return dbInList;
    } else {
      let newDB = new AppDataBase(dbName);
      this.dbList[dbName] = newDB;
      return newDB;
    }
  }
  private database: IDBDatabase | undefined = undefined;
  private transactionList: MyTransactionType[] = [];
  private async refreshTransactionList() {
    if (this.database === undefined) {
      return;
    }
    let list = this.transactionList;
    this.transactionList = [];
    for (let i = 0; i < list.length; i++) {
      await list[i](this.database);
    }
  }
  private constructor(dbName: string) {
    let storeInfo = storeInfoRecord[dbName];
    if (storeInfo === undefined) {
      return;
    }
    initDataBase(dbName, storeInfo, false, async database => {
      this.database = database;
      this.refreshTransactionList();
    });
  }
  private requestTransaction(transaction: MyTransactionType) {
    this.transactionList.push(transaction);
    this.refreshTransactionList();
  }
  modifyTransaction(storeName: string, callback: (store: IDBObjectStore) => void) {
    return new Promise<void>(async (resolve, reject) => {
      this.requestTransaction(async database => {
        let transaction = database.transaction(storeName, 'readwrite');
        callback(transaction.objectStore(storeName));

        transaction.addEventListener('complete', () => {
          resolve(undefined);
        });
        transaction.addEventListener('error', () => {
          reject(new Error(`modifyTransaction(): Failed to add or update in store ${storeName}`));
        });
      });
    });
  }
  queryTransaction<T>(storeName: string, isT: ((v: unknown) => v is T), query: IDBValidKey | IDBKeyRange) {
    return new Promise<T | undefined>(async (resolve, reject) => {
      this.requestTransaction(async database => {
        let transaction = database.transaction(storeName, 'readonly');
        let request = transaction.objectStore(storeName).get(query);
        transaction.addEventListener('complete', () => {
          let v = request.result;
          resolve(isT(v) ? v : undefined);
        });
        transaction.addEventListener('error', () => {
          reject(new Error(`queryTransaction(): Failed to query in store ${storeName}`));
        });
      });
    });
  }
  queryAllTransaction<T>(storeName: string, isT: ((v: unknown) => v is T), query: IDBValidKey | IDBKeyRange | undefined = undefined) {
    return new Promise<T[]>(async (resolve, reject) => {
      this.requestTransaction(async database => {
        let transaction = database.transaction(storeName, 'readonly');
        let request = transaction.objectStore(storeName).getAll(query);
        transaction.addEventListener('complete', () => {
          resolve(request.result.filter(v => isT(v)) as T[]);
        });
        transaction.addEventListener('error', () => {
          reject(new Error(`queryAllTransaction(): Failed to queryAll in store ${storeName}`));
        });
      });
    });
  }
  countTransaction(storeName: string, query: IDBValidKey | IDBKeyRange | undefined = undefined) {
    return new Promise<number>(async (resolve, reject) => {
      this.requestTransaction(async database => {
        let transaction = database.transaction(storeName, 'readonly');
        let request = transaction.objectStore(storeName).count(query);
        transaction.addEventListener('complete', () => {
          resolve(request.result);
        });
        transaction.addEventListener('error', () => {
          reject(new Error(`countTransaction(): Failed to count in store ${storeName}`));
        });
      });
    });
  }
}
