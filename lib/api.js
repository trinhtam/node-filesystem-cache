const Store = require('./store');

class NodeLocalCache {
    constructor(directory) {
        this._store = new Store(directory);
    }
    has = (key) => {
        const cache_value = this.get(key);
        return cache_value !== null;
    };
    get = (key, defaultValue=null) => {
        return this._store.getPayload(key) || defaultValue;
    };
    pull = (key, defaultValue=null) => {
        const cache_value = this.get(key, defaultValue);
        this.forget(key);
        return cache_value;
    };
    rememberAsync = async (key, seconds, callback) => {
        const value = this.get(key);
        if(value) {
            return value;
        }
        const callback_value = await callback();
        return this._store.put(key, callback_value, seconds);
    };
    remember = (key, seconds, callback) => {
        const value = this.get(key);
        if(value) {
            return value;
        }
        const callback_value = callback();
        return this._store.put(key, callback_value, seconds);
    };
    forever = (key, value) => {
        return this._store.put(key, value, 0);
    };
    add = (key, value, seconds) => {
        const cache_value = this.get(key);
        if(cache_value === null) {
            this._store.put(key, value, seconds);
            return true;
        }
        return false;
    };
    forget = (key) => {
        this._store.forget(key);
    };
    clear = () => {
        this._store.clear();
    };
}
module.exports = NodeLocalCache;
