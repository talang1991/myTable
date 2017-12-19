/**
 * 
 * 
 * @export
 * @class LockService
 */
export class LockService {
    static locks: { [name: string]: boolean } = {};
    static initLock(name: string, callback: () => void): void {
        if (LockService.locks[name] === undefined) {
            LockService.locks[name] = false;
        }
        new Lock(name, callback);
    }

    static unlock(name: string): void {
        LockService.locks[name] = false;
    }
}

/**
 * 
 * 
 * @class Lock
 */
class Lock {
    private _modelName: string;

    constructor(name: string, callback: () => void) {
        this._modelName = name;
        this._callback = callback;
        this._wait();
    }

    private _callback: () => void;

    private _lock(): void {
        LockService.locks[this._modelName] = true;
    }

    private _isLocked(): boolean {
        return LockService.locks[this._modelName];
    }

    private _wait(): void {
        if (this._isLocked()) {
            setTimeout(() => {
                this._wait();
            }, 100);
        } else {
            this._lock();
            this._callback();
        }
    }
}
