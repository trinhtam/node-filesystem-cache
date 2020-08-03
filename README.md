# node-filesystem-cache
Module cache for NodeJs using Filesystem.

## Installation
```
npm install node-filesystem-cache --save
```

## Configuration
```
const CacheApi = require('node-filesystem-cache');
const cachePath = __dirname + '/cache';
const Cache = new CacheApi(cachePath);
```

## Cache Usage
### Retrieving Items From The Cache
The get method on the Cache facade is used to retrieve items from the cache. If the item does not exist in the cache, null will be returned. If you wish, you may pass a second argument to the get method specifying the default value you wish to be returned if the item doesn't exist:
```
value = Cache.get('key');
value = Cache.get('key', 'default');
```

### Checking For Item Existence
The has method may be used to determine if an item exists in the cache. This method will return false if the value is null:
```
if (Cache.has('key')) {
    //
}
```
### Retrieve & Store
Sometimes you may wish to retrieve an item from the cache, but also store a default value if the requested item doesn't exist.
```
// Synchronous
value = Cache.remember('users', seconds, () => {
     return [
        {
            id: 1,
            name: 'User 1',
        },
        {
            id: 2,
            name: 'User 2',
        }
     ];
 });

// Asynchronous
value = await Cache.rememberAsync('users', seconds, async () => {
     return await userRepository.getUsers();
 });
```
### Retrieve & Delete
If you need to retrieve an item from the cache and then delete the item, you may use the pull method. Like the get method, null will be returned if the item does not exist in the cache:
```
value = Cache.pull('key');
```
### Storing Items In The Cache
You may use the put method on the Cache to store items in the cache:
```
Cache.put('key', 'value', seconds);
```
If the storage time is not passed to the put method, the item will be stored indefinitely:
```
Cache.put('key', 'value');
```
### Store If Not Present
The add method will only add the item to the cache if it does not already exist in the cache store. The method will return true if the item is actually added to the cache. Otherwise, the method will return false:
```
Cache.add('key', 'value', seconds);
```
### Storing Items Forever
The forever method may be used to store an item in the cache permanently. Since these items will not expire, they must be manually removed from the cache using the forget method:
```
Cache.forever('key', 'value');
```
### Removing Items From The Cache
You may remove items from the cache using the forget method:
```
Cache.forget('key');
```
You may clear the entire cache using the clear method:
```
Cache.clear();
```
