/*
  - require(jsfile) blockingly
  - none-block asynchrously load sql file
  - hot reloading dirConfig/js/sql
  - load js then sql, osql will override js exports
  - exit -1: require js file error
  - exit -2: read sql file error
  - exit -3: path mismatch
*/

const cfg = require('./cfg.js');
const chokidar = require('chokidar');
const Path = require('path');
const { join } = require('path');
const fs = require('fs');
const debug = require('debug')('osql:services');
const sqlparser = require('./sqlParser.js');

const registry = {}; // /dir/dir2/file => {}, posix sep
const dirMap = new Map(); // dir1/dir2 => {}, posix / sep
const rootDir = cfg.dirServices || join(__dirname, '../services/');

// path is like level1/level2, not start with /
function loadDirConfig(path, pp) {
  // create prototype chains for dirConfig
  let dirConfig;
  if (path === '') {
    dirConfig = Object.create({ // root osql.config.js inherit cfg.js
      pool: cfg.defaultPoolName,
    });
  } else {
    const upDirConfig = dirMap.get(pp.dir);
    dirConfig = Object.create(upDirConfig);
  }
  dirMap.set(Path.sep === '/' ? path : path.replace(/\\/g, '/'), dirConfig);
}

// give osql.config.js path, update its dirConfig
// path is like level1/level2, not start with /
function updateDirConfig(pp, path, event) {
  let config;
  const cfgPath = Path.join(rootDir, path);
  if (event !== 'add' || require.cache[cfgPath]) {
    delete require.cache[cfgPath];
  }
  const dirConfig = dirMap.get(pp.dir);
  if (event === 'change' || event === 'unlink') {
    for (const n of Object.keys(dirConfig)) {
      delete dirConfig[n];
    }
  }
  if (event === 'add' || event === 'change') {
    config = require(cfgPath);
    Object.assign(dirConfig, config);
  }
}

function checkDangerousSqlText(m) {
  if (!m.sqltext) return;
  const sqltext = (m.sqltext instanceof Function) ? m.sqltext.toString() : m.sqltext;
  if (sqltext.match(/(delete|update)/ig) && !sqltext.match(/where/ig)) {
    m.staticError = 'delete|update without where filter';
  }
}

// add prototype chain of dirConfig
function registerModuleWithPrototype(registryKey, m, from) {
  if (m.path !== registryKey) {
    console.warn(`文件路径${registryKey}和 exports.path(${m.path}) 不一致`);
    process.exit(-3);
  }
  // 检查必要属性是否齐全
  if (!m.title) {
    console.warn(`${registryKey} by ${from} 没有 title`);
  }
  debug(`${registryKey} loaded`);
  checkDangerousSqlText(m);
  const upPath = Path.dirname(registryKey).substr(1);
  const upConfig = dirMap.get(upPath);
  const sqlConfig = Object.create(upConfig);
  Object.assign(sqlConfig, m);
  registry[registryKey] = sqlConfig;
}

