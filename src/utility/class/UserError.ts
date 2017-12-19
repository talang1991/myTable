import { IError } from '../interface/IError';
export class UserError implements IError {

    public name: string

    public message: string

    constructor(err: IError) {
        this.name = err.name;
        this.message = err.message;
    }
}