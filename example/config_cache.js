const FilesystemCache = require('../');
const config_cache = new FilesystemCache('./cache');
module.exports = config_cache;
