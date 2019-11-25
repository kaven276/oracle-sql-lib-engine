const axios = require('axios').default;

axios.defaults.baseURL = 'http://127.0.0.1:1520';
axios.defaults.headers.post['Content-Type'] = 'application/json';

function format(obj) {
  return JSON.stringify(obj, null, 2);
}

function check(result) {
  console.log(format(result.data));
}

function t(path, req = {}) {
  console.log('\nexecuting', path);
  console.log(format(req));
  return axios.post(path, req).then(check).catch(console.error);
}

exports.t = t;

exports.testAll = (cb) => cb(t);
