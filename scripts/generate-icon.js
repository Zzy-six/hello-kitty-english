/* ============================================================================
 * scripts/generate-icon.js — 实战生成 Kitty 图标（PNG + ICO，零依赖）
 * ----------------------------------------------------------------------------
 * 为什么要自己生成：没有设计软件、也没有图片素材时，用纯 Node 画出
 * 「Kitty 庄园风」粉色猫咪图标，导出 3 份：
 *   build/icon.ico        Windows 安装包/可执行文件图标（electron-builder 用）
 *   build/icon.png        electron-builder 备用图标源
 *   src/assets/icon-256.png  网页 <link rel="icon"> 用
 *
 * 实现：超采样 4x 画 1024x1024，逐像素判断形状（圆形/圆角矩形/线段），
 * 下采样到 256x256 得到平滑边缘；然后用 Node 内置 zlib 手写 PNG 编码
 * （IHDR/IDAT/IEND + CRC32），外面套 ICO 容器（PNG 压 256px 图标）。
 *
 * 使用：node scripts/generate-icon.js
 * =========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/* ---------------- 画布：4 倍超采样 ---------------- */

const SS = 4;                 // 超采样倍数
const SIZE = 256;             // 输出尺寸
const S = SIZE * SS;          // 超采样画布边长

const canvas = new Uint8ClampedArray(S * S * 4);
function px(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= S || y >= S) return;
  const i = (y * S + x) * 4;
  const da = canvas[i + 3] / 255;
  const na = a + da * (1 - a);
  if (na <= 0) return;
  canvas[i]     = Math.round((r * a + canvas[i]     * da * (1 - a)) / na);
  canvas[i + 1] = Math.round((g * a + canvas[i + 1] * da * (1 - a)) / na);
  canvas[i + 2] = Math.round((b * a + canvas[i + 2] * da * (1 - a)) / na);
  canvas[i + 3] = Math.round(na * 255);
}

/* 形状工具（坐标单位：输出尺寸，内部自动乘 SS） */
function inCircle(x, y, cx, cy, r) {
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}
function inRoundedRect(x, y, x0, y0, x1, y1, rad) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const rx = Math.min(x - x0, x1 - x), ry = Math.min(y - y0, y1 - y);
  if (rx >= rad || ry >= rad) return true;
  const dx = rx - rad, dy = ry - rad;
  return dx * dx + dy * dy <= rad * rad;
}
/* 到线段的距离（胡子） */
function segDist(x, y, ax, ay, bx, by) {
  const abx = bx - ax, aby = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * abx + (y - ay) * aby) / (abx * abx + aby * aby)));
  const dx = x - (ax + abx * t), dy = y - (ay + aby * t);
  return Math.sqrt(dx * dx + dy * dy);
}
/* 旋转椭圆：先旋转回圆点周围再判断 */
function inRotEllipse(x, y, cx, cy, rx, ry, deg) {
  const a = (-deg) * Math.PI / 180;
  const dx = x - cx, dy = y - cy;
  const lx = dx * Math.cos(a) - dy * Math.sin(a);
  const ly = dx * Math.sin(a) + dy * Math.cos(a);
  return (lx * lx) / (rx * rx) + (ly * ly) / (ry * ry) <= 1;
}
/* 心形由两个圆 + 下方三角形近似（背景装饰用） */
function inHeart(x, y, qx, qy, hr) {
  return inCircle(x - qx, y - qy, -hr * 0.35, -hr * 0.18, hr * 0.52) ||
         inCircle(x - qx, y - qy, hr * 0.35, -hr * 0.18, hr * 0.52) ||
         (Math.abs(x - qx) <= hr * 0.78 && y - qy <= hr * 0.9 && y - qy >= -hr * 0.1 &&
          Math.abs(x - qx) <= (hr * 0.9 - (y - qy)) * 0.62);
}

/* ---------------- 造型参数（图标画布 256x256 坐标） ---------------- */

