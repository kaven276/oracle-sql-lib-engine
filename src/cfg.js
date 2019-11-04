const path = require("path");

const cfgFilePath = path.join(path.dirname(require.main.filename), ".osqlrc.js");
module.exports = require(cfgFilePath);
