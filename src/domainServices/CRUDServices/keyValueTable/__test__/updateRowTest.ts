import { KeyValueTableService } from '../service/KeyValueTableService';
import { KeyList } from '../repository/KeyListRepository';
import { MemoryCacheService } from '../../../memoryCacheServices/service/MemoryCacheService';
import { expect } from "chai";
import { disconnect } from 'mongoose';
import { TestService } from '../../../../utility/test/Util';
import { fork } from 'child_process';
import { SyncTaskArray } from '../../../../utility/class/flow/SyncTaskArray';
import { TableRow } from '../repository/TableRowRepository';

describe("键值对数据表服务类更新行方法测试", () => {
    it("手动新建表后更新行，且通过getRow能得到相应行信息", (done) => {
        let listId, rowId, row: TableRow;
        let test = function () {
            const tasks = new SyncTaskArray({
                array: [
                    () => {
                        KeyValueTableService.createTable((err, keyListId) => {
                            listId = keyListId;
                            KeyValueTableService.addKey((err) => {
                                KeyValueTableService.addKey((err) => {
                                    KeyValueTableService.addRow((err, row) => {
                                        if (row) {
                                            rowId = row.id;
                                        }
                                        tasks.next(err)
                                    }, keyListId, { ttt: '2017-11-22' })
                                }, { name: 'CCC', keyType: 'str', defaultValue: 'ffff' }, keyListId)
                            }, { name: 'ttt', keyType: 'date', isRequired: true }, keyListId)
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