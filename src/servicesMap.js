const cfg = require('./cfg.js');
const chokidar = require('chokidar');
const { join } = require('path');
const fs = require('fs');
const debug = require('debug')('osql:services');
const sqlparser = require('./sqlParser.js');

const registry = {};
const rootDir = cfg.dirServices || join(__dirname, '../services/');

function loadSqlFile(m, registryKey) {
  const path = `${registryKey}.sql`;
  const nojs = !m || m.sqlOnly;
  if (nojs) {
    // sql file 没有对应的 js 控制文件
    m = {
      path: registryKey,
      sqlOnly: true,
    };
    registry[registryKey] = m;
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
            if (value.startsWith('(') || 1) { // -- outConverter: () => {}
              try {
                // eslint-disable-next-line no-eval
                m[key] = eval(value);
              } catch (e) {
                console.error(`path(${path}) outConverter eval error ${e}`);
              }
            } else { // -- outConverter: registered converter module path
              m[key] = require(value);
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
    if (!m.pool) {
      m.pool = cfg.defaultPoolName || registryKey.split('/')[1]; // 默认路径第一部分就是pool名称
    }
  });
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
  // 检查必要属性是否齐全
  m.sqltext = m.sqltext || m.sql; // 写成 sql 或者 sqltext 都行
  m.pool = m.pool || cfg.defaultPoolName || path.split('/')[1];
  const flagLoadSqlFile = !m.sqltext;
  if (!m.sqltext) {
    loadSqlFile(m, path);
  }
  if (errorCount === 0) {
    registry[path] = m;
    debug(`${oper} ${path} ${flagLoadSqlFile ? ' (load sql file)' : ''}`);
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
    if (!path.match(/\.(js|sql)$/)) return;
    const requirePath = rootDir + path;
    const registryKey = `/${path
      .replace(/\.(js|sql)$/, '')
      .replace(/\\/g, '/')}`;
    let atomService;
    let absPath;
    if (path.match(/\.sql$/)) {
      atomService = registry[registryKey];
      if (!atomService || atomService.sqlOnly) {
        // 看看是否是独立 sql file，没有对应的 js file
        fs.access(`${rootDir + registryKey}.js`, fs.constants.R_OK, (err) => {
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
      return;
    }

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
  });

// setTimeout(() => console.log(Object.keys(registry)), 3000);

exports.registry = registry;
