import { Model, Document } from "mongoose";
import { SyncTaskArray } from '../../../utility/class/flow/SyncTaskArray';
import { ICRUDEntity } from '../../../utility/interface/entity/ICRUDEntity';
import { createHash } from "crypto";
import { IError } from '../../../utility/interface/IError';
import { UserError } from "../../../utility/class/UserError";
/**
 * 这是一个CRUD实体对象的抽象基类
 * 
 * @export CRUDEntity
 * @class CRUDEntity
 * @implements {ICRUDEntity}
 */
export abstract class CRUDEntity implements ICRUDEntity {
    /**
     * 
     * 
     * @protected
     * @type {Model<Document>}
     * @memberof CRUDEntity
     */
    protected _model: Model<Document>;
    protected _document: Document | null;
    protected _callback: (err: any) => void;
    protected _content: any;
    protected _id: any;
    get id(): any {
        return this._id;
    }

    /**
     * Creates an instance of CRUDEntity.
     * @param {(err: any) => void} callback 
     * @param {Model<Document>} model 
     * @param {Object} content 
     * @memberof CRUDEntity
     */
    constructor(model: Model<Document>, callback: (err: IError) => void, content: any);

    /**
     * Creates an instance of CRUDEntity.
     * @param {(err: any) => void} callback 
     * @param {Model<Document>} model 
     * @param {string} id 
     * @memberof CRUDEntity
     */
    constructor(model: Model<Document>, callback: (err: IError) => void, id: string);
    constructor() {
        this._model = arguments[0];
        this._callback = arguments[1];
        if (typeof arguments[2] === 'string') {
            this._id = arguments[2];
            this._findEntity();
        } else {
            this._document = new this._model();
            this._content = arguments[2];
            setTimeout(() => {
                this._createNewEntity();
            });
        }
    }

    protected _setId(): void {
        /* let md5 = createHash('md5');
        this._id = md5.update((new Date().toDateString() + Math.random().toString(8))).digest('base64');
        this._document.set('id', this._id); */
    }

    protected _findEntity(): void {
        this._model.findById(this._id, (err, res) => {
            if (res) {
                this._document = res;
                this._callback(err);
            } else {
                this._callback(new UserError({ name: "未找到相应ID实体", message: "请确认相应实体ID" }));
            }
        });
    }

    private _createNewEntity() {
        const tasks = new SyncTaskArray({
            array: [
                () => {
                    // this._setId();
                    tasks.next();
                },
                () => {
                    this._setEntity(this._content, (err) => {
                        tasks.next(err);
                    });
                },
                () => {
                    this._saveEntity(this._callback);
                }
            ],
            callback: this._callback
        });
    }

    protected _removeEntity(callback?: (err: IError, product: Document) => void): void {
        this._document.remove(callback);
    }

    protected _setEntity(content: any, callback: (err?: IError) => void): void {
        this._content = {};
        for (let key in content) {
            if (content.hasOwnProperty(key)) {
                let value = content[key];
                this._document.set(key, value);
                this._content[key] = value;
            }
        }
        callback()
    }

    protected _saveEntity(callback?: (err: IError, product?: Document, numAffect?: number) => void): void {
        this._document.save((err, product, numAffect) => {
            this._document = product;
            if (callback) {
                callback(err, product, numAffect)
            }
        });
    }

    abstract clone(callback: (err: IError, param: any) => void);

    getModelName(): string {
        return this._model.modelName;
    }
}