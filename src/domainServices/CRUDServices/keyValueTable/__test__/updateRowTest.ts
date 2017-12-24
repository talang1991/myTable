import { KeyValueTableService } from '../service/KeyValueTableService';
import { KeyList } from '../repository/KeyListRepository';
import { MemoryCacheService } from '../../../memoryCacheServices/service/MemoryCacheService';
import { expect } from "chai";
import { disconnect } from 'mongoose';
import { TestService } from '../../../../utility/test/Util';
import { SyncTaskArray } from '../../../../utility/class/flow/SyncTaskArray';
import { ITableRow } from '../../../../utility/interface/entity/ITableRow';

describe("键值对数据表服务类更新行方法测试", () => {
    it("手动新建表后更新行，且通过getRow能得到相应行信息", (done) => {
        let listId, rowId, row: ITableRow;
        let test = function () {
            const tasks = new SyncTaskArray({
                array: [
                    () => {
                        KeyValueTableService.createTable((err, tableId) => {
                            listId = tableId;
                            KeyValueTableService.addKey((err, tableId) => {
                                listId = tableId;
                                KeyValueTableService.addKey((err, tableId) => {
                                    listId = tableId;
                                    KeyValueTableService.addRow((err, row) => {
                                        if (row) {
                                            rowId = row.id;
                                        }
                                        tasks.next(err)
                                    }, tableId, { ttt: '2017-11-22' })
                                }, { name: 'CCC', keyType: 'str', defaultValue: 'ffff' }, tableId)
                            }, { name: 'ttt', keyType: 'date', isRequired: true }, tableId)
                        }, 'xxx')
                    },
                    () => {
                        KeyValueTableService.updateRow((err, tableRow) => {
                            row = tableRow;
                            tasks.next(err);
                        }, listId, rowId, { ttt: '2017-11-11', 'CCC': 'llll' });
                    },
                    () => {
                        let rowC = row.getContent();
                        expect(rowC.ttt.getTime()).to.equal(new Date('2017-11-11').getTime());
                        expect(rowC.CCC).to.equal('llll');
                        disconnect();
                        done()
                    }
                ], callback: (err) => {
                    console.log(err);
                    done
                }
            });
        }
        new TestService(test);
    })
})