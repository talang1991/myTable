import { MemoryCache } from "../repository/MemoryCacheRepository";
const _cacheTable: any = {}
export class MemoryCacheService {

    static _createCache(name: string): void {
        _cacheTable[name] = new MemoryCache();
    }

    static getCache(name: string): MemoryCache {
        if (_cacheTable[name] === undefined) {
            this._createCache(name);
        }
        return _cacheTable[name];
    }

    static clearCache(name: string): void {
        delete _cacheTable[name];
    }
}