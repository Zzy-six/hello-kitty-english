/* ============================================================================
 * electron/main.js — 桌面端主进程（成品 exe 的入口）
 * ----------------------------------------------------------------------------
 * 职责：创建窗口加载 src/index.html（与网页版完全同一套代码，零改动复用）。
 * 启动自测：npm start -- --smoke 会加载页面，由页面 boot() 完成后通过
 *           console.log('[SMOKE] ...') 上报结果，主进程监听后打印
 *           [SMOKE] OK 并退出（成功退出码 0）。
 *           （不用 executeJavaScript 注入脚本：无 GPU 环境下注入不稳定，
 *             改由页面主动上报 + 事件监听，最稳健。）
 *
 * ★ ZyCode 扩展点：
 *   · 需要「读本地单词包 / 导出学习报告 / 自动更新」等原生能力时，
 *     在主进程加 ipcMain.handle(...)，并在 preload.js 里用 contextBridge 暴露，
 *     页面里通过 window.kittyAPI.xxx 调用（不要直接开 nodeIntegration）。
 * ============================================================================ */
'use strict';

const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

const SMOKE = process.argv.includes('--smoke');
const isDev = !app.isPackaged; // 打包后为 false；开发时 true

/* 无 GPU / 远程 / 虚拟机会导致显卡上下文崩坏，彻底禁用硬件加速保证稳定运行 */
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');

function createWindow() {
  const win = new BrowserWindow({
    title: 'Kitty英语乐园',
    width: 1120,
    height: 780,
    minWidth: 380,
    minHeight: 640,
    autoHideMenuBar: true,
    backgroundColor: '#fff0f6',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  win.once('ready-to-show', () => win.show());
  window = win;

  // 页面里的外链一律交给系统浏览器，避免在 app 内打开新窗口
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  return win;
}

/* 启动自测（--smoke）：监听页面上报的结果，判定桌面端骨架是否正常 */
function runSmoke(win) {
  let done = false;
  const timeout = setTimeout(() => {
    if (!done) { console.error('[SMOKE] TIMEOUT: 页面 20s 内未上报'); app.exit(1); }
  }, 20000);

  // 兼容 electron 新旧 console-message 签名：旧(event,level,message,...) / 新(event,details)
  win.webContents.on('console-message', function (event, level, message) {
    if (done) return;
    const m = (typeof message === 'string') ? message : (event && event.message);
    if (typeof m !== 'string' || m.indexOf('[SMOKE]') !== 0) return;
    done = true;
    clearTimeout(timeout);
    const body = m.slice(7).trim();
    if (body === 'OK') { console.log('[SMOKE] OK'); app.exit(0); }
    else { console.error('[SMOKE] FAIL ' + body); app.exit(1); }
  });
}

let window = null;

app.whenReady().then(() => {
  Menu.setApplicationMenu(null); // 纯学习应用，隐藏菜单栏
  app.setAppUserModelId('com.kitty.englishgarden');

  const win = createWindow();
  if (SMOKE) runSmoke(win);
  else if (isDev) win.webContents.openDevTools({ mode: 'detach' });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
