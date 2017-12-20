import { CRUDEntity } from "../../utility/CRUDEntity";
import { Model, Document } from 'mongoose';
import { IError } from '../../../../utility/interface/IError';
import { SyncTaskArray } from "../../../../utility/class/flow/SyncTaskArray";
import { HandleCallback } from "../../../../utility/class/flow/handleCallback";
import { Util, ParserString } from '../../../../utility/class/Util';
import { KeyTableValue } from '../schema/KeySchema';
import { isNullOrUndefined } from "util";
import { ValueTable } from '../schema/TableRowSchema';
import { createHash } from "crypto";


/**
 * 
 * 
 * @export TableRow
 * @class ValueValueTable
 * @extends {CRUDEntity}
 */
export class TableRow extends CRUDEntity {
    private _tableRowId: string
    private _keyListId: string
    private _keyTable: { [name: string]: KeyTableValue }
    private _tableName: string
    constructor(callback: (err: IError) => void, id: string, keysObj: Object, tableName: string);
    constructor(callback: (err: IError) => void, content: any, keysObj: Object, tableName: string);
    constructor() {
        let callback = arguments[0],
            model = arguments[1];
        super(ValueTable, (err) => {
            HandleCallback.handleWithOneParam(err, callback, () => {
                this._keyListId = this._document.get('keyListsId');
                if (this._tableRowId === undefined) {
                    this._tableRowId = this._document.get('tableRow')._id;
                }
                callback();
            })
        }, arguments[1]);
        this._keyTable = arguments[2];
        this._tableName = arguments[3];
    }

    get keysListId(): string {
        return this._keyListId;
    }
    private _getTableRow(): any {
        return this._document.get('tableRow');
    }

    protected _setId(): void {
        let md5 = createHash('md5');
        this._tableRowId = md5.update((this._tableName + new Date().toDateString() + Math.random().toString(8))).digest('base64');
        this._document.set('tableRow', { _id: this._tableRowId });
        this._document.set('tableName', this._tableName);
        super._setId();
    }

    protected _setEntity(content: Object, callback: (err?: IError) => void): void {
        let isOk = true,
            errKey,
            errType: any = 1,
            validRowContent = this._getTableRow();
        if (typeof content === 'object') {
            for (let key in this._keyTable) {
                if (this._keyTable.hasOwnProperty(key)) {
                    if (content.hasOwnProperty(key) === false) {
                        if (this._keyTable[key].isRequired === true) {
                            errKey = key;
                            isOk = false;
                            break;
                        } else if (this._keyTable[key].defaultValue) {
                            let oldValue = this.getValue(key);
                            if (!oldValue) {
                                validRowContent[key] = this._keyTable[key].defaultValue;
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
            super._setEntity({ tableRow: validRowContent }, callback);
        } else {
            callback({
                name: 'TableRowRepository->_setEntity错误',
                message: `${errType !== 1 ? `content内容验证失败_${errType}` : 'content缺失内容'}：${errKey}:${content ? content[errKey] : ''}!`
            });
        }
        function _setValidRowContent(this: TableRow, key: string): string {
            let type = this._keyTable[key].type;
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

    getValue(key: string): any {
        let tableRow = this._document.get('tableRow');
        return tableRow ? tableRow[key] : null;
    }


    getContent(): any {
        let row = {},
            tableRow = this._getTableRow();
        if (this._document && tableRow) {
            for (const key in this._keyTable) {
                if (this._keyTable.hasOwnProperty(key)) {
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