const path = require("path");

const cfgFilePath = path.join(path.dirname(require.main.filename), ".osqlrc.js");
global.cfg = require(cfgFilePath);

const koaApp = require("./src/server.js");

exports.koaApp = koaApp;
