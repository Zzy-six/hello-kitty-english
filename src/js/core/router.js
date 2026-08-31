/* ============================================================================
 * core/router.js — 极简 hash 路由（零依赖、双击 index.html 也能用）
 * ----------------------------------------------------------------------------
 * 路由表模式：#/路径/参数?id=xxx
 *   · features/*.js 通过 register(path, feature) 注册页面
 *   · feature = { mount(container, params) → 可选返回清理函数 }
 *   · 切换页面时自动调用上一个页面的清理函数（定时器/监听器归位）
 *
 * ★ ZyCode 新增页面的步骤：
 *   1) 在 js/features/ 新建页面模块（挂到 App.Features.xxx）
 *   2) 在 app.js 的注册区加一行 Router.register('#/xxx', App.Features.Xxx)
 *   3) 在 index.html 加一行 <script src="./js/features/xxx.js"></script>
 * ============================================================================ */
(function (Router) {
  'use strict';

  var routes = {};     // path -> feature
  var container = null;
  var cleanup = null;  // 当前页面的清理函数
  var currentPath = '';

  /** 注册路由：path 形如 '#/quiz/play'（内部去掉 #，与 parseHash 的路径格式对齐） */
  Router.register = function (path, feature) {
    routes[String(path).replace(/^#/, '')] = feature;
  };

  /** 解析 location.hash → { path, params } */
  function parseHash() {
    var raw = location.hash || '';
    if (!raw || raw === '#') raw = '#/home';
    raw = raw.replace(/^#/, '');
    var qIdx = raw.indexOf('?');
    var params = {};
    if (qIdx > -1) {
      var query = raw.slice(qIdx + 1);
      raw = raw.slice(0, qIdx);
      query.split('&').forEach(function (pair) {
        if (!pair) return;
        var kv = pair.split('=');
        params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
    }
    return { path: raw || '/home', params: params };
  }

  function dispatch() {
    var parsed = parseHash();
    var path = parsed.path;
    var feature = routes[path];

    // 未注册的路径回首页
    if (!feature) {
      if (path !== '/home') {
        location.hash = '#/home';
        return;
      }
      feature = routes['/home'];
    }

    // 先清理旧页面
    if (cleanup) { try { cleanup(); } catch (e) { console.error('[router] cleanup', e); } cleanup = null; }
    App.Audio.stop(); // 换页停掉未读完的发音

    currentPath = path;
    container.innerHTML = ''; // 清空再挂载
    var fn = feature.mount(container, parsed.params);
    if (typeof fn === 'function') cleanup = fn;
    window.scrollTo(0, 0);
    App.Utils.bus.emit('route', path);
  }

  /** 程序化跳转 */
  Router.go = function (path) {
    var p = String(path || '#/home');
    if (location.hash === p) dispatch(); // 同一路由强制刷新
    else location.hash = p;
  };

  Router.current = function () { return currentPath; };

  /** 启动路由（app.js 调用） */
  Router.start = function (el) {
    container = el;
    window.addEventListener('hashchange', dispatch);
    dispatch();
  };
})(window.App.Router = window.App.Router || {});
