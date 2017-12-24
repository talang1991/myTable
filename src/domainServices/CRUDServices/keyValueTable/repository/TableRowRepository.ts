import { CRUDEntity } from "../../utility/CRUDEntity";
import { Model, Document } from 'mongoose';
import { IError } from '../../../../utility/interface/IError';
import { SyncTaskArray } from "../../../../utility/class/flow/SyncTaskArray";
import { HandleCallback } from "../../../../utility/class/flow/handleCallback";
import { Util } from '../../../../utility/class/Util';
import { KeyTableValue } from '../schema/KeySchema';
import { isNullOrUndefined } from "util";
import { TableRowModel } from '../schema/TableRowSchema';
import { createHash } from "crypto";
import { KeyList } from './KeyListRepository';
import { ITableRow } from '../../../../utility/interface/entity/ITableRow';
import { LockService } from '../../../../utility/class/service/LockService';


/**
 * 
 * 
 * @export TableRow
 * @class ValueValueTable
 * @extends {CRUDEntity}
 */
export class TableRow extends CRUDEntity implements ITableRow {

    private _keyList: KeyList

    constructor(callback: (err: IError) => void, id: string, keyList: KeyList);
    constructor(callback: (err: IError) => void, content: any, keyList: KeyList);
    constructor() {
        let callback = arguments[0],
            model = arguments[1];
        super(TableRowModel, (err) => {
            HandleCallback.handleWithOneParam(err, callback, () => {
                callback();
            })
        }, arguments[1]);
        this._keyList = arguments[2];
    }

    private _getTableRow(): any {
        return this._document.get('tableRow');
    }

    protected _setId(): void {
        this._document.set('keyListId', this.keysListId);
        this._document.set('tabelName', this.tableName);
        this._document.set('tableRow', {});
        super._setId();
    }

    protected _setEntity(content: Object, callback: (err?: IError) => void): void {
        let isOk = true,
            errKey,
            errType: any = 1,
            validRowContent = this._getTableRow();
        if (typeof content === 'object') {
            let keyTable = this._keyList.keyTable;
            for (let key in keyTable) {
                if (keyTable.hasOwnProperty(key)) {
                    if (content.hasOwnProperty(key) === false) {
                        if (keyTable[key].isRequired === true) {
                            errKey = key;
                            isOk = false;
                            break;
                        } else if (keyTable[key].defaultValue) {
                            let oldValue = this.getValue(key);
                            if (!oldValue) {
                                validRowContent[key] = keyTable[key].defaultValue;
                            }
                        }
                    } else {
                        let out = _setValidRowContent.call(this, key);
                        if (out !== 'ok') {
                            errType = out;
                            errKey = key;
                            isOk = false;
                            break;
                        }
                    }
                }
            }
        } else {
            errKey = '内容为空';
            isOk = false;
        }
        if (isOk) {
            this._document.markModified('tableRow');
            const lockName = `TableRow:(${this.id})->setEntity`;
            LockService.initLock(lockName, () => {
                super._setEntity({ tableRow: validRowContent }, (err) => {
                    LockService.unlock(lockName);
                    callback(err);
                });
            })
        } else {
            callback({
                name: 'TableRowRepository->_setEntity错误',
                message: `${errType !== 1 ? `content内容验证失败_${errType}` : 'content缺失内容'}：${errKey}:${content ? content[errKey] : ''}!`
            });
        }
        function _setValidRowContent(this: TableRow, key: string): string {
            let keyTable = this._keyList.keyTable,
                type = keyTable[key].type;
            if (Util.validValue(type, content, key)) {
                if (type === 'any') {
                    let old = this.getValue(key);
                    old = isNullOrUndefined(old) ? {} : old;
                    for (const name in content[key]) {
                        if (content[key].hasOwnProperty(name)) {
                            const value = content[key][name];
                            old[name] = value;
                        }
                    }
                    validRowContent[key] = old;
                } else {
                    validRowContent[key] = content[key];
                }
                return 'ok';
            } else {
                return type;
            }
        }
    }

    clone(callback: (err: IError, param: any) => void) {

    }

    get keysListId(): string {
        return this._keyList.id;
    }

    get tableName(): string {
        return this._keyList.tableName;
    }

    getValue(key: string): any {
        let tableRow = this._document.get('tableRow');
        return tableRow ? tableRow[key] : null;
    }


    getContent(): any {
        let row = {},
            keyTable = this._keyList.keyTable,
            tableRow = this._getTableRow();
        if (this._document && tableRow) {
            for (const key in keyTable) {
                if (keyTable.hasOwnProperty(key)) {
                    row[key] = tableRow[key];
                }
            }
        }
        return row;
    }

    update(callback: (err: URIError) => void, content: any) {
        const tasks = new SyncTaskArray({
            array: [
                () => {
                    this._setEntity(content, (err) => {
                        tasks.next(err);
                    });
                },
                () => {
                    this._saveEntity(callback);
                }
            ],
            callback: callback
        });
    }

    delete(callback: (err: URIError) => void) {
        this._document.remove((err) => {
            callback(err);
        })
    }
}