function draw() {
  const BG = [255, 224, 240];   // 背景浅粉
  const BG_DEEP = [255, 170, 203];
  const HEAD = [255, 252, 254]; // 猫脸白色（微暖白）
  const INNER = [255, 183, 210];// 耳朵内粉
  const BOW = [247, 85, 143];   // 蝴蝶结深粉
  const BOW_DEEP = [224, 55, 113];
  const DARK = [74, 46, 62];    // 眼睛/胡子
  const NOSE = [255, 122, 158];

  const cx = S / 2, cy = S / 2;
  const u = (v) => v * SS;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const X = x / SS, Y = y / SS; // 输出坐标

      /* 1. 圆角方形背景 + 上下渐变粉色 */
      if (inRoundedRect(X, Y, 0, 0, SIZE, SIZE, 56)) {
        const t = Y / SIZE;
        const r = Math.round(BG[0] + (BG_DEEP[0] - BG[0]) * t);
        const g = Math.round(BG[1] + (BG_DEEP[1] - BG[1]) * t);
        const b = Math.round(BG[2] + (BG_DEEP[2] - BG[2]) * t);
        px(x, y, r, g, b, 1);
      }

      /* 2. 背景小爱心（淡淡的三颗装饰） */
      if (inHeart(X, Y, 34, 84, 15) || inHeart(X, Y, 222, 176, 12) || inHeart(X, Y, 205, 58, 9)) {
        px(x, y, 255, 255, 255, 0.35);
      }

      /* 3. 耳朵与头（两个耳圆 + 头圆取并集） */
      const earL = [77, 43], earR = [179, 43], earR2 = 47;
      const head = [128, 140], headR = 88;

      if (inCircle(X, Y, earL[0], earL[1], earR2) || inCircle(X, Y, earR[0], earR[1], earR2)) {
        px(x, y, HEAD[0], HEAD[1], HEAD[2], 1);
      }
      if (inCircle(X, Y, head[0], head[1], headR)) {
        px(x, y, HEAD[0], HEAD[1], HEAD[2], 1);
      }

      /* 5. 内耳粉色 */
      if (inCircle(X, Y, earL[0], earL[1] + 2, earR2 * 0.48) || inCircle(X, Y, earR[0], earR[1] + 2, earR2 * 0.48)) {
        px(x, y, INNER[0], INNER[1], INNER[2], 1);
      }

      /* 6. 蝴蝶结：左翼 + 右翼 + 中心结（右耳前的经典位置） */
      const bowCx = 176, bowCy = 46;
      if (inRotEllipse(X, Y, bowCx, bowCy, 27, 16, -28) || inRotEllipse(X, Y, bowCx + 40, bowCy, 27, 16, 20)) {
        px(x, y, BOW[0], BOW[1], BOW[2], 1);
      }
      if (inRotEllipse(X, Y, bowCx, bowCy, 27, 16, -28)) {
        // 左翼亮部
        if (inRotEllipse(X, Y, bowCx - 4, bowCy - 4, 14, 8, -28)) px(x, y, BOW_DEEP[0] + 38, BOW_DEEP[1] + 44, BOW_DEEP[2] + 40, 1);
      }
      if (inCircle(X, Y, bowCx + 20, bowCy, 11)) {
        px(x, y, BOW[0], BOW[1], BOW[2], 1);
      }

      /* 8. 眼睛 */
      if (inRotEllipse(X, Y, 101, 138, 9, 12, 0) || inRotEllipse(X, Y, 155, 138, 9, 12, 0)) {
        px(x, y, DARK[0], DARK[1], DARK[2], 1);
      }
      /* 眼睛高光 */
      if (inCircle(X, Y - 4, 98, 133, 3.2) || inCircle(X, Y - 4, 152, 133, 3.2)) {
        px(x, y, 255, 255, 255, 1);
      }

      /* 9. 鼻 + 小嘴 */
      if (inRotEllipse(X, Y, 128, 157, 7.5, 5.5, 0)) {
        px(x, y, NOSE[0], NOSE[1], NOSE[2], 1);
      }
      /* 三瓣小嘴（两个下弧由两条细线段近似） */
      if (segDist(X, Y, 128, 166, 122, 172) < 2 || segDist(X, Y, 128, 166, 134, 172) < 2) {
        px(x, y, DARK[0], DARK[1], DARK[2], 0.85);
      }

      /* 10. 胡子：每边三条 */
      const WY = 148;
      if (segDist(X, Y, 66, WY - 6, 38, WY - 14) < 1.6 ||
          segDist(X, Y, 66, WY + 0, 36, WY + 0) < 1.6 ||
          segDist(X, Y, 66, WY + 6, 38, WY + 15) < 1.6 ||
          segDist(X, Y, 190, WY - 6, 218, WY - 14) < 1.6 ||
          segDist(X, Y, 190, WY + 0, 220, WY + 0) < 1.6 ||
          segDist(X, Y, 190, WY + 6, 218, WY + 15) < 1.6) {
        px(x, y, DARK[0], DARK[1], DARK[2], 0.92);
      }
    }
  }
}

