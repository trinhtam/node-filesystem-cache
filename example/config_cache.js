const FilesystemCache = require('node-filesystem-cache');
const config_cache = new FilesystemCache('./cache');
module.exports = config_cache;
