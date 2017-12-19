import { KeyValueTableService } from '../service/KeyValueTableService';
import { KeyList } from '../repository/KeyListRepository';
import { MemoryCacheService } from '../../../memoryCacheServices/service/MemoryCacheService';
import { expect } from "chai";
import { disconnect } from 'mongoose';
import { TestService } from '../../../../utility/test/Util';
import { resolve } from 'path';
import { fork } from 'child_process';
import { setting } from '../../../../utility/config/setting';

describe("键值对数据表服务类更新表方法测试", () => {
    let id;
    it("手动新建表后添加行，且通过getRow能得到相应行信息", (done) => {
        let test = function () {
            KeyValueTableService.createTable((err, keyListId) => {
                id = keyListId;
                KeyValueTableService.addKey((err) => {
                    KeyValueTableService.addKey((err) => {
                        let keyList: KeyList = MemoryCacheService.getCache(setting.keyValueTableCache.keyList).getValue(keyListId);
                        let worker = fork(resolve(__dirname.replace('src', 'dist'), './worker/updateTableWorkerTest.js'));
                        worker.on('message', function (message) {//接收工作进程计算结果
                            let date = new Date(message.row.ddd);
                            expect(date.getTime()).to.equal(new Date('2017-11-21').getTime());
                            expect(message.row.vvv).to.equal('xxxxx');
                            worker.kill();
                            disconnect();
                            done()
                        });
                        worker.send({
                            tableName: keyList.tableName,
                            keyListId: keyListId
                        });
                    }, { name: 'vvv', keyType: 'str', defaultValue: 'xxxxx' }, keyListId)
                }, { name: 'ddd', keyType: 'date', isRequired: true }, keyListId)
            }, 'xxx')
        }
        new TestService(test, true);
    })
})