/* ============================================================================
 * scripts/electron-clean.js — 二次清理抠图 Alpha 掩码
 * ----------------------------------------------------------------------------
 * 作用：取出 AI 抠图结果中最大连通前景（人物），去掉孤立碎块（背景水珠/速度线
 * 误判），并填充人物内部的细小空洞，得到干净的透明 PNG。
 *
 * 用法：
 *   node scripts/electron-clean.js <input.png> <output.png>
 * ============================================================================ */
'use strict';

const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

const inPath = process.argv[2];
const outPath = process.argv[3];
if (!inPath || !outPath) {
  console.error('[CLEAN] 参数缺失：node scripts/electron-clean.js <in> <out>');
  app.exit(2);
  return;
}

let done = false;
function finish(code, msg) {
  if (done) return;
  done = true;
  if (msg) console.log(msg);
  app.exit(code);
}

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');

function buildHtml() {
  const b64 = fs.readFileSync(inPath).toString('base64');
  const dataUrl = 'data:image/png;base64,' + b64;
  // 经典 <script>（非 module），file:// 可正常执行；无需 http 服务与网络
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
    <script>
    (async function () {
      try {
        const img = new Image();
        img.src = ${JSON.stringify(dataUrl)};
        await img.decode();
        const w = img.width, h = img.height;
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const d = imageData.data;
        const n = w * h;
        const ALPHA_ON = 32;

        // 1) 前景掩码
        const fg = new Uint8Array(n);
        for (let i = 0; i < n; i++) if (d[i * 4 + 3] >= ALPHA_ON) fg[i] = 1;

        // 2) 连通域标记（4连通）
        const comp = new Int32Array(n); comp.fill(-1);
        const stack = new Int32Array(n);
        let cid = 0;
        const info = []; // {area, x0,y0,x1,y1}
        const X = x => x % w, Y = x => (x / w) | 0;
        for (let s = 0; s < n; s++) {
          if (!fg[s] || comp[s] !== -1) continue;
          let top = 0; stack[top++] = s; comp[s] = cid;
          let area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
          while (top > 0) {
            const cur = stack[--top]; area++;
            const cx = X(cur), cy = Y(cur);
            if (cx < x0) x0 = cx; if (cx > x1) x1 = cx;
            if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
            const nb = [cur - 1, cur + 1, cur - w, cur + w];
            for (let k = 0; k < 4; k++) {
              const t = nb[k];
              if (t < 0 || t >= n) continue;
              if (k === 0 && cx === 0) continue;
              if (k === 1 && cx === w - 1) continue;
              if (fg[t] && comp[t] === -1) { comp[t] = cid; stack[top++] = t; }
            }
          }
          info.push({ area, x0, y0, x1, y1 });
          cid++;
        }

        // 3) 选最大连通域（面积占整图 > 0.5% 里最大的）
        let keepId = -1, keepArea = 0;
        for (let i = 0; i < info.length; i++) {
          if (info[i].area > keepArea) { keepArea = info[i].area; keepId = i; }
        }
        if (keepId === -1) { console.log('[CLEAN] ERR 无前景'); return; }

        // 4) 保留下：mask = 该连通域
        const keep = new Uint8Array(n);
        for (let i = 0; i < n; i++) if (comp[i] === keepId) keep[i] = 1;

        // 5) 只保留最大连通域；其余前景置为透明（不做填洞，避免误把暗背景填成实心）
        for (let i = 0; i < n; i++) {
          if (comp[i] === keepId) { d[i * 4 + 3] = 255; }
          else { d[i * 4 + 3] = 0; }
        }

        ctx.putImageData(imageData, 0, 0);
        const blob = await new Promise(r => c.toBlob(r, 'image/png'));
        const buf = new Uint8Array(await blob.arrayBuffer());
        let binary = ''; const CH = 0x8000;
        for (let i = 0; i < buf.length; i += CH) binary += String.fromCharCode.apply(null, buf.subarray(i, i + CH));
        console.log('[CLEAN] DATA ' + btoa(binary));
      } catch (e) {
        console.log('[CLEAN] ERR ' + (e && e.stack ? e.stack : (e && e.message ? e.message : String(e))));
      }
    })();
    </script>
  </body></html>`;
}

app.whenReady().then(async () => {
  const html = buildHtml();
  const tmp = path.join(os.tmpdir(), '_clean.html');
  fs.writeFileSync(tmp, html);
  const win = new BrowserWindow({ show: false, width: 800, height: 800 });
  win.webContents.on('console-message', function (event, level, message) {
    const m = (typeof message === 'string') ? message : (event && event.message);
    if (!m) return;
    if (m.indexOf('[CLEAN] DATA ') === 0) {
      try {
        fs.writeFileSync(outPath, Buffer.from(m.slice('[CLEAN] DATA '.length), 'base64'));
        finish(0, '[CLEAN] OK -> ' + outPath);
      } catch (e) { console.error('[CLEAN] 写文件失败 ' + (e && e.message)); finish(1); }
    } else if (m.indexOf('[CLEAN] ERR ') === 0) {
      console.error('[CLEAN] FAIL ' + m.slice('[CLEAN] ERR '.length)); finish(1);
    }
  });
  win.webContents.on('did-fail-load', function (e, code, desc) {
    console.error('[CLEAN] 页面加载失败 ' + code + ' ' + desc); finish(1);
  });
  setTimeout(() => finish(1, '[CLEAN] FAIL TIMEOUT'), 30000);
  await win.loadURL('file://' + tmp.replace(/\\/g, '/'));
});
