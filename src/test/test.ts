import { fork } from 'child_process';
import { resolve } from "path";

/* KeyValueTableService.createKeyList((err, keyListId) => {
    let keyList: KeyList = MemoryCacheService
        .getCache('keyValueTable_keyLists')
        .getValue(keyListId);
    KeyValueTableService.createTable((err) => {
        KeyValueTableService.addKey((err) => {
            KeyValueTableService.addKey((err) => {
                KeyValueTableService.addRow((err, row) => {
                    let rowC = row.getRow();
                    console.log(rowC)
                }, keyListId, 'xxx', { ttt: '2017-11-22' })
            }, { name: 'CCC', keyType: 'str', defaultValue: 'ffff' }, keyListId)
        }, { name: 'ttt', keyType: 'date', isRequired: true }, keyListId)
    }, 'xxx', keyListId)
}); */
/* KeyValueTableService.addRow((err, row) => {
    let rowC = row.getRow();
    console.log(rowC);
}, 'm7RB6MQXg3U/NSipT1pWNQ==', { ttt: '2017-11-22' }); */
let worker = fork(resolve(__dirname, './addRowWorker.js'));
worker.on('message', function (message) {//接收工作进程计算结果
    console.log(message);
    worker.kill();
});
worker.send({ id: 'SIsV4dRZNX3d2sj3GVa1Mw==' });