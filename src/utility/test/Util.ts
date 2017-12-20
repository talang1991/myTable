import { connect } from "mongoose";
import { WaitUntil } from "../class/Util";
import { setting } from '../config/setting';
import * as mongoose from "mongoose";
(<any>mongoose).Promise = global.Promise;

export class TestService {
    static dbNum: number = 0
    private _isDefaultDB: boolean
    private _startTest: boolean
    constructor(test: () => void, isDefaultDB: boolean = false) {
        this._startTest = false;
        this._isDefaultDB = isDefaultDB;
        const wait = new WaitUntil(() => {
            return this._condition()
        }, () => {
            test();
        }, setting.testTimeOut);
        wait.wait();
    }

    private _condition(dbNum: any = ''): boolean {
        try {
            connect(`mongodb://localhost/${setting.testDBName}${dbNum}`, { useMongoClient: true });
            this._startTest = true;
        } catch (error) {
            if (this._isDefaultDB === false) {
                this._condition(TestService.dbNum++);
            }
            console.log(error);
        }
        return this._startTest;
    }
}