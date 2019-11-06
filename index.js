const koaApp = require("./src/server.js");

exports.koaApp = koaApp;

function startHttpServer() {
  const PORT = Number(process.env.PORT) || 1520;
  const http = require("http");

  const server = http.createServer(koaApp.callback());
  server.listen(PORT, "0.0.0.0", () => {
    console.log("oracle-sql-lib-engine server begin listening");
  });
}

exports.startHttpServer = startHttpServer;

if (require.main === module) {
  // 直接用本项目启动场景
  startHttpServer();
}
