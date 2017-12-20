import { Schema, model } from "mongoose";

let ValueTableSchema = new Schema({
    _id: String,
    keyListId: String,
    tableName: String,
    tableRow: {}
});

ValueTableSchema.index({ _id: 1 });

export let ValueTable = model('TableTalbe', ValueTableSchema);