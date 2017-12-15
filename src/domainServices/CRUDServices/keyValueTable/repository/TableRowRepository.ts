import { CRUDEntity } from "../../utility/CRUDEntity";
import { Model, Document } from 'mongoose';
import { IError } from '../../../../utility/interface/IError';
import { SimpleSyncTaskArray } from "../../../../utility/class/flow/SimpleSyncTaskArray";
import { HandleCallback } from "../../../../utility/class/flow/handleCallback";
import { Util } from '../../../../utility/class/Util';
import { KeyTableValue } from '../schema/KeySchema';


/**
 * 
 * 
 * @export TableRow
 * @class ValueValueTable
 * @extends {CRUDEntity}
 */
export class TableRow extends CRUDEntity {
    private _keyListId: string
    private _keyTable: { [name: string]: KeyTableValue }
    constructor(callback: (err: IError) => void, model: Model<Document>, id: string, keysObj: Object);
    constructor(callback: (err: IError) => void, model: Model<Document>, content: any, keysObj: Object);
    constructor() {
        let callback = arguments[0],
            model = arguments[1];
        super(model, (err) => {
            HandleCallback.handleWithOneParam(err, callback, () => {
                this._keyListId = this._document.get('keyListsId');
                callback();
            })
        }, arguments[2]);
        this._keyTable = arguments[3];
    }

    get keysListId(): string {
        return this._keyListId;
    }

    protected _setEntity(content: Object, callback: (err?: IError) => void): void {
        let isOk = true,
            errKey,
            errType: any = 1,
            validContent = {};
        if (typeof content === 'object') {
            for (let key in this._keyTable) {
                if (this._keyTable.hasOwnProperty(key) && content.hasOwnProperty(key) === false) {
                    if (this._keyTable[key].isRequired === true) {
                        errKey = key;
                        isOk = false;
                        break;
                    }
                } else {
                    let out = _setValidContent.call(this, key);
                    if (out !== 'ok') {
                        errType = out;
                        errKey = key;
                        isOk = false;
                        break;
                    }
                }
            }
        } else {
            errKey = '内容为空';
            isOk = false;
        }
        if (isOk) {
            super._setEntity(validContent, callback);
        } else {
            callback({
                name: 'TableRowRepository->_setEntity错误',
                message: `${errType !== 1 ? `content内容验证失败_${errType}` : 'content缺失内容'}：${errKey}:${content ? content[errKey] : ''}!`
            });
        }
        function _setValidContent(this: TableRow, key: string): string {
            let type = this._keyTable[key].type,
                value = content[key];
            if (type === 'date') {
                value = new Date(value);
            }
            if (Util.validValue(type, value)) {
                validContent[key] = value;
                return 'ok';
            } else {
                return type;
            }
        }
    }

    clone(callback: (err: IError, param: any) => void) {

    }

    getContent(): any {
        let row = {}
        if (this._document) {
            for (const key in this._keyTable) {
                if (this._keyTable.hasOwnProperty(key)) {
                    row[key] = this._document.get(key);
                }
            }
        }
        return row;
    }

    update(callback: (err: URIError) => void, content: any) {
        const tasks = new SimpleSyncTaskArray({
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