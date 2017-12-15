import { isString, isNumber, isObject, isBoolean, isDate } from "util";

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

    static isValidType(type: string): boolean {
        if (['str', 'num', 'any', 'bool', 'date'].indexOf(type) !== -1) {
            return true;
        }
        return false;
    }

    static setValueForBool(target: any, key: string, value: string): void {
        if (value === 'true') {
            target[key] = true
        } else if (value === 'false') {
            target[key] = false;
        }
    }

    static setValueForObject(target: any, key: string, value: string): void {
        if (isString(value)) {
            target[key] = ParserString.object(value);
        }
    }


    //'str' | 'num' | 'any' | 'bool' | 'date'
    static validValue(type: string, target: any, key: string): boolean {
        let value = target[key];
        switch (type) {
            case 'str':
                return isString(value);
            case 'num':
                if (isString(value)) {
                    value = ParserString.number(value);
                    target[key] = value;
                }
                return isNumber(value);
            case 'obj':
                if (isString(value)) {
                    value = ParserString.object(value);
                    target[key] = value;
                }
                return isObject(value);
            case 'bool':
                if (isString(value)) {
                    value = ParserString.boolean(value);
                    target[key] = value;
                }
                return isBoolean(value);
            case 'date':
                if (isString(value)) {
                    value = ParserString.date(value);
                    target[key] = value;
                }
                return isDate(value);
            default:
                return false;
        }
    }

    static getDateString(date: Date): string {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
}

export class ParserString {
    static date(value: string): Date {
        return new Date(value);;
    }

    static boolean(value: string): boolean {
        return Boolean(value);
    }

    static number(value: string): number {
        return Number(value);
    }

    static object(value: string): any {
        value = JSON.parse(value);
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