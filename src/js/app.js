/* ============================================================================
 * app.js — 应用启动入口（boot）
 * ----------------------------------------------------------------------------
 * 职责：加载完成后的初始化：
 *   1. 挂载樱花飘落装饰 / 解锁声音
 *   2. 打开 IndexedDB、加载当前学员档案
 *   3. 渲染顶部栏（logo、星星、学员头像）
 *   4. 注册所有路由 → 启动路由 → 启动学习计时器
 *   5. 首次使用弹出欢迎取名弹窗
 * ★ ZyCode 新增页面时：先在 features/ 下写好 App.Features.XXX，
 *   再到下方「路由注册区」加一行 Router.register(...) 即可。
 * ============================================================================ */
(function () {
  'use strict';

  var App2 = window.App;
  var headerEl, starChipEl, userChipEl;

  /* ---------------- 顶部栏 ---------------- */

  function renderHeader() {
    var user = App2.Store.getCurrentUser();
    var stars = App2.Store.getStars();
    var starText = stars >= 100 ? Math.floor(stars / 100) + '+' : String(stars);
    if (starChipEl) {
      starChipEl.innerHTML =
        '<span class="text-base leading-none">⭐</span>' +
        '<span class="font-extrabold text-kitty-600">' + starText + '</span>';
    }
    if (userChipEl) {
      userChipEl.innerHTML = user
        ? '<span class="text-lg leading-none">' + (user.avatar || '🐰') + '</span>' +
          '<span class="max-w-[72px] truncate text-xs font-bold text-slate-500">' + App2.Utils.esc(user.name) + '</span>'
        : '<span class="text-lg leading-none">🐰</span><span class="text-xs font-bold text-slate-400">未登录</span>';
    }
  }

  function buildHeader() {
    headerEl.innerHTML =
      '<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-2 py-2.5">' +
        '<a href="#/home" class="flex items-center gap-2 no-underline">' +
          '<span class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-kitty" style="border-radius:9999px">' + App2.UI.Kitty.head({ mood: 'normal', size: 30 }) + '</span>' +
          '<span class="text-lg font-extrabold tracking-wide text-kitty-600">Kitty 英语乐园</span>' +
        '</a>' +
        '<div class="flex items-center gap-2">' +
          '<button id="h-stars" class="flex items-center gap-1 rounded-full border-2 border-amber-100 bg-white/90 py-1 pl-2 pr-3 shadow-sm no-underline" title="我的星星">' +
            '<span class="text-base leading-none">⭐</span><span class="font-extrabold text-kitty-600">0</span>' +
          '</button>' +
          '<button id="h-user" class="flex items-center gap-1.5 rounded-full border-2 border-kitty-100 bg-white/90 py-1 pl-2 pr-2.5 shadow-sm no-underline" title="学习档案">' +
            '<span class="text-lg leading-none">🐰</span><span class="max-w-[72px] truncate text-xs font-bold text-slate-500">—</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    starChipEl = headerEl.querySelector('#h-stars');
    userChipEl = headerEl.querySelector('#h-user');
    starChipEl.addEventListener('click', function () {
      App2.Audio.chime('click');
      App2.Router.go('#/progress');
    });
    userChipEl.addEventListener('click', function () {
      App2.Audio.chime('click');
      App2.UI.Components.userModal(); // 切换/新增/删除学员
    });
    renderHeader();
  }

  /* ---------------- 路由注册区（★ ZyCode 新页面在此加一行） ---------------- */

  function registerRoutes() {
    App2.Router.register('#/home', App2.Features.Home);
    App2.Router.register('#/quiz', App2.Features.Quiz);
    App2.Router.register('#/quiz/level', App2.Features.Quiz);
    App2.Router.register('#/quiz/play', App2.Features.Quiz);
    App2.Router.register('#/dialogue', App2.Features.Dialogue);
    App2.Router.register('#/dialogue/chat', App2.Features.Dialogue);
    App2.Router.register('#/game', App2.Features.Game);
    App2.Router.register('#/game/play', App2.Features.Game);
    App2.Router.register('#/progress', App2.Features.Progress);
  }

  /* ---------------- 启动 ---------------- */

  function boot() {
    headerEl = document.getElementById('app-header');
    buildHeader();
    registerRoutes();
    App2.Router.start(document.getElementById('app'));
    App2.Timer.start();
    renderHeader();

    // 星星/进度变化 → 刷新顶部栏
    App2.Utils.bus.on('stars', renderHeader);
    App2.Utils.bus.on('progress', renderHeader);
    App2.Utils.bus.on('user', renderHeader);

    // 首次使用（还没有任何学员）→ 欢迎取名
    if (!App2.Store.getCurrentUser() && App2.Store.userCount() === 0) {
      App2.UI.Components.welcomeModal();
    }

    // 注册 Service Worker（仅 http/https：让手机/网页可「添加到主屏幕」并离线使用）。
    // Electron 的 file:// 及本地双击打开不满足 https，故自动跳过，不影响桌面版。
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function () {
        // 注册失败不致命（可能是不安全的测试环境），静默忽略即可
      });
    }

    // Electron 桌面端冒烟自检：主进程监听 console 标记判定成败（网页版无此标记，不受影响）
    if (/Electron/i.test(navigator.userAgent)) {
      setTimeout(function () {
        var el = document.getElementById('app');
        var mounted = !!(el && el.childElementCount > 0);
        if (mounted) console.log('[SMOKE] OK');
        else console.log('[SMOKE] ' + JSON.stringify({ mounted: mounted, kids: el ? el.childElementCount : -1, title: document.title }));
      }, 800);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    App2.UI.Decor.init();          // 樱花飘落
    App2.Audio.unlock();           // 首次点击时解锁 WebAudio
    App2.DB.ready().then(function () {
      return App2.Store.init();
    }).then(function () {
      boot();
    }).catch(function (err) {
      // 极端的持久化失败：仍要可用（进度实时保存不可用，其余功能正常）
      console.error('[app] boot failed:', err);
      boot();
    });
  });
})();
