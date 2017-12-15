import { Router } from "express";
import { SyncTaskArray } from '../../utility/class/flow/SyncTaskArray';
import { KeyValueTableService } from '../../domainServices/CRUDServices/keyValueTable/service/KeyValueTableService';
import { KeyType } from "../../domainServices/CRUDServices/keyValueTable/schema/KeySchema";
import { Util } from "../../utility/class/Util";
import { TableRow } from '../../domainServices/CRUDServices/keyValueTable/repository/TableRowRepository';

export const api = Router();

api.post('/createTable', (req, res) => {
    let tableId;
    const tasks = new SyncTaskArray({
        array: [
            () => {
                KeyValueTableService.createTable((err, tid) => {
                    tableId = tid;
                    tasks.next(err);
                }, req.body.name);
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
                if (name && keyType && tableId && Util.isValidType(keyType)) {
                    key = {
                        name: name,
                        keyType: keyType
                    };
                    key.isVisible = req.body.isVisible ? req.body.isVisible : undefined
                    key.isRequired = req.body.isRequired ? req.body.isRequired : undefined
                    key.defaultValue = req.body.defaultValue ? req.body.defaultValue : undefined
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
            res.json({ error: err })
        }
    });
});

api.get('/getRow', (req, res) => {
    let tableId: string,
        row: TableRow,
        rowId: string;
    const tasks = new SyncTaskArray({
        array: [
            () => {
                tableId = req.body.tableId,
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
                    row: row,
                    status: 1
                })
            }
        ],
        callback: (err) => {
            res.json({ error: err })
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