// called from processJsFile and processSqlFile
function loadSqlFile(m, registryKey, from) {
  const path = `${registryKey}.sql`;
  debug('loadSqlFile', registryKey, from);
  if (!m) {
    // sql file 没有对应的 js 控制文件
    m = {
      path: registryKey,
      sqlOnly: true,
    };
  }
  const sqlFilePath = Path.join(rootDir, path);
  fs.readFile(sqlFilePath, { encoding: 'utf8' }, (err, sql) => {
    if (err) {
      console.error(`load ${path} sql file error`);
      console.error(err);
      process.exit(-2);
    }
    const sqlLines = sql.split('\n');
    if (m) { // always new or override m exports
      // 处理 .sql 文件头部 meta 信息，相当于 .js 的 exports.xxx，如 "-- pool: task"
      let i;
      for (i = 0; i < sqlLines.length; i += 1) {
        const sqlLine = sqlLines[i];
        if (sqlLine.match(/^\s*$/)) continue;
        const match = sqlLine.match(/^\s*--(.*)$/);
        if (match) {
          const match2 = match[1].match(/(\w+)\s*:\s*(.+)\s*$/);
          if (!match2) continue;
          const key = match2[1];
          const value = match2[2].trim();
          if (key.match(/^(in|out)Converter$/)) {
            if (value.startsWith('(')) { // -- outConverter: () => {}
              try {
                // eslint-disable-next-line no-eval
                m[key] = eval(value);
              } catch (e) {
                console.error(`path(${path}) value=${value} outConverter eval error ${e}`);
              }
            } else { // -- outConverter: point to osql.config.js exports.key
              m[key] = value; // (sqlResult, req, m) => {}
            }
          } else {
            m[key] = value;
          }
        } else { // 第一次非空行也非注释，认定是 sql 开始，头部结束
          break;
        }
      }
      sqlLines.splice(0, i);
    }
    if (sql.match(/\${/)) {
      // dynamic sql
      m.sqltext = sqlparser.makeSqlGenFunc(sql, sqlLines, m.path);
    } else {
      // static sql (but may use bind)
      m.sqltext = sqlparser.stripSqlComment(sql, sqlLines);
    }
    registerModuleWithPrototype(registryKey, m, 'sql');
  });
}

// filepath to registry key consider posix or win32
const computeRegKey = (pp) => ((Path.sep === '\\') ?
  Path.join('/', pp.dir, pp.name).replace(/\\/g, '/') :
  Path.join('/', pp.dir, pp.name));

function processSqlFile(pp) {
  const registryKey = computeRegKey(pp);
  const atomService = registry[registryKey];
  if (!atomService || atomService.sqlOnly) {
    // 看看是否是独立 sql file，没有对应的 js file
    const jsFilePath = Path.join(rootDir, `${registryKey}.js`);
    fs.access(jsFilePath, fs.constants.R_OK, (err) => {
      if (err) {
        // 没有对应的 js 文件，也就是独立 sql，创造一个虚拟 js 模块，配置从 .sql 文件头部的注释中取
        loadSqlFile(null, registryKey, `sqlnojs`);
      } else {
        // 有对应的 .js，那就等着他重新再级联加载自己
      }
    });
  } else {
    loadSqlFile(atomService, registryKey, 'sqlhasjs');
  }
}

function processJsFile(pp, path, event) {
  const registryKey = computeRegKey(pp);
  const requirePath = Path.join(rootDir, path);
  let absPath;
  let m;
  if (event === 'change' || event === 'unlink') {
    absPath = require.resolve(requirePath);
    if (absPath) {
      delete require.cache[absPath];
    } else {
      console.log('no absPath');
    }
  }
  if (event === 'change' || event === 'add') {
    try {
      m = require(requirePath);
    } catch (e) {
      console.error('module init hot reload error', event, path, e);
      process.exit(-1);
    }
    m.sqltext = m.sqltext || m.sql; // 写成 sql 或者 sqltext 都行
    m.flagLoadSqlFile = !m.sqltext; // flag where sql is from, js or sql
    if (!m.sqltext) {
      loadSqlFile(m, registryKey, 'jstosql');
    } else {
      registerModuleWithPrototype(registryKey, m);
    }
  }
}

chokidar
  .watch(rootDir, {
    cwd: rootDir,
    disableGlobbing: true,
    depth: 5,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100,
    },
  })
  .on('all', (event, path) => {
    // console.log(event, path);
    const pp = Path.parse(path); // pp is parsed path
    if (Path.sep === '\\') {
      pp.dir = pp.dir.replace(/\\/g, '/');
    }
    if (event === 'addDir') {
      loadDirConfig(path, pp);
    } else if (pp.base === 'osql.config.js') {
      updateDirConfig(pp, path, event);
    } else if (pp.ext === '.sql') {
      processSqlFile(pp);
    } else if (pp.ext === '.js') {
      processJsFile(pp, path, event);
    }
  })
  .on('ready', () => {
    if (!module.parent.id.endsWith('server.js')) {
      process.exit(0);
    }
  });

exports.registry = registry;
