import { expect } from "chai";
import { spawn, ChildProcess, fork } from "child_process";
import * as requestwebapi from "superagent";
import { AsyncTaskArray } from '../../../utility/class/flow/AsyncTaskArray';
import { WaitUntil } from "../../../utility/class/Util";
import { resolve } from "path";
import { SyncTaskArray } from "../../../utility/class/flow/SyncTaskArray";

describe("数据表服务类api接口测试", () => {
    let child: ChildProcess,
        onListen: boolean = false;
    before(() => {
        child = fork(resolve(__dirname, "../../../../dist/applicationService/bin/testweb"))
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
            let start = Date.now();
            let tasks = new AsyncTaskArray()
                .end(() => {
                    let end = Date.now();
                    console.log(end - start)
                    done()
                })
            for (let i = 0; i < 10; i++) {
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
                    expect(res.body.status).to.equal(1);
                    const tasks = new SyncTaskArray({
                        array: [
                            () => {
                                requestwebapi
                                    .post('http://localhost:3000/api/addKey')
                                    .send({ 'name': '3ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { ddd: 333 }, 'isRequired': false })
                                    .end((err, res) => {
                                        tableId = res.body.tableId;
                                        expect(res.body.status).to.equal(1);
                                        tasks.next();
                                    })
                            },
                            () => {
                                requestwebapi
                                    .post('http://localhost:3000/api/addRow')
                                    .send({ 'tableId': tableId, '3ssXss': { ddd: 12312 } })
                                    .end((err, res) => {
                                        let rowId = res.body.rowId;
                                        expect(res.body.status).to.equal(1);
                                        callback();
                                        requestwebapi
                                            .post('http://localhost:3000/api/updateRow')
                                            .send({ 'rowId': rowId, 'tableId': tableId, '3ssXss': { ccc: 'sdasd' } })
                                            .end((err, res) => {
                                                expect(res.body.status).to.equal(1);
                                                requestwebapi
                                                    .post('http://localhost:3000/api/getRow')
                                                    .send({ 'rowId': rowId, 'tableId': tableId })
                                                    .end((err, res) => {
                                                        expect(res.body.row['3ssXss'].ddd).to.equal(12312);
                                                        expect(res.body.row['3ssXss'].ccc).to.equal('sdasd');
                                                        expect(res.body.status).to.equal(1);
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
                        tableId = res.body.tableId;
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
                const tasks = new SyncTaskArray({
                    array: [() => {
                        requestwebapi
                            .post('http://localhost:3000/api/addKey')
                            .send({ 'name': '1ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 111 }, 'isRequired': false })
                            .end((err, res) => {
                                tableId = res.body.tableId;
                                expect(res.body.status).to.equal(1);
                                tasks.next();
                            })
                    },
                    () => {
                        requestwebapi
                            .post('http://localhost:3000/api/addKey')
                            .send({ 'name': '2ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 222 }, 'isRequired': false })
                            .end((err, res) => {
                                tableId = res.body.tableId;
                                expect(res.body.status).to.equal(1);
                                tasks.next();
                            })
                    },
                    () => {
                        requestwebapi
                            .post('http://localhost:3000/api/addKey')
                            .send({ 'name': '3ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 333 }, 'isRequired': false })
                            .end((err, res) => {
                                tableId = res.body.tableId;
                                expect(res.body.status).to.equal(1);
                                tasks.next();
                            })
                    },
                    () => {
                        requestwebapi
                            .post('http://localhost:3000/api/addRow')
                            .send({ 'tableId': tableId, '3ssXss': { ddd: 12312 } })
                            .end((err, res) => {
                                let rowId = res.body.rowId;
                                expect(res.body.status).to.equal(1);
                                requestwebapi
                                    .post('http://localhost:3000/api/getRow')
                                    .send({ 'rowId': rowId, 'tableId': tableId })
                                    .end((err, res) => {
                                        expect(res.body.row['1ssXss'].sss).to.equal(111);
                                        expect(res.body.row['2ssXss'].sss).to.equal(222);
                                        expect(res.body.row['3ssXss'].ddd).to.equal(12312);
                                        expect(res.body.status).to.equal(1);
                                        done();
                                    })
                            })
                    }],
                    callback: done
                });
            })
    })
    it("createTable接口测试4", (done) => {
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
                        tableId = res.body.tableId;
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

    })
    it("createTable接口测试5", (done) => {
        requestwebapi
            .post('http://localhost:3000/api/addKey')
            .send({ 'name': '1ssxss', 'keyType': 'str', 'tableId': '5bc1af1491d40726d8011111' })
            .end((err, res) => {
                expect(res.body.error.name).to.equal('未找到相应ID实体');
                expect(res.body.error.message).to.equal('请确认相应实体ID');
                done();
            })
    })
    it("createTable接口测试6", (done) => {
        let tableId: string;
        let test = () => {
            let tasks = new AsyncTaskArray()
                .end(() => {
                    done()
                })
            for (let i = 0; i < 100; i++) {
                tasks.add(() => {
                    testFunc(() => tasks.ckeck());
                })
            }
        }
        let beforeTest = (callback: () => void) => {
            requestwebapi
                .post('http://localhost:3000/api/createTable')
                .send({ 'name': '1ysddfx' })
                .end((err, res) => {
                    tableId = res.body.tableId;
                    expect(res.body.status).to.equal(1);
                    let tasks = new SyncTaskArray({
                        array: [() => {
                            requestwebapi
                                .post('http://localhost:3000/api/addKey')
                                .send({ 'name': '1ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 111 }, 'isRequired': false })
                                .end((err, res) => {
                                    tableId = res.body.tableId;
                                    expect(res.body.status).to.equal(1);
                                    tasks.next();
                                })
                        }, () => {
                            requestwebapi
                                .post('http://localhost:3000/api/addKey')
                                .send({ 'name': '2ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 222 }, 'isRequired': false })
                                .end((err, res) => {
                                    tableId = res.body.tableId;
                                    expect(res.body.status).to.equal(1);
                                    tasks.next();
                                })
                        },
                        () => {
                            requestwebapi
                                .post('http://localhost:3000/api/addKey')
                                .send({ 'name': '3ssXss', 'keyType': 'any', 'tableId': tableId, 'defaultValue': { sss: 333 }, 'isRequired': false })
                                .end((err, res) => {
                                    tableId = res.body.tableId;
                                    expect(res.body.status).to.equal(1);
                                    tasks.next();
                                })
                        },
                        () => {
                            callback()
                        }],
                        callback: callback
                    })
                })
        }
        let testFunc = (callback: () => void) => {
            requestwebapi
                .post('http://localhost:3000/api/addRow')
                .send({ 'tableId': tableId, '3ssXss': { ddd: 12312 } })
                .end((err, res) => {
                    let rowId = res.body.rowId;
                    expect(res.body.status).to.equal(1);
                    requestwebapi
                        .post('http://localhost:3000/api/updateRow')
                        .send({ 'rowId': rowId, 'tableId': tableId, '3ssXss': { ccc: 'sdasd' }, '1ssXss': { sss: 'qwe' } })
                        .end((err, res) => {
                            expect(res.body.status).to.equal(1);
                            requestwebapi
                                .post('http://localhost:3000/api/getRow')
                                .send({ 'rowId': rowId, 'tableId': tableId })
                                .end((err, res) => {
                                    expect(res.body.row['1ssXss'].sss).to.equal('qwe');
                                    expect(res.body.row['2ssXss'].sss).to.equal(222);
                                    expect(res.body.row['3ssXss'].ddd).to.equal(12312);
                                    expect(res.body.row['3ssXss'].ccc).to.equal('sdasd');
                                    expect(res.body.status).to.equal(1);
                                    callback();
                                })
                        })
                })
        }
        beforeTest(test);
    })
    it("createTable接口测试7", (done) => {
        let beforeTest = (callback: (rowId: string, tableId: string) => void) =>
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
                            tableId = res.body.tableId;
                            expect(res.body.status).to.equal(1);
                            requestwebapi
                                .post('http://localhost:3000/api/addRow')
                                .send({ 'tableId': tableId })
                                .end((err, res) => {
                                    let rowId = res.body.rowId;
                                    expect(res.body.status).to.equal(1);
                                    callback(rowId, tableId)
                                })
                        })

                })
        const testFunc = (rowId, tableId, callback: () => void) => {
            requestwebapi
                .post('http://localhost:3000/api/getRow')
                .send({ 'rowId': rowId, 'tableId': tableId })
                .end((err, res) => {
                    expect(res.body.row['1ssxss'].sss).to.equal(111);
                    expect(res.body.status).to.equal(1);
                    callback()
                })
        }
        let test = (rowId, tableId) => {
            let start = Date.now()
            let tasks = new AsyncTaskArray()
                .end(() => {
                    let end = Date.now()
                    console.log(end - start)
                    done()
                })
            for (let i = 0; i < 200; i++) {
                tasks.add(() => {
                    testFunc(rowId, tableId, () => tasks.ckeck());
                })
            }
        }
        beforeTest(test);
    })
    after(() => {
        child.kill();
    })
})