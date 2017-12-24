import { Schema, model } from "mongoose";

export interface KeyTableValue {
    type: string
    isRequired: boolean
    defaultValue?: any
}

export interface KeyType {
    name: string
    keyType: 'str' | 'num' | 'obj' | 'bool' | 'date'
    isVisible?: boolean
    isRequired?: boolean
    defaultValue?: any
}

export interface KeyIndex {
    name: string
    index: 1 | -1
}

let KeySchema = new Schema({
    _id: String,
    tableName: String,
    keyArray: [{
        name: String,
        keyType: String,
        isVisible: { type: Boolean, default: true },
        isRequired: Boolean,
        defaultValue: {}
    }],
    keyIndexTable: {},
    keyTable: {}
});

KeySchema.index({ _id: 1 });

export let KeyModel = model('key', KeySchema);