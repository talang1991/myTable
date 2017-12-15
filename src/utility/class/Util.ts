export class Util {
    static arrayHasOne<T>(arr: T[], valid: (item: T) => boolean): boolean {
        let items = arr.filter((item) => {
            return valid(item);
        });
        return items.length > 0 ? true : false
    }

    static indexInArray(arr: any[], index: number) {
        return arr.length > index && index > 0 ? true : false;
    }
    static validValue(type: string, value: any): boolean {//'str' | 'num' | 'any' | 'bool' | 'date'
        switch (type) {
            case 'str':
                return typeof value === 'string';
            case 'num':
                return typeof value === 'number';
            case 'obj':
                return typeof value === "object";
            case 'bool':
                return typeof value === 'boolean';
            case 'date':
                return value instanceof Date && isFinite(value.getTime());
            default:
                return;
        }
    }
}


export class WaitUntil {
    private _condition: () => boolean;
    private _callback: () => void;
    private _timeout: number;
    private _handle: NodeJS.Timer;

    constructor(condition: () => boolean, callback: () => void, timeout = 1000) {
        this._condition = condition;
        this._callback = callback;
        this._timeout = timeout;
    }

    wait(this: WaitUntil) {
        clearTimeout(this._handle);
        this._handle = setTimeout(() => {
            if (this._condition()) {
                this._callback();
            } else {
                clearTimeout(this._handle);
                this.wait();
            }
        }, this._timeout);
    }

}