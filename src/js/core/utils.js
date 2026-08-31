/* ============================================================================
 * core/utils.js — 全局命名空间 + 通用工具函数
 * ----------------------------------------------------------------------------
 * 项目采用「经典 script + 全局命名空间」模式（无构建、双击 index.html 即可跑）。
 * 所有模块都挂载到 window.App 下，边界清晰：
 *   App.Utils  工具函数（本文件）
 *   App.DB     IndexedDB 底层封装
 *   App.Store  学习进度业务存储
 *   App.Audio  发音 / 音效
 *   App.Timer  学习时长统计
 *   App.Router 页面路由
 *   App.Data   词库数据
 *   App.UI     视觉组件
 *   App.Features 各功能页面
 * ============================================================================ */
window.App = window.App || {};

(function (Utils) {
  'use strict';

  /** 生成短随机 id（用于用户 id 等） */
  Utils.uid = function (prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  };

  /** Fisher-Yates 洗牌（返回新数组，不改原数组） */
  Utils.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /** 从数组中随机取 n 个（不重复） */
  Utils.sample = function (arr, n) {
    return Utils.shuffle(arr).slice(0, Math.min(n, arr.length));
  };

  /** 区间随机整数 [min, max] */
  Utils.randInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /** HTML 转义（所有动态文本入模板前过一遍，防止内容里出现 < > 破坏页面） */
  Utils.esc = function (str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /** 把 HTML 字符串转成 DOM 元素（取第一个元素节点） */
  Utils.el = function (html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  /** 清空并渲染容器 */
  Utils.render = function (container, html) {
    container.innerHTML = html;
    return container.firstElementChild || container;
  };

  /** 今天日期字符串（本地时区）YYYY-MM-DD */
  Utils.today = function () {
    const d = new Date();
    const p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  };

  /** 返回从今天往前数第 offset 天的日期字符串（offset=0 即今天） */
  Utils.dateOffset = function (offset) {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  };

  /** 只显示月-日的短标签，例如 08-31 */
  Utils.shortDate = function (dateStr) {
    return dateStr.slice(5);
  };

  /** 秒数 → "x分y秒" 人性化文本 */
  Utils.fmtDuration = function (totalSec) {
    const m = Math.floor(totalSec / 60);
    const s = Math.round(totalSec % 60);
    if (m === 0) return s + '秒';
    return m + '分' + (s > 0 ? s + '秒' : '');
  };

  /** 百分比文本（自动取整） */
  Utils.pct = function (part, total) {
    if (!total) return '0%';
    return Math.round((part / total) * 100) + '%';
  };

  /* ------------------------------------------------------------------
   * 极简事件总线：跨模块通知（如星星变化 → 顶栏刷新）
   * 用法：App.Utils.bus.on('stars', fn) / App.Utils.bus.emit('stars')
   * ------------------------------------------------------------------ */
  const listeners = {};
  Utils.bus = {
    on: function (evt, fn) {
      (listeners[evt] = listeners[evt] || []).push(fn);
      return function off() { // 返回取消订阅函数
        const arr = listeners[evt] || [];
        const i = arr.indexOf(fn);
        if (i > -1) arr.splice(i, 1);
      };
    },
    emit: function (evt, payload) {
      (listeners[evt] || []).forEach(function (fn) {
        try { fn(payload); } catch (e) { console.error('[bus]', evt, e); }
      });
    }
  };

  /** 延时（配合 async/await） */
  Utils.sleep = function (ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  };
})(window.App.Utils = window.App.Utils || {});
