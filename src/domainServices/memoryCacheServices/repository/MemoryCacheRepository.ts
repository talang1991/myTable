export class MemoryCache {
    private _table: any = {}

    setValue(key: string, value: any) {
        this._table[key] = value;
    }

    getValue(key: string) {
        return this._table[key];
    }
}