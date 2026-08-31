/* ============================================================================
 * scripts/electron-cutout.js — 用 Electron 渲染进程跑 @imgly/background-removal
 * ----------------------------------------------------------------------------
 * 为什么用 Electron：@imgly 依赖 onnxruntime-web 的 WASM 后端。Chromium 禁止
 * file:// 页面加载 ES module（CORS），所以这里起一个 http://localhost 静态服务，
 * 用 importmap 把裸导入 "onnxruntime-web" 解析到本地 dist，模型与 wasm 由
 * @imgly 默认 publicPath（IMG.LY CDN，免费）拉取。
 *
 * 用法：
 *   node scripts/electron-cutout.js <input.png> <output.png>
 *
 * 结果通过渲染进程 console 上报（[CUTOUT] ...），主进程监听后写文件、退出。
 * 仅作为开发期工具使用（生成透明 PNG 素材），不打包进应用。
 * ============================================================================ */
'use strict';

const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const http = require('http');

const inPath = process.argv[2];
const outPath = process.argv[3];

if (!inPath || !outPath) {
  console.error('[CUTOUT] 参数缺失：node scripts/electron-cutout.js <in> <out>');
  app.exit(2);
  return;
}

// 无 GPU 环境更稳定（CPU 走 wasm，不依赖 WebGPU）
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');

const ROOT = path.resolve(__dirname, '..');
const ONNX_DIST = path.join(ROOT, 'node_modules', 'onnxruntime-web', 'dist');
const IMGLY_DIST = path.join(ROOT, 'node_modules', '@imgly', 'background-removal', 'dist');

const MIME = {
  '.mjs': 'text/javascript',
  '.js': 'text/javascript',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

let done = false;
function finish(code, msg) {
  if (done) return;
  done = true;
  if (msg) console.log(msg);
  app.exit(code);
}

function sendFile(res, absPath) {
  fs.readFile(absPath, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
      res.end('not found');
      return;
    }
    const type = MIME[path.extname(absPath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    });
    res.end(buf);
  });
}

function createServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    let p = url.pathname;
    if (p === '/') {
      // 在 listen 拿到 port 之后由调用方覆盖；这里先占位，见 startServer()
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(app._html);
      return;
    }
    // /onnxruntime-web/dist/<file>
    if (p.startsWith('/onnxruntime-web/dist/')) {
      sendFile(res, path.join(ONNX_DIST, path.basename(p)));
      return;
    }
    // /imgly/<file>  → @imgly dist
    if (p.startsWith('/imgly/')) {
      sendFile(res, path.join(IMGLY_DIST, path.basename(p)));
      return;
    }
    res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
    res.end('not found');
  });
  return server;
}

function buildHtml(port) {
  const b64 = fs.readFileSync(inPath).toString('base64');
  const dataUrl = 'data:image/png;base64,' + b64;
  const imglyUrl = `http://127.0.0.1:${port}/imgly/index.mjs`;
  const ortUrl = `http://127.0.0.1:${port}/onnxruntime-web/dist/ort.bundle.min.mjs`;
  const ortWebgpuUrl = `http://127.0.0.1:${port}/onnxruntime-web/dist/ort.webgpu.bundle.min.mjs`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https: http:; connect-src 'self' https: http: data: blob:; worker-src 'self' blob:;">
    <script type="importmap">
    {
      "imports": {
        "onnxruntime-web": "${ortUrl}",
        "onnxruntime-web/webgpu": "${ortWebgpuUrl}"
      }
    }
    </script>
  </head><body>
    <script type="module">
      import { removeBackground } from '${imglyUrl}';
      const src = ${JSON.stringify(dataUrl)};
      const config = { device: 'cpu', model: 'isnet_fp16', proxyToWorker: false, debug: true };
      try {
        const blob = await removeBackground(src, config);
        const buf = new Uint8Array(await blob.arrayBuffer());
        let binary = '';
        const CH = 0x8000;
        for (let i = 0; i < buf.length; i += CH) {
          binary += String.fromCharCode.apply(null, buf.subarray(i, i + CH));
        }
        console.log('[CUTOUT] DATA ' + btoa(binary));
      } catch (e) {
        console.log('[CUTOUT] ERR ' + (e && e.stack ? e.stack : (e && e.message ? e.message : String(e))));
      }
    </script>
  </body></html>`;
}

app.whenReady().then(async () => {
  const server = createServer();
  await new Promise((res) => server.listen(0, '127.0.0.1', res));
  const port = server.address().port;
  app._html = buildHtml(port);

  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 800,
    webPreferences: {
      // 若渲染进程需要后台抓取 CDN，允许跨域；关闭 node 隔离以复用 console 上报即可
      contextIsolation: true,
      sandbox: true
    }
  });

  win.webContents.on('console-message', function (event, level, message) {
    const m = (typeof message === 'string') ? message : (event && event.message);
    if (!m) return;
    if (m.indexOf('[CUTOUT]') === 0) {
      if (m.indexOf('[CUTOUT] DATA ') === 0) {
        try {
          const imgB64 = m.slice('[CUTOUT] DATA '.length);
          fs.writeFileSync(outPath, Buffer.from(imgB64, 'base64'));
          finish(0, '[CUTOUT] OK -> ' + outPath);
        } catch (e) {
          console.error('[CUTOUT] 写文件失败 ' + (e && e.message));
          finish(1);
        }
      } else if (m.indexOf('[CUTOUT] ERR ') === 0) {
        console.error('[CUTOUT] FAIL ' + m.slice('[CUTOUT] ERR '.length));
        finish(1);
      }
      return;
    }
    // 转发 @imgly / onnx 的调试日志，便于排查
    console.log('[render] ' + m);
  });

  win.webContents.on('did-fail-load', function (e, code, desc) {
    console.error('[CUTOUT] 页面加载失败 ' + code + ' ' + desc);
    finish(1);
  });

  // 超时保护（首次 CDN 拉取 88MB 模型较慢）
  setTimeout(() => { finish(1, '[CUTOUT] FAIL TIMEOUT'); }, 300000);

  await win.loadURL(`http://127.0.0.1:${port}/`);
});
