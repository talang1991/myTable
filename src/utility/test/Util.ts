import { connect } from "mongoose";
import { WaitUntil } from "../class/Util";
import { setting } from '../config/setting';
import * as mongoose from "mongoose";
(<any>mongoose).Promise = global.Promise;

export class TestService {
    private _startTest: boolean
    constructor(test: () => void) {
        this._startTest = false;
        const wait = new WaitUntil(() => {
            return this._condition()
        }, () => {
            test();
        }, setting.testTimeOut);
        wait.wait();
    }

    private _condition(): boolean {
        try {
            connect("mongodb://localhost/table-tests", { useMongoClient: true });
            this._startTest = true;
        } catch (error) {/*
            console.log(error);*/
        }
        return this._startTest;
    }
}