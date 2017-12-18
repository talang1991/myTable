import { IError } from '../../interface/IError';
import { isFunction, isNullOrUndefined } from 'util';

export class AsyncTaskArray {
    private _tasksNum: number;
    private _err: IError = { name: 'taskList运行错误', message: null };

    private _callbackFunc: (err: IError, params?: any) => void;

    private _callbackParams: any;

    constructor() {
        this._tasksNum = 0;
        return this;
    }

    set(params?: any): AsyncTaskArray {
        this._callbackParams = params;
        return this;
    }

    end(callback: (err: IError, params?: any) => void): AsyncTaskArray {
        this._callbackFunc = callback;
        return this;
    }

    ckeck(error?: IError): void {
        this._tasksNum--;
        this._setErrorMessage(error);
        if (this._tasksNum === 0) {
            this._callback();
        }
    }

    add(func?: () => void): AsyncTaskArray {
        if (isFunction(func)) {
            setTimeout(() => {
                func();
            }, 10);
        }
        this._tasksNum++;
        return this;
    }

    private _setErrorMessage(error?: IError): void {
        if (isNullOrUndefined(error) === false) {
            if (this._err.message !== null) {
                this._err.message += ',' + error.message
            } else {
                this._err.message = error.message;
            }
        }
    }

    private _callback() {
        if (this._err.message !== null) {
            this._callbackFunc(this._err, this._callbackParams);
        } else {
            this._callbackFunc(null, this._callbackParams);
        }
    }
}