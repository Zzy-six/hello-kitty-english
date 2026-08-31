/* ============================================================================
 * core/db.js — IndexedDB 底层封装（Promise 化）+ localStorage 降级方案
 * ----------------------------------------------------------------------------
 * 设计目标：
 *   1. 零服务器：全部学习数据存浏览器本地，关闭页面/断网都不丢。
 *   2. 简单可靠的键值 API，上层 Store 不需要懂 IndexedDB 事务细节。
 *   3. 兜底：极少数隐私模式等场景 IndexedDB 不可用时，自动降级为
 *      localStorage 存储（同样持久），保证应用永不白屏。
 *
 * 数据库结构（库名 kittyEnglishDB）：
 *   users      学习者档案   { id, name, avatar, createdAt }
 *   wordStats  单词对错记录 { id: "用户id::单词id", userId, wordId, correct, wrong, lastAt }
 *   dailyStats 每日学习统计 { id: "用户id::日期", userId, date, seconds, correct, wrong, stars }
 *   meta       用户汇总数据 { id: 用户id, stars, createdAt }
 * ============================================================================ */
(function (DB) {
  'use strict';

  var DB_NAME = 'kittyEnglishDB';
  var DB_VERSION = 1;

  /* 四个对象仓库名 + wordStats/dailyStats 上按 userId 的索引 */
  var STORES = ['users', 'wordStats', 'dailyStats', 'meta'];

  var idb = null;          // 原生 IDBDatabase 实例
  var fallbackData = null; // 降级模式下的 localStorage 镜像
  var usingFallback = false;
  var readyPromise = null;

  /* ---------------- 打开数据库 ---------------- */

  function open() {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise(function (resolve) {
      var failed = false;
      try {
        if (!window.indexedDB) failed = true;
      } catch (e) { failed = true; }

      if (failed) { useFallback(); return resolve(); }

      var req;
      try {
        req = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (e) { useFallback(); return resolve(); }

      // 首次安装/版本升级：建表 + 索引
      req.onupgradeneeded = function (ev) {
        var db = ev.target.result;
        STORES.forEach(function (name) {
          if (!db.objectStoreNames.contains(name)) {
            var store = db.createObjectStore(name, { keyPath: 'id' });
            if (name === 'wordStats' || name === 'dailyStats') {
              store.createIndex('userId', 'userId', { unique: false });
            }
          }
        });
      };
      req.onsuccess = function () { idb = req.result; resolve(); };
      req.onerror = function () { useFallback(); resolve(); };
      req.onblocked = function () { useFallback(); resolve(); };
    });
    return readyPromise;
  }

  /** 启用 localStorage 降级存储 */
  function useFallback() {
    usingFallback = true;
    try {
      fallbackData = JSON.parse(localStorage.getItem('kittyEnglishDB') || 'null') || {};
    } catch (e) { fallbackData = {}; }
    STORES.forEach(function (s) { if (!fallbackData[s]) fallbackData[s] = {}; });
  }

  function saveFallback() {
    try { localStorage.setItem('kittyEnglishDB', JSON.stringify(fallbackData)); } catch (e) { /* 空间满时静默 */ }
  }

  /* ---------------- 通用操作 API（全部返回 Promise） ---------------- */

  /** 按 id 取一条记录 */
  DB.get = function (store, id) {
    if (usingFallback) return Promise.resolve(fallbackData[store][id] || null);
    return new Promise(function (resolve, reject) {
      var r = idb.transaction(store, 'readonly').objectStore(store).get(id);
      r.onsuccess = function () { resolve(r.result || null); };
      r.onerror = function () { reject(r.error); };
    });
  };

  /** 写入/更新一条记录（record 必须带 id 字段） */
  DB.put = function (store, record) {
    if (usingFallback) { fallbackData[store][record.id] = record; saveFallback(); return Promise.resolve(record); }
    return new Promise(function (resolve, reject) {
      var r = idb.transaction(store, 'readwrite').objectStore(store).put(record);
      r.onsuccess = function () { resolve(record); };
      r.onerror = function () { reject(r.error); };
    });
  };

  /** 删除一条记录 */
  DB.delete = function (store, id) {
    if (usingFallback) { delete fallbackData[store][id]; saveFallback(); return Promise.resolve(); }
    return new Promise(function (resolve, reject) {
      var r = idb.transaction(store, 'readwrite').objectStore(store).delete(id);
      r.onsuccess = function () { resolve(); };
      r.onerror = function () { reject(r.error); };
    });
  };

  /** 按 userId 索引取整组记录（wordStats / dailyStats 专用） */
  DB.byUser = function (store, userId) {
    if (usingFallback) {
      var out = [];
      Object.keys(fallbackData[store]).forEach(function (k) {
        if (fallbackData[store][k].userId === userId) out.push(fallbackData[store][k]);
      });
      return Promise.resolve(out);
    }
    return new Promise(function (resolve, reject) {
      var idx = idb.transaction(store, 'readonly').objectStore(store).index('userId');
      var r = idx.getAll(userId);
      r.onsuccess = function () { resolve(r.result || []); };
      r.onerror = function () { reject(r.error); };
    });
  };

  /** 取整个仓库全部记录（users 仓小，直接全取） */
  DB.all = function (store) {
    if (usingFallback) {
      return Promise.resolve(Object.keys(fallbackData[store]).map(function (k) { return fallbackData[store][k]; }));
    }
    return new Promise(function (resolve, reject) {
      var r = idb.transaction(store, 'readonly').objectStore(store).getAll();
      r.onsuccess = function () { resolve(r.result || []); };
      r.onerror = function () { reject(r.error); };
    });
  };

  /** 清空某个仓库（重置进度时用，注意会清所有人！上层会按用户过滤） */
  DB.clearStore = function (store) {
    if (usingFallback) { fallbackData[store] = {}; saveFallback(); return Promise.resolve(); }
    return new Promise(function (resolve, reject) {
      var r = idb.transaction(store, 'readwrite').objectStore(store).clear();
      r.onsuccess = function () { resolve(); };
      r.onerror = function () { reject(r.error); };
    });
  };

  /** 当前是否处于 localStorage 降级模式（进度中心会提示用户） */
  DB.isFallback = function () { return usingFallback; };

  /** 初始化入口：app.js 启动时 await 一次 */
  DB.ready = open;
})(window.App.DB = window.App.DB || {});
