import { Schema, model, Model, Document } from "mongoose";
import { KeyTableValue } from '../schema/KeySchema';
import { KeyList } from "../repository/KeyListRepository";
export class TableModelFactorty {
    static create(schemaName: string, keyTable: { [name: string]: KeyTableValue }, indexObj?: any): Model<Document> {
        let table: any = {};
        for (let key in keyTable) {
            if (keyTable.hasOwnProperty(key)) {
                let keyTableValue = keyTable[key],
                    type = keyTableValue.type,
                    defaultValue = keyTableValue.defaultValue;
                if (defaultValue !== undefined) {
                    table[key] = {
                        type: this.getSchemaType(type),
                        default: defaultValue
                    }
                } else {
                    table[key] = this.getSchemaType(type);
                }
            }
        }
        table._id = String;
        table.keyListId = String;
        let schema = new Schema(table);
        if (indexObj) {
            schema.index(indexObj);
        }
        return model(schemaName, schema);
    }

    static update(schema: Schema, keyList: KeyList, indexObj?: any): void {
        let keyArray = keyList.keyArray;
        schema.eachPath((path) => {
            if (path !== '_id' && path !== 'keyListId') {
                schema.remove(path);
            }
        });
        keyArray.forEach((key) => {
            let schemaObj = {};
            if (key.defaultValue) {
                schemaObj[key.name] = {
                    type: TableModelFactorty.getSchemaType(key.keyType),
                    default: key.defaultValue
                };
            } else {
                schemaObj[key.name] = TableModelFactorty.getSchemaType(key.keyType);
            }
            schema.add(schemaObj);
        });
    }

    static getSchemaType(type: string): String | Object | Date | Boolean | Number {
        switch (type) {
            case 'str':
                return String;
            case 'num':
                return Number;
            case 'bool':
                return Boolean;
            case 'date':
                return Date;
            case 'any':
                return Object;
        }
    }
}