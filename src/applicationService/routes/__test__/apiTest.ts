import { expect } from "chai";
import { spawn, ChildProcess, fork } from "child_process";
import * as requestwebapi from "superagent";
import { AsyncTaskArray } from '../../../utility/class/flow/AsyncTaskArray';
import { WaitUntil } from "../../../utility/class/Util";

describe("数据表服务类api接口测试", () => {
    let child: ChildProcess,
        onListen: boolean = false;
    before(() => {
        child = fork('C:/Users/lichen/Documents/GitHub/myTable/dist/applicationService/bin/testweb')
        child.on('message', function (message) {//接收工作进程计算结果
            onListen = true
        });
    })
    it("createTable接口测试1", (done) => {
        const wait = new WaitUntil(() => {
            return onListen;
        }, () => {
            test();
        }, 500);
        wait.wait();
        let test = () => {
            requestwebapi
                .post('http://localhost:3000/api/createTable')
                .send({ 'name': '1ysddfx' })
                .end((err, res) => {
                    let tableId = res.body.tableId;
                    expect(res.body.status).to.equal(1);
                    requestwebapi
                        .post('http://localhost:3000/api/addKey')
                        .send({ 'name': '1ssxss', 'keyType': 'str', 'tableId': tableId })
                        .end((err, res) => {
                            expect(res.body.status).to.equal(1);
                            requestwebapi
                                .post('http://localhost:3000/api/addRow')
                                .send({ '1ssxss': 'sdafqwe', 'tableId': tableId })
                                .end((err, res) => {
                                    let rowId = res.body.rowId;
                                    expect(res.body.status).to.equal(1);
                                    requestwebapi
                                        .post('http://localhost:3000/api/getRow')
                                        .send({ 'rowId': rowId, 'tableId': tableId })
                                        .end((err, res) => {
                                            expect(res.body.row['1ssxss']).to.equal('sdafqwe');
                                            expect(res.body.status).to.equal(1);
                                            done();
                                        })
                                })
                        })
                })
        }
    })
    it("createTable接口测试2", (done) => {
        requestwebapi
            .post('http://localhost:3000/api/createTable')
            .send({ 'name': '1ysddfx' })
            .end((err, res) => {
                let tableId = res.body.tableId;
                expect(res.body.status).to.equal(1);
                requestwebapi
                    .post('http://localhost:3000/api/addKey')
                    .send({ 'name': '1ssxss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 111 }, 'isRequired': false })
                    .end((err, res) => {
                        expect(res.body.status).to.equal(1);
                        requestwebapi
                            .post('http://localhost:3000/api/addRow')
                            .send({ 'tableId': tableId })
                            .end((err, res) => {
                                let rowId = res.body.rowId;
                                expect(res.body.status).to.equal(1);
                                requestwebapi
                                    .post('http://localhost:3000/api/getRow')
                                    .send({ 'rowId': rowId, 'tableId': tableId })
                                    .end((err, res) => {
                                        expect(res.body.row['1ssxss'].sss).to.equal(111);
                                        expect(res.body.status).to.equal(1);
                                        done();
                                    })
                            })
                    })
            })
    })
    it("createTable接口测试3", (done) => {
        requestwebapi
            .post('http://localhost:3000/api/createTable')
            .send({ 'name': '1ysddfx' })
            .end((err, res) => {
                let tableId = res.body.tableId;
                expect(res.body.status).to.equal(1);
                const tasks = new AsyncTaskArray((err) => {
                    requestwebapi
                        .post('http://localhost:3000/api/addRow')
                        .send({ 'tableId': tableId })
                        .end((err, res) => {
                            let rowId = res.body.rowId;
                            expect(res.body.status).to.equal(1);
                            requestwebapi
                                .post('http://localhost:3000/api/getRow')
                                .send({ 'rowId': rowId, 'tableId': tableId })
                                .end((err, res) => {
                                    expect(res.body.row['1ssXss'].sss).to.equal(111);
                                    expect(res.body.row['2ssXss'].sss).to.equal(222);
                                    expect(res.body.row['3ssXss'].sss).to.equal(333);
                                    expect(res.body.status).to.equal(1);
                                    done();
                                })
                        })
                });
                tasks.addTask(() => {
                    requestwebapi
                        .post('http://localhost:3000/api/addKey')
                        .send({ 'name': '1ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 111 }, 'isRequired': false })
                        .end((err, res) => {
                            expect(res.body.status).to.equal(1);
                            tasks.ckeckTasks();
                        })
                })
                tasks.addTask(() => {
                    requestwebapi
                        .post('http://localhost:3000/api/addKey')
                        .send({ 'name': '2ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 222 }, 'isRequired': false })
                        .end((err, res) => {
                            expect(res.body.status).to.equal(1);
                            tasks.ckeckTasks();
                        })
                })
                tasks.addTask(() => {
                    requestwebapi
                        .post('http://localhost:3000/api/addKey')
                        .send({ 'name': '3ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 333 }, 'isRequired': false })
                        .end((err, res) => {
                            expect(res.body.status).to.equal(1);
                            tasks.ckeckTasks();
                        })
                })
            })
    })
    after(() => {
        child.kill();
    })
})