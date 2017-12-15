import { KeyList } from '../repository/KeyListRepository';
import { TableRow } from '../repository/TableRowRepository';
import { IError } from '../../../../utility/interface/IError';
import { Model, Document } from 'mongoose';
import { KeyType } from '../schema/KeySchema';
import { MemoryCacheService } from '../../../memoryCacheServices/service/MemoryCacheService';
import { TableModelFactorty } from '../factory/TableModelFactorty';
import { createHash } from 'crypto';
import { HandleCallback } from '../../../../utility/class/flow/handleCallback';
import { SimpleSyncTaskArray } from '../../../../utility/class/flow/SimpleSyncTaskArray';
import { MemoryCache } from '../../../memoryCacheServices/repository/MemoryCacheRepository';

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

function _addTableKey(callback: (err: IError) => void, keyListId: string, key: KeyType): void {
    let table: Model<Document>;
    const tasks = new SimpleSyncTaskArray({
        array: [
            () => {
                _getTableCache((err, tableCache) => {
                    if (tableCache) {
                        table = tableCache.model;
                    }
                    tasks.next(err);
                }, keyListId)
            },
            () => {
                let schemaObj = {};
                if (key.defaultValue) {
                    schemaObj[key.name] = {
                        type: TableModelFactorty.getSchemaType(key.keyType),
                        default: key.defaultValue
                    };
                } else {
                    schemaObj[key.name] = TableModelFactorty.getSchemaType(key.keyType);
                }
                table.schema.add(schemaObj);
                tasks.end(null);
            }
        ],
        callback: callback
    });
}

