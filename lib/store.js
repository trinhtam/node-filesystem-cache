const fs = require('fs');
const fs_path = require('path');
const sha1 = require('sha1');

class Store {
    constructor(directory) {
        this.directory = directory;
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
        const content = this.expiration(seconds) + JSON.stringify(value);
        fs.writeFileSync(path, content);
        return value;
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
    getPayload = (key) => {
        const path = this.path(key);
        if(!fs.existsSync(path)) {
            return this.emptyPayload();
        }
        try {
            let content = fs.readFileSync(path).toString();
            const expire = parseInt(content.substr(0, 13));
            content = content.substr(13);
            const current_time = Date.now();
            if(current_time >= expire) {
                this.forget(key);
                return this.emptyPayload();
            }
            content = JSON.parse(content);
            return content;
        }catch (e) {
            return this.emptyPayload();
        }
    };
    emptyPayload = () => {
        return null;
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
