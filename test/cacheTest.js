const fs = require('fs');
const assert = require('assert');
const http = require('http');
const request = require('supertest');
const CacheApi = require('..');
const cachePath = __dirname + '/cache';

if(!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, {
        mode: 0o777,
    });
}

const Cache = new CacheApi(cachePath);

const seconds = 20000;
const userObject = {
    id: 1,
    name: 'tamtrinh',
    email: 'tam.maris94@gmail.com',
    phone: '0342.831.832',
};
const userCallbackObject = {
    id: 2,
    name: 'tamtrinh_callback',
    email: 'tam.maris94@gmail.com',
    phone: '0342.831.832',
};

serverApi = () => {
    const server = http.createServer(function (req, res) {
        res.end(JSON.stringify(userCallbackObject))
    });
    return request(server).get('/').set('Accept', 'application/json');
};

describe('Cache', function () {
    it('Store If Not Present', function () {
        const value = Cache.add('test_cache', userObject, seconds);
        assert.strictEqual(value, true);
        const value_exists = Cache.add('test_cache', userObject, seconds);
        assert.strictEqual(value_exists, false);
    });
    it('Checking For Item Existence', function () {
        assert.strictEqual(Cache.has('test_cache'), true);
        assert.strictEqual(Cache.has('test_cache_add_not'), false);
    });
    it('Retrieve & Store', function () {
        assert.deepStrictEqual(Cache.get('test_cache'), userObject);
    });
    it('Removing Items From The Cache', function () {
        Cache.forget('test_cache');
        assert.strictEqual(Cache.has('test_cache'), false);
    });
    it('Storing Items Forever', function () {
        const value = Cache.forever('test_cache', userObject);
        assert.deepStrictEqual(value, userObject);
    });
    it('Retrieve & Delete', function () {
        const value = Cache.pull('test_cache');
        assert.deepStrictEqual(value, userObject);
        assert.strictEqual(Cache.has('test_cache'), false);
    });

    it('Store Synchronous', async function () {
        Cache.clear();
        assert.strictEqual(Cache.has('test_cache_callback'), false);

        const value = Cache.remember('test_cache_callback', seconds, () => {
            return userCallbackObject
        });

        assert.deepStrictEqual(value, userCallbackObject);
        assert.strictEqual(Cache.has('test_cache_callback'), true);
        assert.deepStrictEqual(Cache.get('test_cache_callback'), userCallbackObject);
    });

    it('Store Asynchronous', async () => {
        Cache.clear();
        assert.strictEqual(Cache.has('test_cache_callback'), false);

        const value = await Cache.rememberAsync('test_cache_callback', seconds, async () => {
            const response = await serverApi();
            return JSON.parse(response.text);
        });

        assert.deepStrictEqual(value, userCallbackObject);
        assert.strictEqual(Cache.has('test_cache_callback'), true);
        assert.deepStrictEqual(Cache.get('test_cache_callback'), userCallbackObject);
    });

});

describe('Remove', function () {
    it('Removing All Items From The Cache', function () {
        Cache.clear();
        assert.strictEqual(Cache.has('test_cache'), false);
        assert.strictEqual(Cache.has('test_cache_callback'), false);
    });
});