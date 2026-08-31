// 开发期截图脚本: 启动临时静态服务器加载 src/ 页面, 等待渲染后截图输出 PNG。
// 用法: electron.exe scripts/electron-screenshot.js <url-path> <out.png> [hash]
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const SRC = path.resolve(__dirname, '..', 'src');
const argvPath = process.argv[2] || '/index.html';
const outFile = path.resolve(process.argv[3] || '_shot.png');
const hash = process.argv[4] || '';
const presetUser = process.argv[5] || ''; // 传入姓名则预置一个学员并进入首页
const dragTest = process.argv[6] || '';   // 传入 "drag" 则模拟按住拖拽后截图（验证 3D 效果）

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
  const file = path.join(SRC, p);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

server.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  const { app, BrowserWindow } = require('electron');

  app.disableHardwareAcceleration();
  app.whenReady().then(() => {
    const win = new BrowserWindow({
      width: 480, height: 880, show: false,
      webPreferences: { offscreen: true, backgroundThrottling: false },
      backgroundColor: '#fff0f5',
    });
    let lastShot = null;
    win.webContents.on('paint', (ev, dirty, image) => { lastShot = image; });
    win.webContents.on('console-message', (e, level, msg) => {
      if (level === 3) console.log('console-err:', msg);
    });
    win.webContents.on('did-fail-load', (e, code, desc) => console.log('did-fail-load', code, desc));
    win.loadURL('http://127.0.0.1:' + port + argvPath + hash).catch((e) => console.log('loadUrl-err', e && e.message));
    if (presetUser) {
      // 自动完成「欢迎取名」弹窗：填入名字并点击开始，创建学员后关闭弹窗进入首页
      setTimeout(() => {
        const clean = String(presetUser).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        win.webContents.executeJavaScript(
          "(function(){var i=document.querySelector('#k-welcome-name');" +
          "var g=document.querySelector('#k-welcome-go');" +
          "if(!g){location.hash='#/home';return;}" +
          "var setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;" +
          "setter.call(i,'" + clean + "');i.dispatchEvent(new Event('input',{bubbles:true}));" +
          "g.click();})();"
        ).catch(() => {});
      }, 1200);
    }
    if (dragTest) {
      // 模拟按住 Kitty 拖动（先 pointerdown 再 pointermove），停在半空验证 3D 倾斜
      setTimeout(() => {
        win.webContents.executeJavaScript(
          "(function(){" +
          "var st=document.querySelector('.kt-stage');if(!st)return;" +
          "var d=st.querySelector('.kt-drag');var r=st.getBoundingClientRect();" +
          "var cx=r.left+r.width/2, cy=r.top+r.height/2;" +
          "d.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:7,button:0,clientX:cx,clientY:cy}));" +
          "window.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,cancelable:true,pointerId:7,clientX:cx+90,clientY:cy-70}));" +
          "window.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,cancelable:true,pointerId:7,clientX:cx+88,clientY:cy-72}));" +
          "})();"
        ).catch(() => {});
      }, 2000);
    }
    setTimeout(() => {
      if (lastShot && !lastShot.isEmpty()) {
        fs.writeFileSync(outFile, lastShot.toPNG());
        console.log('SHOT ' + outFile);
      } else {
        console.log('NOSHOT');
      }
      server.close();
      win.destroy();
      app.quit();
    }, 3200);
  });
});
