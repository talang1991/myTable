import { AsyncTaskArray } from '../utility/class/flow/AsyncTaskArray';
import * as requestwebapi from "superagent";
import { SyncTaskArray } from '../utility/class/flow/SyncTaskArray';
let test = () => {
    let start = Date.now();
    let tasks = new AsyncTaskArray()
        .end(() => {
            let end = Date.now();
            console.log(end - start)
        })
    for (let i = 0; i < 100; i++) {
        tasks.add(() => {
            testFunc(() => tasks.ckeck());
        })
    }
}
let testFunc = (callback: () => void) => {
    let tableId: string;
    requestwebapi
        .post('http://localhost:3000/api/createTable')
        .send({ 'name': '1ysddfx' })
        .end((err, res) => {
            tableId = res.body.tableId;
            const tasks = new SyncTaskArray({
                array: [
                    () => {
                        requestwebapi
                            .post('http://localhost:3000/api/addKey')
                            .send({ 'name': '3ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { ddd: 333 }, 'isRequired': false })
                            .end((err, res) => {
                                tableId = res.body.tableId;
                                tasks.next();
                            })
                    },
                    () => {
                        requestwebapi
                            .post('http://localhost:3000/api/addRow')
                            .send({ 'tableId': tableId, '3ssXss': { ddd: 12312 } })
                            .end((err, res) => {
                                let rowId = res.body.rowId;
                                callback();
                                requestwebapi
                                    .post('http://localhost:3000/api/updateRow')
                                    .send({ 'rowId': rowId, 'tableId': tableId, '3ssXss': { ccc: 'sdasd' } })
                                    .end((err, res) => {
                                        requestwebapi
                                            .post('http://localhost:3000/api/getRow')
                                            .send({ 'rowId': rowId, 'tableId': tableId })
                                            .end((err, res) => {
                                                callback();
                                            })
                                    })
                            })
                    }
                ],
                callback: callback
            })

        })
}
test();