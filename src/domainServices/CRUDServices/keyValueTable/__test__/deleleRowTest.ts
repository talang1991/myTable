import { KeyValueTableService } from '../service/KeyValueTableService';
import { KeyList } from '../repository/KeyListRepository';
import { MemoryCacheService } from '../../../memoryCacheServices/service/MemoryCacheService';
import { expect } from "chai";
import { disconnect } from 'mongoose';
import { TestService } from '../../../../utility/test/Util';
import { setting } from '../../../../utility/config/setting';
import { SyncTaskArray } from '../../../../utility/class/flow/SyncTaskArray';
import { ITableRow } from '../../../../utility/interface/entity/ITableRow';

describe("键值对数据表服务类删除行方法测试", () => {
    it("手动新建表后添加行又删除行，则通过getRow不能得到相应行信息", (done) => {
        let listId, rowId, row: ITableRow;
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
                        KeyValueTableService.deleteRow((err, tableRow) => {
                            tasks.next(err);
                        }, listId, rowId);
                    },
                    () => {
                        KeyValueTableService.getRow((err, row) => {
                            expect(err.name).to.equal('未找到相应ID实体');
                            expect(err.message).to.equal('请确认相应实体ID');
                            disconnect();
                            done()
                        }, listId, rowId)
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