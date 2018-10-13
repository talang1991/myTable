import { KeyValueTableService } from '../service/KeyValueTableService';
import { KeyList } from '../repository/KeyListRepository';
import { MemoryCacheService } from '../../../memoryCacheServices/service/MemoryCacheService';
import { expect } from "chai";
import { disconnect } from 'mongoose';
import { TestService } from '../../../../utility/test/Util';
import { fork } from 'child_process';
import { resolve } from 'path';

describe("键值对数据表服务类添加行方法测试", () => {
    let id;
    it("手动新建表后添加行，且通过getRow能得到相应行信息", (done) => {
        let test = function () {
            KeyValueTableService.createTable((err, tableId) => {
                id = tableId.toString();
                KeyValueTableService.addKey((err, tableId) => {
                    id = tableId.toString();
                    KeyValueTableService.addKey((err, tableId) => {
                        id = tableId.toString();
                        KeyValueTableService.addRow((err, row) => {
                            let rowC = row.getContent();
                            expect(rowC.ttt.getTime()).to.equal(new Date('2017-11-22').getTime());
                            expect(rowC.CCC).to.equal('ffff');
                            disconnect();
                            done()
                        }, tableId, { ttt: '2017-11-22' })
                    }, { name: 'CCC', keyType: 'str', defaultValue: 'ffff' }, id)
                }, { name: 'ttt', keyType: 'date', isRequired: true }, id)
            }, 'xxx')
        }
        new TestService(test, true);
    })
    it("添加过数据表后addRow，且通过getRow能得到相应行信息", (done) => {
        let test = function () {
            KeyValueTableService.addRow((err, row) => {
                let rowC = row.getContent();
                expect(rowC.ttt.getTime()).to.equal(new Date('2017-11-21').getTime());
                expect(rowC.CCC).to.equal('ffff');
                disconnect();
                done()
            }, id, { ttt: '2017-11-21' });
        }
        new TestService(test, true);
    })
    it("添加过数据表系统重启后addRow，且通过getRow能得到相应行信息", (done) => {
        let test = function () {
            let worker = fork(resolve(__dirname.replace('src', 'dist'), './worker/addRowWorkerTest.js'));
            worker.on('message', function (message) {//接收工作进程计算结果
                let date = new Date(message.row.ttt);
                expect(date.getTime()).to.equal(new Date('2017-11-21').getTime());
                expect(message.row.CCC).to.equal('ffff');
                worker.kill();
                disconnect();
                done()
            });
            worker.send({ id: id });
        }
        new TestService(test, true);
    })
})