const fs = require('fs');
const serializer = require("serialijse");
const fs_path = require('path');
const sha1 = require('sha1');

class Store {
    constructor(directory=null) {
        this.directory = directory;
        this._objects_registered = [
            "Object",
            "Float32Array", "Uint32Array", "Uint16Array", "Uint8Array", "Int32Array", "Int16Array", "Int8Array",
        ];
        if(this.directory === null) {
            let packagePath = fs_path.dirname(require.resolve('node-filesystem-cache/package.json'));
            this.directory = packagePath + '/cache';
        }
    }
    path = (key) => {
        const hash = sha1(key) + '';
        let paths = hash.match(/.{1,2}/g);
        paths = paths.slice(0, 2);
        return this.directory + '/' + paths.join('/') + '/' + hash;
    };
    put = (key, value, seconds) => {
        const path = this.path(key);
        this.ensureCacheDirectoryExists(path);
        let type = null;
        let serializer_value = null;
        if(typeof value === 'object') {
            type = value.constructor.name;
            if(!this._objects_registered.includes(type)) {
                serializer.declarePersistable(value.constructor);
                this._objects_registered.push(type);
            }
            serializer_value = serializer.serialize(value);
        }else{
            serializer_value = JSON.stringify(value);
        }
        const content = {
            'expiration': this.expiration(seconds),
            'type': type,
            'data': serializer_value,
        };
        fs.writeFileSync(path, JSON.stringify(content));
        return value;
    };
    getPayload = (key) => {
        const path = this.path(key);
        if(!fs.existsSync(path)) {
            return this.emptyPayload();
        }
        try {
            let content = fs.readFileSync(path).toString();
            content = JSON.parse(content);
            const current_time = Date.now();
            if(current_time >= content.expiration) {
                this.forget(key);
                return this.emptyPayload();
            }
            if(content.type === null) {
                content = JSON.parse(content.data);
            }else{
                if(!this._objects_registered.includes(content.type)) {
                    serializer.declarePersistable(content.type);
                    this._objects_registered.push(content.type);
                }
                content = serializer.deserialize(content.data);
            }
            return content;
        }catch (e) {
            return this.emptyPayload();
        }
    };
    checkPayload = (key) => {
        const path = this.path(key);
        if(!fs.existsSync(path)) {
            return false;
        }
        try {
            let content = fs.readFileSync(path).toString();
            content = JSON.parse(content);
            const current_time = Date.now();
            if(current_time >= content.expiration) {
                this.forget(key);
                return false;
            }
            return true;
        }catch (e) {
            return false;
        }
    };
    emptyPayload = () => {
        return null;
    };
    forget = (key) => {
        const path = this.path(key);
        if(fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
    };
    ensureCacheDirectoryExists = (path) => {
        const dirname = fs_path.dirname(path);
        if(!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, {
                mode: 0o777,
                recursive: true,
            });
        }
    };
    clear = () => {
        if(fs.lstatSync(this.directory).isDirectory()) {
            this.directories(this.directory).forEach(directory => {
                this.deleteDirectory(directory);
            });
        }
    };
    directories = (path) => {
        const dirs = [];
        fs.readdirSync(path).forEach((file) => {
            const curPath = fs_path.join(path, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                dirs.push(curPath);
            }
        });
        return dirs;
    };
    deleteDirectory = (path) => {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file) => {
                const curPath = fs_path.join(path, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.deleteDirectory(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
    expiration = (seconds) => {
        const now = Date.now();
        let realSeconds = parseInt(seconds);
        if(isNaN(realSeconds) || realSeconds === 0 || realSeconds > 9999999999000) {
            return 9999999999000;
        }
        return now + realSeconds;
    };
}

module.exports = Store;
