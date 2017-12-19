import { IError } from '../interface/IError';
export class UserError implements IError {
    private _name: string
    private _message: string

    public get name(): string {
        return this.name;
    }

    public get message(): string {
        return this._message;
    }


    constructor(err: IError) {
        this._name = err.name;
        this._message = err.message;
    }
}