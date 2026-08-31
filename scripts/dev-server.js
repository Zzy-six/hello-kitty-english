/* ============================================================================
 * scripts/dev-server.js — 零依赖本地静态服务器（开发/自测用）
 * ----------------------------------------------------------------------------
 * 用法：node scripts/dev-server.js  （默认端口 8080，可用环境变量 PORT 修改）
 * 仅用于本地预览。网页本身完全离线运行（双击 index.html 也可以打开），
 * 部署时用 GitHub Pages 的静态托管，与本文件无关。
 * ============================================================================ */
'use strict';

var http = require('http');
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..', 'src');
var PORT = Number(process.env.PORT) || 8080;

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.map': 'application/json'
};

var server = http.createServer(function (req, res) {
  var urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  // 防目录穿越
  var filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, function (err, st) {
    if (err || !st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + urlPath);
      return;
    }
    var ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, function () {
  console.log('[dev-server] http://localhost:' + PORT + '/  (Ctrl+C to stop)');
});
