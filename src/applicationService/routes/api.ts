import { Router } from "express";
import { SyncTaskArray } from '../../utility/class/flow/SyncTaskArray';
import { KeyValueTableService } from '../../domainServices/CRUDServices/keyValueTable/service/KeyValueTableService';
import { KeyType } from "../../domainServices/CRUDServices/keyValueTable/schema/KeySchema";
import { Util } from '../../utility/class/Util';
import { TableRow } from '../../domainServices/CRUDServices/keyValueTable/repository/TableRowRepository';

export const api = Router();

api.post('/createTable', (req, res) => {
    let tableId: string,
        name: string;
    const tasks = new SyncTaskArray({
        array: [
            () => {
                name = req.body.name;
                if (name && /\w+/i.exec(name)[0] === name) {
                    tasks.next();
                } else {
                    tasks.next({
                        name: 'createTable请求缺少参数,或参数不合法',
                        message: `name:${name}`
                    })
                }
            },
            () => {
                KeyValueTableService.createTable((err, tid) => {
                    tableId = tid;
                    tasks.next(err);
                }, name);
            },
            () => {
                res.json({
                    tableId: tableId,
                    status: 1
                })
            }
        ],
        callback: (err) => {
            res.json({
                error: err,
                status: 0
            })
        }
    });
});

api.post('/addKey', (req, res) => {
    let key: KeyType, tableId: string
    const tasks = new SyncTaskArray({
        array: [
            () => {
                let name = req.body.name,
                    keyType = req.body.keyType;
                tableId = req.body.tableId;
                if (name && /\w+/i.exec(name)[0] === name && keyType && tableId && Util.isValidType(keyType)) {
                    key = {
                        name: name,
                        keyType: keyType
                    };
                    Util.setPossibleValueFormBody(key, 'isVisible', req.body);
                    Util.setPossibleValueFormBody(key, 'isRequired', req.body);
                    Util.setPossibleValueFormBody(key, 'defaultValue', req.body);
                    tasks.next();
                } else {
                    tasks.next({
                        name: 'addKey请求缺少参数',
                        message: `name:${name},keyType:${keyType},tableId:${tableId}`
                    })
                }
            },
            () => {
                KeyValueTableService.addKey((err) => {
                    tasks.next(err);
                }, key, tableId)
            },
            () => {
                res.json({
                    status: 1
                })
            }
        ],
        callback: (err) => {
            res.json({
                error: err,
                status: 0
            })
        }
    });
});

api.post('/addRow', (req, res) => {
    let content = {},
        tableId: string,
        row: TableRow;
    const tasks = new SyncTaskArray({
        array: [
            () => {
                tableId = req.body.tableId;
                if (tableId) {
                    let body = req.body;
                    for (const key in body) {
                        if (body.hasOwnProperty(key)) {
                            const value = body[key];
                            content[key] = value;
                        }
                    }
                    tasks.next();
                } else {
                    tasks.next({
                        name: 'addRow请求缺少参数',
                        message: `tableId:${tableId}`
                    })
                }
            },
            () => {
                KeyValueTableService.addRow((err, tableRow) => {
                    row = tableRow;
                    tasks.next(err);
                }, tableId, content)
            },
            () => {
                res.json({
                    rowId: row.id,
                    status: 1
                })
            }
        ],
        callback: (err) => {
            res.json({
                error: err,
                status: 0
            })
        }
    });
});

api.post('/getRow', (req, res) => {
    let tableId: string,
        row: TableRow,
        rowId: string;
    const tasks = new SyncTaskArray({
        array: [
            () => {
                tableId = req.body.tableId;
                rowId = req.body.rowId;
                if (tableId && rowId) {
                    tasks.next();
                } else {
                    tasks.next({
                        name: 'addRow请求缺少参数',
                        message: `tableId:${tableId},rowId:${rowId}`
                    })
                }
            },
            () => {
                KeyValueTableService.getRow((err, tableRow) => {
                    row = tableRow;
                    tasks.next(err);
                }, tableId, rowId)
            },
            () => {
                res.json({
                    row: row.getContent(),
                    status: 1
                })
            }
        ],
        callback: (err) => {
            res.json({
                error: err,
                status: 0
            })
        }
    });
});

/* api.get('/addKey', (req, res) => {
    const tasks = new SyncTaskArray({
        array: [
            () => {
            },
            () => {
            }
        ],
        callback: (err) => {
            res.json({ error: err })
        }
    });
}); */