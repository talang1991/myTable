import { KeyValueTableService } from '../service/KeyValueTableService';
import { KeyList } from '../repository/KeyListRepository';
import { MemoryCacheService } from '../../../memoryCacheServices/service/MemoryCacheService';
import { expect } from "chai";
import { disconnect } from 'mongoose';
import { TestService } from '../../../../utility/test/Util';
describe("键值对数据表服务类删除字段方法测试", () => {
    let id;
    it("手动新建带字段表后删除某字段，addRow后能通过getRow能得到相应行信息", (done) => {
        let test = function () {
            KeyValueTableService.createTable((err, tableId) => {
                id = tableId;
                KeyValueTableService.addKey((err, tableId) => {
                    id = tableId;
                    KeyValueTableService.addKey((err, tableId) => {
                        id = tableId;
                        KeyValueTableService.removeKey((err) => {
                            KeyValueTableService.addRow((err, row) => {
                                let rowC = row.getContent();
                                expect(rowC.ttt.getTime()).to.equal(new Date('2017-11-22').getTime());
                                expect(rowC.CCC).to.equal(undefined);
                                disconnect();
                                done()
                            }, tableId, { ttt: '2017-11-22' })
                        }, 'CCC', tableId)
                    }, { name: 'CCC', keyType: 'str', defaultValue: 'ffff' }, tableId)
                }, { name: 'ttt', keyType: 'date', isRequired: true }, tableId)
            }, 'xxx')
        }
        new TestService(test, true);
    })
    it("删除过数据表字段后addRow，且通过getRow能得到相应行信息", (done) => {
        let test = function () {
            KeyValueTableService.addRow((err, row) => {
                let rowC = row.getContent();
                expect(rowC.ttt.getTime()).to.equal(new Date('2017-11-21').getTime());
                expect(rowC.CCC).to.equal(undefined);
                disconnect();
                done()
            }, id, { ttt: '2017-11-21' });
        }
        new TestService(test, true);
    })
})