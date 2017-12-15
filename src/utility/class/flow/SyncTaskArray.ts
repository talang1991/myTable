import { ICallbackParam } from '../../interface/flowData/ICallbackParam';
import { IExtraParams } from '../../interface/flowData/IExtraParams';
import { IHttpParams } from '../../interface/flowData/IHttpParams';
/**
 * RunTasksService
 */

function _handleErrorWithHTML(res, err) {
    res.render("error", {
        error: {
            message: "出错拉！",
            status: err.name,
            stack: err.message,
            code: err.code
        }
    });
};

function _handleErrorWithJSON(res, error) {
    res.json({
        error: error
    });
};

function _handleErrorWithCallback(callback, error) {
    console.log('err:' + JSON.stringify(error));
    callback(error);
};
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

    extra() {
        return this._param._params.extra;
    }

    http() {
        return this._param._params.http;
    }

    next(err: any): void {
        let params = this._param._params, array = this._param._array;
        if (params.extra.common && params.extra.common.taskNum) {
            params.extra.common.taskNum++;
            /*console.log(params.extra.taskNum);*/
        }
        if (err === null || err === undefined) {
            if (array.length !== 0) {
                var curentTask = array.shift();
                if (curentTask) {
                    curentTask(this.extra(), this.http(), this);
                };
            };
        } else {
            SyncTaskArray.handleError(this._param, err);
        }
    }

    unshift(func: (extra: IExtraParams, http: IHttpParams, taskArray?: SyncTaskArray) => void) {
        this._param._array.unshift(func)
    }

    static handleError(param: ICallbackParam, err: any) {
        let params = param._params;
        if (params) {
            if (params.extra.common && params.extra.common.feedback === 'json') {
                _handleErrorWithJSON(params.http.res, err)
            } else if (params.extra.common && params.extra.common.feedback === 'html') {
                _handleErrorWithHTML(params.http.res, err);
            } else if (params.extra.callback !== undefined) {
                _handleErrorWithCallback(params.extra.callback, err);
            };
        };
    };
}