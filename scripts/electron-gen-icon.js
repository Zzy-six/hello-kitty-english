/* ============================================================================
 * scripts/electron-gen-icon.js — 用 3D 立绘 kitty-3d.png 生成应用图标
 * ----------------------------------------------------------------------------
 * 为什么用 Electron：浏览器里才能解码 PNG 并绘制 2048 超采样画布。
 * 产出（与旧版 generate-icon.js 输出路径一致，直接顶替）：
 *   src/assets/icon-192.png      PWA 小图标
 *   src/assets/icon-256.png      网页 favicon
 *   src/assets/icon-512.png      PWA 大图标
 *   build/icon.png               electron-builder 图标源
 *   build/icon.ico               Windows 安装包/可执行文件图标（PNG 压缩 256px）
 *
 * 设计：圆角方形深粉渐变 + 中心柔光 + Kitty 全身立绘 + 脚下椭圆影子，
 * 立绘宽约 62% 画布、略偏上留出呼吸感，符合 iOS/Windows 图标模版安全区。
 *
 * 用法：electron.exe scripts/electron-gen-icon.js
 * ============================================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const { app, BrowserWindow } = require('electron');

const ROOT = path.join(__dirname, '..');

app.disableHardwareAcceleration();
app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 600, height: 600, show: false });
  const src = fs.readFileSync(path.join(ROOT, 'src', 'assets', 'kitty-3d.png')).toString('base64');
  const html = '<!doctype html><meta charset="utf-8"><body></body>';
  win.loadURL('data:text/html;base64,' + Buffer.from(html).toString('base64')).then(() => {
    win.webContents.executeJavaScript(`
      (async () => {
        const img = await createImageBitmap(await (await fetch('data:image/png;base64,${src}')).blob());
        const N = 2048;

        // 圆角方形路径（半径约 21.5% = iOS 拟物圆角）
        function roundPath(ctx, size, rad) {
          ctx.beginPath();
          ctx.moveTo(rad, 0);
          ctx.arcTo(size, 0, size, size, rad);
          ctx.arcTo(size, size, 0, size, rad);
          ctx.arcTo(0, size, 0, 0, rad);
          ctx.arcTo(0, 0, size, 0, rad);
          ctx.closePath();
        }

        function drawBase(ctx, size) {
          ctx.clearRect(0, 0, size, size);
          roundPath(ctx, size, size * 0.215);
          // 深粉自上而下渐变
          const g = ctx.createLinearGradient(0, 0, 0, size);
          g.addColorStop(0, '#ff9fc2');
          g.addColorStop(0.55, '#ff6f9f');
          g.addColorStop(1, '#f44e86');
          ctx.fillStyle = g;
          ctx.fill();

          // 中心柔光（让 Kitty 立绘像站在聚光灯下）
          ctx.save();
          roundPath(ctx, size, size * 0.215);
          ctx.clip();
          const halo = ctx.createRadialGradient(size/2, size*0.42, 0, size/2, size*0.42, size*0.72);
          halo.addColorStop(0, 'rgba(255,255,255,0.42)');
          halo.addColorStop(0.55, 'rgba(255,255,255,0.10)');
          halo.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = halo;
          ctx.fillRect(0, 0, size, size);

          // 顶部玻璃高光带
          const sheen = ctx.createLinearGradient(0, 0, 0, size * 0.5);
          sheen.addColorStop(0, 'rgba(255,255,255,0.28)');
          sheen.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = sheen;
          ctx.fillRect(0, 0, size, size * 0.5);
          ctx.restore();
        }

        function drawKitty(ctx, size) {
          const w = size * 0.62;
          const h = w * img.height / img.width;
          const x = (size - w) / 2;
          const y = size * 0.5 - h / 2 + size * 0.015; // 略高于垂直中心
          // 脚下影子
          const sh = ctx.createRadialGradient(size/2, y + h - size*0.02, 0, size/2, y + h - size*0.02, w * 0.32);
          sh.addColorStop(0, 'rgba(160,40,90,0.35)');
          sh.addColorStop(1, 'rgba(160,40,90,0)');
          ctx.fillStyle = sh;
          ctx.beginPath();
          ctx.ellipse(size/2, y + h - size*0.015, w * 0.30, w * 0.085, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(img, x, y, w, h);
        }

        // 主画 2048，再逐级缩小（比单尺寸直接画更平滑统一）
        const sizes = [2048, 1024, 512, 256, 192];
        const out = {};
        for (const s of sizes) {
          const c = document.createElement('canvas');
          c.width = c.height = s;
          const ctx = c.getContext('2d');
          drawBase(ctx, s);
          drawKitty(ctx, s);
          out[s] = c.toDataURL('image/png');
        }
        return out;
      })();
    `).then((out) => {
      const write = (size, file) => {
        const b64 = out[String(size)];
        if (!b64) { console.log('[icon] missing', size); return; }
        fs.writeFileSync(file, Buffer.from(b64.split(',')[1], 'base64'));
        console.log('[icon] ' + path.relative(ROOT, file) + '  ' + fs.statSync(file).size + ' B');
      };
      fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
      fs.mkdirSync(path.join(ROOT, 'src', 'assets'), { recursive: true });
      write(512, path.join(ROOT, 'src', 'assets', 'icon-512.png'));
      write(256, path.join(ROOT, 'src', 'assets', 'icon-256.png'));
      write(192, path.join(ROOT, 'src', 'assets', 'icon-192.png'));
      write(256, path.join(ROOT, 'build', 'icon.png'));

      // ICO：PNG 压缩 256px（Windows 支持 PNG 图标，无需裸位图）
      const png = Buffer.from(out['256'].split(',')[1], 'base64');
      const header = Buffer.alloc(6);
      header.writeUInt16LE(0, 0);
      header.writeUInt16LE(1, 2);
      header.writeUInt16LE(1, 4);
      const entry = Buffer.alloc(16);
      entry[0] = 0; entry[1] = 0; entry[2] = 0; entry[3] = 0;
      entry.writeUInt16LE(1, 4);
      entry.writeUInt16LE(32, 6);
      entry.writeUInt32LE(png.length, 8);
      entry.writeUInt32LE(6 + 16, 12);
      const ico = Buffer.concat([header, entry, png]);
      fs.writeFileSync(path.join(ROOT, 'build', 'icon.ico'), ico);
      console.log('[icon] build/icon.ico  ' + ico.length + ' B');
      console.log('[icon] 完成');
      win.destroy();
      app.quit();
    }).catch((e) => { console.log('[icon] ERR', e && e.message || e); app.exit(1); });
  });
});
