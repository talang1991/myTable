import { connect } from "mongoose";
import { KeyValueTableService } from '../../service/KeyValueTableService';
import { MemoryCacheService } from '../../../../memoryCacheServices/service/MemoryCacheService';
import { setting } from '../../../../../utility/config/setting';
import { KeyList } from "../../repository/KeyListRepository";
import * as mongoose from "mongoose";
(<any>mongoose).Promise = global.Promise;

process.on('message', function (m) { //接收主进程发送过来的消息
    connect('mongodb://localhost/table-tests', { useMongoClient: true }).then(() => {
        KeyValueTableService.updateTable((err) => {
            let keylist: KeyList = MemoryCacheService.getCache(setting.keyValueTableCache.keyList).getValue(m.keyListId);
            KeyValueTableService.addRow((err, row) => {
                let rowC;
                if (row) {
                    rowC = row.getContent();
                }
                process.send({
                    err: err,
                    row: rowC
                });
            }, keylist.id, { ddd: '2017-11-21' })
        }, m.tableName, m.keyListId)
    });
});

process.on('SIGHUP', function () {
    process.exit(); //收到kill信息，进程退出
});