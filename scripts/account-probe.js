// 账号功能自动化探针（开发期）: 用全新临时 profile 加载页面，逐项验证
// 注册/登录/管理员种子/删除保护/数据隔离/登录守卫，全部通过退出码 0。
// 用法: npx electron scripts/account-probe.js
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const url = require('url');

const SRC = path.resolve(__dirname, '..', 'src');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(url.parse(req.url).pathname);
  if (p === '/') p = '/index.html';
  fs.readFile(path.join(SRC, p), (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  const { app, BrowserWindow } = require('electron');

  // 全新临时 profile：隔离 localStorage / IndexedDB，保证测试环境干净
  app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'kitty-probe-')));
  app.disableHardwareAcceleration();

  app.whenReady().then(() => {
    const win = new BrowserWindow({
      width: 480, height: 880, show: false,
      webPreferences: { offscreen: true, backgroundThrottling: false },
      backgroundColor: '#fff0f5',
    });
    win.webContents.on('console-message', (e, level, msg) => {
      if (level === 3) console.log('console-err:', msg);
    });
    win.webContents.on('did-fail-load', (e, code, desc) => {
      console.log('did-fail-load', code, desc);
      server.close();
      process.exit(1);
    });

    win.webContents.on('did-finish-load', async () => {
      try {
        const page = `
          (async function () {
            var S = window.App && window.App.Store;
            // 等 boot 完成：路由已挂载 → Store.init 已 resolve
            for (var i = 0; i < 100 && !(S && document.getElementById('app').childElementCount > 0); i++) {
              await new Promise(function (r) { setTimeout(r, 100); });
            }
            var out = { results: [] };
            function check(name, ok, extra) {
              out.results.push({ name: name, pass: !!ok, extra: extra || '' });
            }
            function expectReject(promise) {
              return promise.then(function () { return 'OK(不应成功)'; }, function (e) { return 'rejected: ' + e.message; });
            }
            check('App.Store 已就绪', !!(S && S.listUsers), '');

            // 1. 管理员种子：全新环境应恰好只有内置管理员
            var users0 = await S.listUsers();
            var seedOk = users0.length === 1 && users0[0].username === 'zzy' &&
              users0[0].role === 'admin' && users0[0].avatar === '👑';
            check('管理员种子存在(仅 zzy)', seedOk,
              JSON.stringify(users0.map(function (u) { return u.username + '/' + u.role; })));

            // 2. 错误密码被拒
            check('错误密码被拒', (await expectReject(S.login('zzy', 'wrong-xx'))).indexOf('rejected') === 0);

            // 3. 管理员登录成功（密码常量来自代码种子，此处以拼接方式使用，不回显明文）
            await S.login('zzy', 'Z' + 'zy').then(function (u) {
              check('管理员登录成功且 isAdmin', !!(u && u.role === 'admin' && S.isAdmin()));
            }, function () {
              check('管理员登录成功且 isAdmin', false, '登录被拒绝');
            });
            check('管理员当前用户', S.getCurrentUser() && S.getCurrentUser().role === 'admin');

            // 4. 退出登录
            await S.logout();
            check('退出登录后 current 为 null', S.getCurrentUser() === null);

            // 5. 注册新账号并自动登录
            await S.register('test1', 'abc123', '小明', '🐰').then(function (u) {
              check('注册新账号成功(自动登录)', !!(u && u.username === 'test1' && u.role === 'user' && S.getCurrentUser().id === u.id));
            }, function (e) {
              check('注册新账号成功(自动登录)', false, 'rejected: ' + e.message);
            });

            // 6. 占用 / 非法用户名
            check('zzy 已被占用不可注册', (await expectReject(S.register('zzy', 'x123', 'X', '🐰'))).indexOf('已') >= 0);
            check('过短账号(1位)被拒', (await expectReject(S.register('a', 'x123', 'X', '🐰'))).indexOf('rejected') === 0);
            check('非法字符账号被拒', (await expectReject(S.register('ab!c', 'x123', 'X', '🐰'))).indexOf('rejected') === 0);

            // 7. 大小写不敏感登录
            await S.logout();
            check('大小写不敏感登录(TEST1)', !!(await S.login('TEST1', 'abc123').then(function (u) { return u && u.username === 'test1'; }, function () { return false; })));

            // 8. 数据按账号隔离：test1 记一笔进度，换账号后各自独立
            await S.recordAnswer('apple', true);
            await S.addStars(3);
            var ovTest1 = await S.getOverview();
            var s1 = JSON.stringify({ stars: ovTest1.stars, learned: ovTest1.learnedIds });
            await S.logout();
            await S.register('test2', 'pwd456', '小红', '🐰');
            var s2 = JSON.stringify({ stars: (await S.getOverview()).stars, learned: [] });
            await S.logout();
            await S.login('test1', 'abc123');
            var ovBack = await S.getOverview();
            var s3 = JSON.stringify({ stars: ovBack.stars, learned: ovBack.learnedIds });
            check('数据按账号隔离(互不干扰)', s1 === s3 && s2 === '{"stars":0,"learned":[]}', s1 + ' vs ' + s2 + ' vs ' + s3);

            // 9. 管理员删除保护
            var admins = (await S.listUsers()).filter(function (u) { return u.role === 'admin'; });
            var delMsg = await expectReject(S.deleteUser(admins[0].id));
            check('管理员账号不可删除', delMsg.indexOf('管理员') >= 0, delMsg);

            // 10. 登录守卫：未登录时任意路由回到 #/auth
            await S.logout();
            location.hash = '#/home';
            await new Promise(function (r) { setTimeout(r, 400); });
            check('未登录守卫跳回登录页', location.hash === '#/auth' &&
              /Welcome back/.test(document.body.textContent || ''), 'hash=' + location.hash);
            return out;
          })()
        `;
        const out = await win.webContents.executeJavaScript(page, true);
        let pass = 0, fail = 0;
        for (const r of out.results) {
          console.log((r.pass ? 'PASS' : 'FAIL') + ' | ' + r.name + (r.extra ? '  → ' + r.extra : ''));
          r.pass ? pass++ : fail++;
        }
        console.log('----');
        console.log(fail === 0 ? '[ACCOUNT-PROBE] OK  ' + pass + ' 项通过' : '[ACCOUNT-PROBE] FAILED  ' + fail + ' 项失败');
        server.close();
        process.exit(fail === 0 ? 0 : 1);
      } catch (err) {
        console.log('probe-error:', err && err.message);
        server.close();
        process.exit(1);
      }
    });

    win.loadURL('http://127.0.0.1:' + port + '/index.html').catch((e) => {
      console.log('loadUrl-err', e && e.message);
      server.close();
      process.exit(1);
    });
  });
});
