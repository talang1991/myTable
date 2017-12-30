import { KeyList } from '../repository/KeyListRepository';
import { TableRow } from '../repository/TableRowRepository';
import { IError } from '../../../../utility/interface/IError';
import { Model, Document } from 'mongoose';
import { KeyType } from '../schema/KeySchema';
import { MemoryCacheService } from '../../../memoryCacheServices/service/MemoryCacheService';
import { HandleCallback } from '../../../../utility/class/flow/handleCallback';
import { SyncTaskArray } from '../../../../utility/class/flow/SyncTaskArray';
import { MemoryCache } from '../../../memoryCacheServices/repository/MemoryCacheRepository';
import { UserError } from '../../../../utility/class/UserError';
import { createHash } from 'crypto';

interface TableCache {
    keylist: KeyList
    model: Model<Document>
}

function __getCache(upName: string, name: string) {
    let cache: MemoryCache = MemoryCacheService
        .getCache(upName);
    if (cache) {
        return cache.getValue(name);
    }
    return null;
}

function _getTableByCache(tableName: string): TableCache {
    return __getCache('keyValueTable_tables', tableName);
}

function _getKeyListByCache(keyListId: string): KeyList {
    return __getCache('keyValueTable_keyLists', keyListId);
}

function _getKeyListByDB(callback: (err: IError, keyList: KeyList) => void, keyListId: string) {
    const keyList = new KeyList((err) => {
        HandleCallback.handleWithOneParam(err, callback, () => {
            _setKeyListInCache(keyListId, keyList);
            callback(null, keyList);
        });
    }, keyListId);
}

function _getKeyListByCacheOrDB(callback: (err: IError, keyList: KeyList) => void, keyListId: string): void {
    let keyList = _getKeyListByCache(keyListId);
    if (keyList === undefined) {
        _getKeyListByDB(callback, keyListId);
    } else {
        callback(null, keyList);
    }
}


function _setKeyListInCache(keyListId: string, keyList: KeyList): void {
    MemoryCacheService
        .getCache('keyValueTable_keyLists')
        .setValue(keyListId, keyList);
}

function _createKeyList(callback: (err: IError, keyList: KeyList) => void): void {
    const keyList = new KeyList((err) => {
        HandleCallback.handleWithOneParam(err, callback, () => {
            callback(null, keyList);
        });
    }, null);
}

function _updateTable(keyListId: string, callback: (err: IError) => void): void {
    let keyList: KeyList
    const tasks = new SyncTaskArray({
        array: [
            () => {
                _getKeyListByDB((err, kl) => {
                    keyList = kl;
                    tasks.next(err);
                }, keyListId)
            },
            () => {
                _setKeyListInCache(keyListId, keyList);
                tasks.end(null);
            }
        ],
        callback: callback
    });
}

function _getTableRow(callback: (err: IError, tableRow: TableRow) => void, keyListId: string, rowId: string) {
    let keyList: KeyList;
    const tasks = new SyncTaskArray({
        array: [
            () => {
                _getKeyListByCacheOrDB((err, kl) => {
                    keyList = kl;
                    tasks.next(err);
                }, keyListId)
            },
            () => {
                const row = new TableRow((err) => {
                    callback(err, row)
                }, rowId, keyList);
            }
        ],
        callback: callback
    });
}

export class KeyValueTableService {

    static createTable(callback: (err: IError, tableId: string) => void, name: string): void {
        let keyList: KeyList;
        const tasks = new SyncTaskArray({
            array: [
                () => {
                    _createKeyList((err, kl) => {
                        keyList = kl;
                        tasks.next(err);
                    })
                },
                () => {
                    const md5 = createHash('md5'),
                        extraName = md5.update((new Date().toDateString() + Math.random().toString(8))).digest('base64');
                    name = `${name}_${extraName}`;
                    _setKeyListInCache(keyList.id, keyList);
                    keyList.setTableName((err) => {
                        callback(err, keyList.id);
                    }, name)
                }
            ],
            callback: callback
        });
    }

