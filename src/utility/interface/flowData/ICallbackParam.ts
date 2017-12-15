import { Request, Response } from 'express';
import { IHttpParams } from './IHttpParams';
import { IExtraParams } from './IExtraParams';
import { SyncTaskArray } from '../../class/flow/SyncTaskArray';
export interface ICallbackParam {
    _array: ((extra: IExtraParams, http: IHttpParams, taskArray?: SyncTaskArray) => void)[];
    _params: { extra: IExtraParams, http: IHttpParams };

}