/* ---------------- PNG 编码（零依赖） ---------------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(rgba, w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  // 每行前加 filter byte 0
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---------------- ICO 容器（PNG 压缩 256px 图标） ---------------- */

function encodeICO(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  const entry = Buffer.alloc(16);
  entry[0] = 0;   // width 256 → 0
  entry[1] = 0;   // height 256 → 0
  entry[2] = 0;   // palette
  entry[3] = 0;   // reserved
  entry.writeUInt16LE(1, 4);     // planes
  entry.writeUInt16LE(32, 6);    // bpp
  entry.writeUInt32LE(png.length, 8);  // size
  entry.writeUInt32LE(6 + 16, 12);     // offset
  return Buffer.concat([header, entry, png]);
}

/* ---------------- 下采样 + 写文件 ---------------- */

function downsample(src, from, to) {
  const out = new Uint8ClampedArray(to * to * 4);
  const f = Math.floor(from / to);
  for (let y = 0; y < to; y++) {
    for (let x = 0; x < to; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < f; sy++) {
        for (let sx = 0; sx < f; sx++) {
          const i = ((y * f + sy) * from + (x * f + sx)) * 4;
          r += src[i]; g += src[i + 1]; b += src[i + 2]; a += src[i + 3];
        }
      }
      const n = f * f, o = (y * to + x) * 4;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = a / n;
    }
  }
  return Buffer.from(out);
}

/* 任意比例面积平均缩放（用于 PWA 的 192/512，可不整除） */
function resizeArea(src, from, to) {
  const out = new Uint8ClampedArray(to * to * 4);
  const scale = from / to;
  for (let y = 0; y < to; y++) {
    for (let x = 0; x < to; x++) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      const sy0 = y * scale, sy1 = (y + 1) * scale;
      const sx0 = x * scale, sx1 = (x + 1) * scale;
      for (let sy = Math.floor(sy0); sy < Math.ceil(sy1); sy++) {
        for (let sx = Math.floor(sx0); sx < Math.ceil(sx1); sx++) {
          if (sx < 0 || sy < 0 || sx >= from || sy >= from) continue;
          const i = (sy * from + sx) * 4;
          r += src[i]; g += src[i + 1]; b += src[i + 2]; a += src[i + 3]; n++;
        }
      }
      if (!n) continue;
      const o = (y * to + x) * 4;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = a / n;
    }
  }
  return Buffer.from(out);
}

console.log('[icon] 绘制中（超采样 ' + SS + 'x，' + S + 'x' + S + '）...');
draw();
console.log('[icon] 下采样到 ' + SIZE + 'x' + SIZE + ' ...');
const small = downsample(canvas, S, SIZE);
const png = encodePNG(small, SIZE, SIZE);
const ico = encodeICO(png);

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'build');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(root, 'src', 'assets'), { recursive: true });
// PWA 需要 192px + 512px 图标（从超采样画布面积平均缩放）
const png512 = encodePNG(resizeArea(canvas, S, 512), 512, 512);
const png192 = encodePNG(resizeArea(canvas, S, 192), 192, 192);
fs.writeFileSync(path.join(root, 'src', 'assets', 'icon-512.png'), png512);
fs.writeFileSync(path.join(root, 'src', 'assets', 'icon-192.png'), png192);
fs.writeFileSync(path.join(outDir, 'icon.png'), png);
fs.writeFileSync(path.join(outDir, 'icon.ico'), ico);
fs.writeFileSync(path.join(root, 'src', 'assets', 'icon-256.png'), png);
console.log('[icon] 完成：');
console.log('[icon]   build/icon.ico              ' + ico.length + ' B');
console.log('[icon]   build/icon.png              ' + png.length + ' B');
console.log('[icon]   src/assets/icon-192.png     ' + png192.length + ' B');
console.log('[icon]   src/assets/icon-256.png     ' + png.length + ' B');
console.log('[icon]   src/assets/icon-512.png     ' + png512.length + ' B');
