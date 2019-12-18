const cfg = require('./cfg.js');
const chokidar = require('chokidar');
const Path = require('path');
const { join } = require('path');
const fs = require('fs');
const debug = require('debug')('osql:services');
const sqlparser = require('./sqlParser.js');

const registry = {};
const dirMap = new Map();
const rootDir = cfg.dirServices || join(__dirname, '../services/');

function checkDangerousSqlText(m) {
  if (!m.sqltext) return;
  const sqltext = (m.sqltext instanceof Function) ? m.sqltext.toString() : m.sqltext;
  if (sqltext.match(/(delete|update)/ig) && !sqltext.match(/where/ig)) {
    m.staticError = 'delete|update without where filter';
  }
}

// add prototype chain of dirConfig
function registerModuleWithPrototype(path, m) {
  checkDangerousSqlText(m);
  const upPath = path.substr(1, path.lastIndexOf('/') - 1);
  const upConfig = dirMap.get(upPath);
  const sqlConfig = Object.create(upConfig);
  Object.assign(sqlConfig, m);
  registry[path] = sqlConfig;
}

function loadSqlFile(m, registryKey) {
  const path = `${registryKey}.sql`;
  const nojs = !m || m.sqlOnly;
  if (nojs) {
    // sql file 没有对应的 js 控制文件
    m = {
      path: registryKey,
      sqlOnly: true,
    };
  }
  fs.readFile(rootDir + path, { encoding: 'utf8' }, (err, sql) => {
    if (err) {
      console.error(`load ${path} sql file error`);
      console.error(err);
      return;
    }
    const sqlLines = sql.split('\n');
    if (nojs) {
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
    registerModuleWithPrototype(registryKey, m);
  });
}

function processSqlFile(pp) {
  const registryKey = Path.join('/', pp.dir, pp.name);
  const atomService = registry[registryKey];
  if (!atomService || atomService.sqlOnly) {
    // 看看是否是独立 sql file，没有对应的 js file
    const jsFilePath = Path.join(rootDir, `${pp.name}.js`);
    fs.access(jsFilePath, fs.constants.R_OK, (err) => {
      if (err) {
        // 没有对应的 js 文件，也就是独立 sql，创造一个虚拟 js 模块，配置从 .sql 文件头部的注释中取
        loadSqlFile(null, registryKey);
      } else {
        // 有对应的 .js，那就等着他重新再级联加载自己
      }
    });
  } else {
    loadSqlFile(atomService, registryKey);
  }
}

function checkAndRegisterModule(m, path, oper) {
  let errorCount = 0;
  if (m.path !== path) {
    errorCount += 1;
    console.warn(`文件路径${path}和 exports.path(${m.path}) 不一致`);
  }
  // 检查必要属性是否齐全
  if (!m.title) {
    errorCount += 1;
    console.warn(`${path} 没有 title`);
  }
  // 检查 sqltext 是否存在 delete/update without where 的情况
  m.sqltext = m.sqltext || m.sql; // 写成 sql 或者 sqltext 都行
  const flagLoadSqlFile = !m.sqltext;
  if (!m.sqltext) {
    loadSqlFile(m, path);
  }
  if (errorCount === 0) {
    registerModuleWithPrototype(path, m);
    debug(`${oper} ${path} ${flagLoadSqlFile ? ' (load sql file)' : ''}`);
  }
}


function processJsFile(pp, path, event) {
  const registryKey = Path.join('/', pp.dir, pp.name);
  const requirePath = Path.join(rootDir, path);
  let absPath;
  let atomService;
  switch (event) {
    case 'add':
      try {
        atomService = require(requirePath);
      } catch (e) {
        console.error('module init hot reload error', path, e);
        return;
      }
      checkAndRegisterModule(atomService, registryKey, 'register');
      break;
    case 'change':
      absPath = require.resolve(requirePath);
      if (absPath) {
        delete require.cache[absPath];
      } else {
        console.log('no absPath');
      }
      try {
        atomService = require(requirePath);
      } catch (e) {
        console.error('module change hot reload error', path, e);
        return;
      }
      checkAndRegisterModule(atomService, registryKey, 'upgrade');
      break;
    case 'unlink':
      absPath = require.resolve(requirePath);
      if (absPath) {
        delete require.cache[absPath];
      } else {
        console.log('no absPath');
      }
      delete registry[registryKey];
      break;
    default:
  }
}

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
  dirMap.set(path, dirConfig);
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

chokidar
  .watch(rootDir, {
    cwd: rootDir,
    disableGlobbing: false,
    depth: 5,
    awaitWriteFinish: true,
  })
  .on('all', (event, path) => {
    // console.log(event, path);
    const pp = Path.parse(path); // pp is parsed path
    if (event === 'addDir') {
      loadDirConfig(path, pp);
    } else if (pp.base === 'osql.config.js') {
      updateDirConfig(pp, path, event);
    } else if (pp.ext === '.sql') {
      processSqlFile(pp);
    } else if (pp.ext === '.js') {
      processJsFile(pp, path, event);
    }
  });

exports.registry = registry;
