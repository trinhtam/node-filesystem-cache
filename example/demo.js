const cache = require('./config_cache');

const seconds = 60000; // 60seconds

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
