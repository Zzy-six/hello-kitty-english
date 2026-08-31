/* ============================================================================
 * electron/preload.js — 页面与主进程之间的极简桥
 * ----------------------------------------------------------------------------
 * 网页版在纯浏览器也能跑，因此页面本身不依赖本桥。
 * 这里只暴露只读环境信息，方便将来扩展（见 main.js 顶部注释）。
 * ============================================================================ */
'use strict';

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('kittyAPI', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome
  }
});
