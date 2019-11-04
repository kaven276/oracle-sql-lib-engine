const cfg = require('./cfg.js');
const shelljs = require('shelljs');
const chokidar = require('chokidar');
const { join } = require('path');
const debug = require('debug')('osql:converters');

const registry = {};
const rootDir = cfg.dirConverters || join(__dirname, '../converters/');

// 确保先加上上已有的转换器，防止加载服务快了，找不到转换器报错
shelljs.cd(rootDir);
shelljs.find('.').forEach((path) => {
  if (!path.match(/\.js$/)) return;
  const converterName = path.replace(/^(\w+)\.js$/, '$1');
  const requirePath = rootDir + path;
  const converter = require(requirePath);
  registry[converterName] = converter;
  debug('init', converterName);
});

chokidar.watch(rootDir, {
  cwd: rootDir,
  disableGlobbing: false,
  depth: 2,
  awaitWriteFinish: true,
}).on('all', (event, path) => {
  // console.log(event, path);
  if (!path.match(/\.js$/)) return;
  const requirePath = rootDir + path;
  const registryKey = `/${path.replace(/\.(js)$/, '').replace(/\\/g, '/')}`;
  let converter;
  let absPath;

  switch (event) {
    case 'add':
      try {
        converter = require(requirePath);
      } catch (e) {
        console.error('module init hot reload error', path, e);
        return;
      }
      registry[path] = converter;
      debug(`add ${path}`);
      break;
    case 'change':
      absPath = require.resolve(requirePath);
      if (absPath) {
        delete require.cache[absPath];
      } else {
        console.warn('no absPath');
      }
      try {
        converter = require(requirePath);
      } catch (e) {
        console.error('module change hot reload error', path, e);
        return;
      }
      registry[path] = converter;
      debug(`change ${path}`);
      break;
    case 'unlink':
      absPath = require.resolve(requirePath);
      if (absPath) {
        delete require.cache[absPath];
      } else {
        console.warn('no absPath');
      }
      delete registry[registryKey];
      break;
    default:
  }
});


// setTimeout(() => console.log(Object.keys(registry)), 3000);

module.exports = registry;
