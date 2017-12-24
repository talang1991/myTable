import { KeyValueTableService } from '../service/KeyValueTableService';
import { KeyList } from '../repository/KeyListRepository';
import { MemoryCacheService } from '../../../memoryCacheServices/service/MemoryCacheService';
import { expect } from "chai";
import { disconnect } from 'mongoose';
import { TestService } from '../../../../utility/test/Util';
import { resolve } from 'path';
import { setting } from '../../../../utility/config/setting';

describe("键值对数据表服务类添加表键方法测试", () => {
    let id;
    it("手动新建表后添加键错误键，得到相应错误", (done) => {
        let test = function () {
            KeyValueTableService.createTable((err, tableId) => {
                id = tableId;
                KeyValueTableService.addKey((err, tableId) => {
                    id = tableId;
                    KeyValueTableService.addKey((err) => {
                        id = tableId;
                        expect(err.name).to.equal('KeyListRepository->addKey错误');
                        expect(err.message).to.equal('key.defaultValue(str):12,key.isVisible:undefined,key.isRequired:undefined.');
                        disconnect();
                        done()
                    }, { name: 'vvv', keyType: 'str', defaultValue: 12 }, tableId)
                }, { name: 'ddd', keyType: 'date', isRequired: true }, tableId)
            }, 'xxx')
        }
        new TestService(test);
    })
})