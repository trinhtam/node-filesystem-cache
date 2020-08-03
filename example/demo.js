const cache = require('./config_cache');

const seconds = 60000; // 60seconds

// Cache class
class classObjectTest {
    _id = 0;
    _name = null;
    constructor(id, name) {
        this._id = id;
        this._name = name;
    }

    getId() {
        return this._id;
    }

    getName() {
        return this._name;
    }
}


const id = 0;
const name = 'tamtrinh';
const object = new classObjectTest(id, name);
cache.put('key', object, seconds);
console.log(cache.get('key').getName());

// Cache string
cache.put('key', 'value', seconds);

// Cache int
cache.put('key', 1234, seconds);

// Cache object
cache.put('key', {
    id: 1,
    name: 'User',
    age: 18
}, seconds);

// Check has key
if(cache.has('key')) {
    // exists
}

// Add if not present
if(cache.add('key', 'value', seconds)) {
    // Add
}else{
    // Exists
}

// Get & remove
const value = cache.pull('key');

// Remove key
cache.forget('key');

// Remove all keys
cache.clear();
