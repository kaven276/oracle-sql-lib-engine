module.exports = {
  root: true,
  globals: {
    cfg: true,
    oracledb: true,
    converters: true,
    sql: true,
    testFlag: true,
  },
  extends: [
    "airbnb-base",
  ],
  rules: {
    "arrow-parens": 0,
    "prefer-destructuring": 0,
    "import/no-dynamic-require": 0,
    "no-console": 0,
    "no-continue": 0,
    "global-require": 0,
    "func-names": 0,
    "max-len": [1, 160],
    "no-await-in-loop": 0,
    "no-param-reassign": 0,
    "no-restricted-syntax": 0,
    "quotes": 0,
  },
};
