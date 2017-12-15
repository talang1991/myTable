import { HandleCallback } from './handleCallback';
import { IError } from '../../interface/IError';

interface ICallbackParam {
    array: (() => void)[]
    callback: (err: IError, param: any) => void
    param?: any
}

export class SyncTaskArray {

    private _param: ICallbackParam

    constructor(param: ICallbackParam, notAuto?: boolean) {
        this._param = param;
        if (notAuto === undefined) {
            setTimeout(() => {
                this._run();
            });
        }
    }

    private _run() {
        this.next(null);
    }

    next(err?: IError): void {
        let callback = this._param.callback, array = this._param.array;
        HandleCallback.handleWithOneParam(err, callback, () => {
            if (array.length !== 0) {
                var curentTask = array.shift();
                if (curentTask) {
                    curentTask();
                };
            };
        })
    }

    end(err?: IError): void {
        this._param.callback(err, this._param.param);
    }
}