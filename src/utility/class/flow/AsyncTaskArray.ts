import { IError } from '../../interface/IError';
import { isFunction, isNullOrUndefined } from 'util';

export class AsyncTaskArray {
    private _tasksNum: number;
    private _err: IError = { name: 'taskList运行错误', message: null };

    private _callback: (err: IError, params?: any) => void;

    private _callbackParams: any;

    constructor(callback: (err: IError, params?: any) => void, params?: any) {
        this._tasksNum = 0;
        this._callbackParams = params;
        this._callback = callback;
        this._callbackParams = params;
    }

    ckeckTasks(error?: IError): void {
        this._tasksNum--;
        if (isNullOrUndefined(error) === false) {
            if (this._err.message !== null) {
                this._err.message += ',' + error.message
            } else {
                this._err.message = error.message;
            };
        };
        if (this._tasksNum === 0) {
            if (this._err.message !== null) {
                this._callback(this._err, null);
            } else {
                this._callback(null, this._callbackParams);
            };
        };
    }

    addTask(func?: () => void): void {
        if (isFunction(func)) {
            func();
        }
        this._tasksNum++;
    }

    /* protected setErrorMessage(message: string): void {
        this._err.message = message;
    } */

    protected callback() {
        if (this._err.message !== null) {
            this._callback(this._err, this._callbackParams);
        } else {
            this._callback(null, this._callbackParams);
        };
    }
}