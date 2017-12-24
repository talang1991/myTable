import { CRUDEntity } from "../../utility/CRUDEntity";
import { KeyModel, KeyType, KeyIndex, KeyTableValue } from '../schema/KeySchema';
import { Util } from '../../../../utility/class/Util';
import { IError } from "../../../../utility/interface/IError";
import { UserError } from '../../../../utility/class/UserError';
import { LockService } from "../../../../utility/class/service/LockService";
interface KeyListContent {
    keyArray: KeyType[]
    keyTable: { [name: string]: KeyTableValue }
    keyIndexTable?: { [name: string]: -1 | 1 }
}
/**
 * 
 * 
 * @export KeyList
 * @class KeyValueTable
 * @extends {CRUDEntity}
 */
export class KeyList extends CRUDEntity {
    private _keyArray: KeyType[]
    private _keyTable: { [name: string]: KeyTableValue }
    private _keyIndexTable: any
    private _tableName: string

    constructor(callback: (err: IError) => void, id: string);
    constructor(callback: (err: IError) => void, content: KeyListContent);
    constructor() {
        let callback = arguments[0]
        super(KeyModel, (err) => {
            if (err) {
                callback(err);
            } else {
                this._keyArray = this._document.get('keyArray');
                this._keyTable = this._document.get('keyTable');
                this._keyIndexTable = this._document.get('keyIndexTable');
                this._tableName = this._document.get('tableName');
                callback(null);
            }

        }, arguments[1]);
    }

    get keyTable(): { [name: string]: KeyTableValue } {
        return this._keyTable;
    }

    get keyIndexTable(): any {
        return this._keyIndexTable;
    }

    get keyArray(): KeyType[] {
        return this._keyArray;
    }

    get tableName(): string {
        return this._tableName;
    }

    setKeyIndex(callback: (err: IError) => void, keyIndexs: KeyIndex[]) {
        let keyIndexTable = {};
        keyIndexs.forEach((keyIndex) => {
            const isOk = Util.arrayHasOne(this._keyArray, (key) => {
                if (key.name === keyIndex.name) {
                    return true;
                }
                return false;
            })
            if (isOk && (keyIndex.index === 1 || keyIndex.index === -1)) {
                keyIndexTable[keyIndex.name] = keyIndex.index;
            }
        })
        this._document.markModified('keyIndexTable');
        this._document.set('keyIndexTable', keyIndexTable);
        this._saveEntity(callback);
    }

    setTableName(callback: (err: IError) => void, name: string): void {
        this._tableName = name;
        this._document.set('tableName', name);
        this._saveEntity(callback);
    }

    setKeyName(callback: (err: IError) => void, index: number, name: string): void {
        const isOk = Util.arrayHasOne(this._keyArray, (item) => {
            if (item.name === name) {
                return true;
            }
            return false
        });
        if (isOk) {
            if (Util.indexInArray(this._keyArray, index)) {
                this._keyArray[index].name = name;
                this._saveEntity(callback);
            } else {
                callback(new UserError({
                    name: 'KeyListRepository->setKeyName错误',
                    message: `数组下标越界：${index},keys数组长度：${this._keyArray.length}$`
                }))
            }
        } else {
            callback(new UserError({
                name: 'KeyListRepository->setKeyName错误',
                message: 'keys数组内已有该名称key'
            }))
        }
    }

    moveKeyPrev(callback: (err: IError) => void, index: number): void {
        if (Util.indexInArray(this._keyArray, index)) {
            if (index !== 0) {
                let temp = this._keyArray[index - 1];
                this._keyArray[index - 1] = this._keyArray[index];
                this._keyArray[index] = temp;
                this._saveEntity(callback);
            } else {
                callback(null)
            }
            this._saveEntity(callback)
        } else {
            callback(new UserError({
                name: 'KeyListRepository->moveKeyPrev错误',
                message: `数组下标越界：${index},keys数组长度：${this._keyArray.length}$`
            }))
        }
    }

    moveKeyNext(callback: (err: IError) => void, index: number): void {
        if (Util.indexInArray(this._keyArray, index)) {
            if (index !== this._keyArray.length - 1) {
                let temp = this._keyArray[index + 1];
                this._keyArray[index + 1] = this._keyArray[index];
                this._keyArray[index] = temp;
                this._saveEntity(callback);
            } else {
                callback(null)
            }
            this._saveEntity(callback)
        } else {
            callback(new UserError({
                name: 'KeyListRepository->moveKeyNext错误',
                message: `数组下标越界：${index},keys数组长度：${this._keyArray.length}$`
            }))
        }
    }

    addKey(callback: (err: IError) => void, key: KeyType) {
        const type = this._getKeyType(key.keyType);
        if (type === false) {
            callback(new UserError({
                name: 'KeyListRepository->addKey错误',
                message: `key类型错误：${key.keyType}`
            }));
        } else {
            if (this._validKeyExtraAttr(key)) {
                this._addKey(key, callback)
            } else {
                callback(new UserError({
                    name: 'KeyListRepository->addKey错误',
                    message: `key.defaultValue(${key.keyType}):${key.defaultValue},key.isVisible:${key.isVisible},key.isRequired:${key.isRequired}.`
                }));
            }
        }
    }

    removeKey(callback: (err: IError) => void, keyName: string) {
        this._keyArray = this._keyArray.filter((key) => {
            if (key.name === keyName) {
                return false;
            }
            return true;
        });
        if (keyName in this._keyTable) {
            delete this._keyTable[keyName];
        }
        this.__setKey();
        this._saveEntity(callback);
    }

    clone(callback: (err: IError, keyListId: string) => void) {
        let content = {
            keyArray: this._keyArray,
            keyTable: this._keyTable
        }
        const keyList = new KeyList((err) => {
            callback(err, keyList.id);
        }, content);
    }

    private __setKey() {
        this._document.set('keyArray', this._keyArray);
        this._document.set('keyTable', this._keyTable);
        this._document.markModified('keyTable');
    }

    private __addKey(key: KeyType) {
        this._keyArray.push(key);
        this._keyTable[key.name] = {
            isRequired: key.isRequired,
            type: key.keyType,
            defaultValue: key.defaultValue
        };
        this.__setKey();
    }

    private _addKey(key: KeyType, callback: (err: IError) => void) {
        if (this._keyArray !== undefined && this._keyTable !== undefined) {
            this.__addKey(key);
        } else {
            this._keyArray = [];
            this._keyTable = {};
            this.__addKey(key);
        }
        const lockName = `KeyList:${this.id}->addKey`;
        LockService.initLock(lockName, () => {
            this._saveEntity((err) => {
                LockService.unlock(lockName)
                callback(err);
            });
        })
    }

    private _validKeyExtraAttr(key: KeyType): boolean {
        let out = true
        for (const attr of ['isVisible', 'isRequired', 'defaultValue']) {
            if (key[attr]) {
                if (attr === 'defaultValue') {
                    if (Util.validValue(key.keyType, key, 'defaultValue') === false) {
                        out = false;
                        break;
                    }
                } else if (Util.validValue('bool', key, attr) === false) {
                    out = false;
                    break;
                }
            }
        }
        return out;
    }

    private _getKeyType(type: string): any {
        switch (type) {
            case 'str':
                return String;
            case 'num':
                return Number;
            case 'bool':
                return Boolean;
            case 'date':
                return Date;
            case 'any':
                return Object;
            default:
                return false;
        }
    }
}