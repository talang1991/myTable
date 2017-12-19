import { IError } from '../../interface/IError';
import { isNullOrUndefined } from 'util';
import { UserError } from '../UserError';

export class HandleCallback {
    static handleWithOneParam(err: IError, callback: (err: IError, param: any) => void, handle: () => void) {
        if (isNullOrUndefined(err)) {
            handle();
        } else {
            if (err instanceof UserError === false) {
                console.log(err);
                callback(err, null);
            } else {
                callback(err, null);
            }
        }
    }
}