function _removeTableKey(callback: (err: IError) => void, keyListId: string, keyName: string) {
    let table: Model<Document>;
    const tasks = new SimpleSyncTaskArray({
        array: [
            () => {
                _getTableCache((err, tableCache) => {
                    if (tableCache) {
                        table = tableCache.model;
                    }
                    tasks.next(err);
                }, keyListId)
            },
            () => {
                table.schema.remove(keyName);
                tasks.end(null);
            }
        ],
        callback: callback
    });
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

function _createTable(name: string, keyListId: string, callback: (err: IError) => void): void {
    _getKeyListByCacheOrDB((err, list) => {
        HandleCallback.handleWithOneParam(err, callback, () => {
            __createTable(list, name);
            list.setTableName((err) => {
                callback(err);
            }, name);
        })
    }, keyListId);
    function __createTable(keyList: KeyList, name: string) {
        MemoryCacheService
            .getCache('keyValueTable_tables')
            .setValue(name, {
                keylist: keyList,
                model: TableModelFactorty
                    .create(name, keyList.keyTable, keyList.keyIndexTable)
            });
    }

}

function _updateTable(table: TableCache, keyListId: string, callback: (err: IError) => void): void {
    let keyList: KeyList
    const tasks = new SimpleSyncTaskArray({
        array: [
            () => {
                _getKeyListByDB((err, kl) => {
                    keyList = kl;
                    tasks.next(err);
                }, keyListId)
            },
            () => {
                let keyArray = keyList.keyArray,
                    schema = table.model.schema;
                TableModelFactorty.update(schema, keyList, keyList.keyIndexTable);
                _setKeyListInCache(keyListId, keyList);
                tasks.end(null);
            }
        ],
        callback: callback
    });
}

function _getTableCache(callback: (err: IError, table: TableCache) => void, keyListId: string): void {
    let tableName: string,
        table: TableCache;
    const tasks = new SimpleSyncTaskArray({
        array: [
            () => {
                _getKeyListByCacheOrDB((err, keyList) => {
                    HandleCallback.handleWithOneParam(err, callback, () => {
                        if (keyList) {
                            tableName = keyList.tableName;
                            if (tableName === undefined) {
                                err = {
                                    name: "此ID的keyList没有创建过数据表",
                                    message: "请用初始该keyList创建数据表"
                                }
                            }
                        }
                        tasks.next(err);
                    })
                }, keyListId)
            },
            () => {
                table = _getTableByCache(tableName);
                if (table === undefined) {
                    _createTable(tableName, keyListId, (err) => {
                        tasks.next(err);
                    });
                } else {
                    tasks.next();
                }
            },
            () => {
                if (table === undefined) {
                    table = _getTableByCache(tableName);
                }
                callback(null, table);
            }
        ],
        callback: callback
    });
}

function _getTableRow(callback: (err: IError, tableRow: TableRow) => void, keyListId: string, rowId: string) {
    let table: TableCache;
    const tasks = new SimpleSyncTaskArray({
        array: [
            () => {
                _getTableCache((err, tableCache) => {
                    table = tableCache;
                    tasks.next(err);
                }, keyListId)
            },
            () => {
                const row = new TableRow((err) => {
                    callback(err, row)
                }, table.model, rowId, table.keylist.keyTable);
            }
        ],
        callback: callback
    });
}

export class KeyValueTableService {

    static createTable(callback: (err: IError, keyListId: string) => void, name: string): void {
        let md5 = createHash('md5'),
            extraName = md5
                .update((new Date().toDateString() + Math.random().toString(8)))
                .digest("base64"),
            finalName = `${name}_${extraName}`,
            keyListId: string,
            keyList: KeyList;
        const tasks = new SimpleSyncTaskArray({
            array: [
                () => {
                    _createKeyList((err, kl) => {
                        keyList = kl;
                        tasks.next(err);
                    })
                },
                () => {
                    _setKeyListInCache(keyList.id, keyList);
                    keyListId = keyList.id;
                    tasks.next(null);
                },
                () => {
                    _createTable(finalName, keyListId, (err) => {
                        callback(err, keyListId);
                    });
                }
            ],
            callback: callback
        });
    }

    static updateTable(callback: (err: IError) => void, tableName: string, keyListId: string): void {
        let table: TableCache
        const tasks = new SimpleSyncTaskArray({
            array: [
                () => {
                    table = _getTableByCache(tableName);
                    if (table === undefined) {
                        _getTableCache((err, tableCache) => {
                            table = tableCache;
                            tasks.next(err);
                        }, keyListId)
                    } else {
                        tasks.next();
                    }
                },
                () => {
                    _updateTable(table, keyListId, callback);
                }
            ],
            callback: callback
        });
    }

    static addKey(callback: (err: IError) => void, key: KeyType, keyListId: string): void {
        let keyList: KeyList;
        const tasks = new SimpleSyncTaskArray({
            array: [
                () => {
                    _getKeyListByCacheOrDB((err, list) => {
                        keyList = list;
                        tasks.next(err);
                    }, keyListId)
                },
                () => {
                    keyList.addKey((err) => {
                        tasks.next(err);
                    }, key);
                },
                () => {
                    _setKeyListInCache(keyListId, keyList);
                    _addTableKey((err) => {
                        tasks.end(err)
                    }, keyListId, key);
                }
            ],
            callback: callback
        });
    }

    static removeKey(callback: (err: IError) => void, keyName: string, keyListId: string): void {
        let keyList: KeyList;
        const tasks = new SimpleSyncTaskArray({
            array: [
                () => {
                    _getKeyListByCacheOrDB((err, list) => {
                        keyList = list;
                        tasks.next(err);
                    }, keyListId)
                },
                () => {
                    keyList.removeKey((err) => {
                        tasks.next(err);
                    }, keyName)
                },
                () => {
                    _setKeyListInCache(keyListId, keyList);
                    _removeTableKey((err) => {
                        tasks.end(err)
                    }, keyListId, keyName);
                }
            ],
            callback: callback
        });
    }

    static addRow(callback: (err: IError, row: TableRow) => void, keyListId: string, content: any): void {
        let table: TableCache,
            tableName: string;
        const tasks = new SimpleSyncTaskArray({
            array: [
                () => {
                    _getTableCache((err, tableCache) => {
                        table = tableCache;
                        tasks.next(err);
                    }, keyListId)
                },
                () => {
                    const row = new TableRow((err) => {
                        callback(err, row);
                    }, table.model, content, table.keylist.keyTable);
                }
            ],
            callback: callback
        });
    }

    static getRow(callback: (err: IError, row: TableRow) => void, keyListId: string, rowId: string): void {
        _getTableRow((err, tableRow) => {
            callback(err, tableRow);
        }, keyListId, rowId)
    }

    static updateRow(callback: (err: IError, row: TableRow) => void, keyListId: string, rowId: string, content: any): void {
        let table: TableCache,
            row: TableRow,
            tableName: string;
        const tasks = new SimpleSyncTaskArray({
            array: [
                () => {
                    _getTableRow((err, tableRow) => {
                        row = tableRow;
                        tasks.next(err)
                    }, keyListId, rowId)
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

    static deleteRow(callback: (err: IError, row: TableRow) => void, keyListId: string, rowId: string): void {
        let table: TableCache,
            row: TableRow,
            tableName: string;
        const tasks = new SimpleSyncTaskArray({
            array: [
                () => {
                    _getTableRow((err, tableRow) => {
                        row = tableRow;
                        tasks.next(err)
                    }, keyListId, rowId)
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