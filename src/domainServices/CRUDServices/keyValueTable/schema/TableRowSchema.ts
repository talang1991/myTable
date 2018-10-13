import { Schema, model } from "mongoose";

let ValueTableSchema = new Schema({
    // _id: String,
    keyListId: String,
    tabelName: String,
    tableRow: {}
});

ValueTableSchema.index({/*  _id: 1, */ keyListId: 1, tabelName: 1 });

export let TableRowModel = model('tableRow', ValueTableSchema);