    static updateTable(callback: (err: IError) => void, tableId: string): void {
        _updateTable(tableId, callback);
    }

    static addKey(callback: (err: IError, tableId: string) => void, key: KeyType, tableId: string): void {
        let keyList: KeyList, name: string;
        const tasks = new SyncTaskArray({
            array: [
                () => {
                    _getKeyListByCacheOrDB((err, list) => {
                        keyList = list;
                        tasks.next(err);
                    }, tableId)
                },
                () => {
                    if (keyList && keyList.tableName) {
                        name = keyList.tableName;
                    }
                    const newKeyList = new KeyList((err) => {
                        keyList = newKeyList;
                        tasks.next(err);
                    }, { keyArray: keyList.keyArray, keyTable: keyList.keyTable });
                },
                () => {
                    keyList.addKey((err) => {
                        tasks.next(err);
                    }, key);
                },
                () => {
                    _setKeyListInCache(tableId, keyList);
                    keyList.setTableName((err) => {
                        callback(err, keyList.id);
                    }, name)
                }
            ],
            callback: callback
        });
    }

    static removeKey(callback: (err: IError, tableId: string) => void, keyName: string, tableId: string): void {
        let keyList: KeyList, name: string;
        const tasks = new SyncTaskArray({
            array: [
                () => {
                    _getKeyListByCacheOrDB((err, list) => {
                        keyList = list;
                        tasks.next(err);
                    }, tableId)
                },
                () => {
                    if (keyList && keyList.tableName) {
                        name = keyList.tableName;
                    }
                    const newKeyList = new KeyList((err) => {
                        keyList = newKeyList;
                        tasks.next(err);
                    }, { keyArray: keyList.keyArray, keyTable: keyList.keyTable });
                },
                () => {
                    keyList.removeKey((err) => {
                        tasks.next(err);
                    }, keyName);
                },
                () => {
                    _setKeyListInCache(tableId, keyList);
                    keyList.setTableName((err) => {
                        callback(err, keyList.id);
                    }, name);
                }
            ],
            callback: callback
        });
    }

    static addRow(callback: (err: IError, row: TableRow) => void, tableId: string, content: any): void {
        let keyList: KeyList;
        const tasks = new SyncTaskArray({
            array: [
                () => {
                    _getKeyListByCacheOrDB((err, kl) => {
                        keyList = kl;
                        tasks.next(err);
                    }, tableId)
                },
                () => {
                    const row = new TableRow((err) => {
                        callback(err, row);
                    }, content, keyList);
                }
            ],
            callback: callback
        });
    }

    static getRow(callback: (err: IError, row: TableRow) => void, tableId: string, rowId: string): void {
        _getTableRow((err, tableRow) => {
            callback(err, tableRow);
        }, tableId, rowId)
    }

    static updateRow(callback: (err: IError, row: TableRow) => void, tableId: string, rowId: string, content: any): void {
        let table: TableCache,
            row: TableRow,
            tableName: string;
        const tasks = new SyncTaskArray({
            array: [
                () => {
                    _getTableRow((err, tableRow) => {
                        row = tableRow;
                        tasks.next(err)
                    }, tableId, rowId)
                },
                () => {
                    row.update((err) => {
                        callback(err, row)
                    }, content)
                }
            ],
            callback: callback
        });
    }

    static deleteRow(callback: (err: IError, row: TableRow) => void, tableId: string, rowId: string): void {
        let table: TableCache,
            row: TableRow,
            tableName: string;
        const tasks = new SyncTaskArray({
            array: [
                () => {
                    _getTableRow((err, tableRow) => {
                        row = tableRow;
                        tasks.next(err)
                    }, tableId, rowId)
                },
                () => {
                    row.delete((err) => {
                        callback(err, row)
                    })
                }
            ],
            callback: callback
        });
    }
}