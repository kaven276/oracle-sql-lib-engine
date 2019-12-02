// as inConverter, convert tprefix to tname that's used in sql parameter bind
exports.tablePrefix = (req, { tprefix }) => {
  req.tname = `${(req.tprefix || tprefix).toUpperCase()}%`;
};

// as outConverter, convert standard seqResult to echart data supply
exports.echartFeed = (sqlResult, req, { chartTitle, arrName = 'rows' }) => ({
  chartData: {
    title: chartTitle, // echart graph title
    columns: Object.keys(sqlResult.rows[0]), // echart column names
    [arrName]: sqlResult.rows, // echart data
  },
});
