import { expect } from "chai";
import { spawn, ChildProcess, fork } from "child_process";
import * as requestwebapi from "superagent";
import { AsyncTaskArray } from "../utility/class/flow/AsyncTaskArray";
import { WaitUntil } from "../utility/class/Util";

let child: ChildProcess,
    onListen: boolean = false;
child = fork('C:/Users/lichen/Documents/GitHub/myTable/dist/applicationService/bin/testweb', [], { execArgv: ['--inspect=15777'] })
child.on('message', function (message) {//接收工作进程计算结果
    onListen = true
});
const test = () =>
    requestwebapi
        .post('http://localhost:3000/api/createTable')
        .send({ 'name': '1ysddfx' })
        .end((err, res) => {
            let tableId = res.body.tableId;
            expect(res.body.status).to.equal(1);
            const tasks = new AsyncTaskArray()
                .add(() => {
                    requestwebapi
                        .post('http://localhost:3000/api/addKey')
                        .send({ 'name': '1ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 111 }, 'isRequired': false })
                        .end((err, res) => {
                            tasks.ckeck();
                        })
                })
                .add(() => {
                    requestwebapi
                        .post('http://localhost:3000/api/addKey')
                        .send({ 'name': '2ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 222 }, 'isRequired': false })
                        .end((err, res) => {
                            tasks.ckeck();
                        })
                })
                .add(() => {
                    requestwebapi
                        .post('http://localhost:3000/api/addKey')
                        .send({ 'name': '3ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 333 }, 'isRequired': false })
                        .end((err, res) => {
                            tasks.ckeck();
                        })
                })
                .end((err) => {
                    requestwebapi
                        .post('http://localhost:3000/api/addRow')
                        .send({ 'tableId': tableId, '3ssXss': { ddd: 12312 } })
                        .end((err, res) => {
                            let rowId = res.body.rowId;
                            requestwebapi
                                .post('http://localhost:3000/api/getRow')
                                .send({ 'rowId': rowId, 'tableId': tableId })
                                .end((err, res) => {

                                })
                        })
                })
        })

const wait = new WaitUntil(() => {
    return onListen;
}, () => {
    test();
}, 500);
wait.wait()