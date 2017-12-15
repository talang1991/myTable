import { connect } from "mongoose";
import { KeyValueTableService } from '../domainServices/CRUDServices/keyValueTable/service/KeyValueTableService';

process.on('message', function (m) { //接收主进程发送过来的消息
    connect('mongodb://localhost/table-tests').then(() => {
        KeyValueTableService.addRow((err, row) => {
            let rowC;
            if (row) {
                rowC = row.getContent();
            }
            process.send({
                row: rowC
            });
        }, m.id, { ttt: '2017-11-21' });
    });
});

process.on('SIGHUP', function () {
    process.exit(); //收到kill信息，进程退出
});