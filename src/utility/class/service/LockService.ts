/**
 * 
 * 
 * @export
 * @class LockService
 */
const locks: { [name: string]: boolean } = {};

export class LockService {
    static initLock(name: string, callback: () => void): void {
        if (locks[name] === undefined) {
            locks[name] = false;
        }
        new Lock(name, callback);
    }

    static unlock(name: string): void {
        locks[name] = false;
    }
}

/**
 * 
 * 
 * @class Lock
 */
class Lock {
    private _name: string
    private _waitTimes: number

    constructor(name: string, callback: () => void) {
        this._name = name;
        this._callback = callback;
        this._waitTimes = 0;
        this._wait();
    }

    private _callback: () => void;

    private _lock(): void {
        locks[this._name] = true;
    }

    private _isLocked(): boolean {
        return locks[this._name];
    }

    private _wait(): void {
        if (this._isLocked()) {
            this._waitTimes++;
            setTimeout(() => {
                //console.log(`${this._name}_wait_${this._waitTimes}`)
                this._wait();
            }, 100);
        } else {
            this._lock();
            this._callback();
        }
    }
}
