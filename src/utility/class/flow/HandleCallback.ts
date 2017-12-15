import { IError } from '../../interface/IError';

export class HandleCallback {
    static handleWithOneParam(err: IError, callback: (err: IError, param: any) => void, handle: () => void) {
        if (err) {
            callback(err, null)
        } else {
            handle();
        }
    }
}