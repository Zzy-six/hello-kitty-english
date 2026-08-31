/* ============================================================================
 * features/home.js — 首页（Hello Kitty 主视觉 + 四大功能入口）
 * ----------------------------------------------------------------------------
 * 页面职责很轻：展示主视觉和入口卡片，跳转逻辑集中在 Router。
 * 入口卡片数据即下方 ENTRIES 数组（★ ZyCode 改入口/加入口来这里）。
 * ============================================================================ */
(function (Feature) {
  'use strict';

  var App2 = window.App;

  /* 四大功能入口配置（顺序即显示顺序） */
  var ENTRIES = [
    { route: '#/quiz',       emoji: '🎯', name: '单词闯关', desc: '看图选词 · 赚星星', color: 'from-kitty-400 to-kitty-500' },
    { route: '#/dialogue',   emoji: '💬', name: '情景对话', desc: '跟 Kitty 聊日常',   color: 'from-sky-400 to-sky-500' },
    { route: '#/game',       emoji: '🍓', name: '单词消消乐', desc: '翻牌配对小游戏',  color: 'from-grape-400 to-grape-500' },
    { route: '#/progress',   emoji: '📊', name: '学习进度中心', desc: '星星记录看得见',  color: 'from-lemon-300 to-lemon-400' }
  ];

  Feature.Home = {
    mount: function (container) {
      var user = App2.Store.getCurrentUser();
      var stars = App2.Store.getStars();

      var entryCards = ENTRIES.map(function (e, i) {
        return '' +
          '<button data-route="' + e.route + '" class="kitty-card kitty-card-hover animate-fade-up group cursor-pointer p-5 text-left" style="animation-delay:' + (i * 0.08) + 's">' +
            '<div class="mb-3 flex items-start justify-between">' +
              '<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ' + e.color + ' text-3xl shadow-kitty transition-transform group-hover:scale-110 group-hover:-rotate-6">' + e.emoji + '</div>' +
              '<span class="text-lg opacity-60 transition-transform group-hover:rotate-12">🎀</span>' +
            '</div>' +
            '<div class="text-lg font-extrabold text-slate-700">' + e.name + '</div>' +
            '<div class="mt-1 text-xs text-slate-400">' + e.desc + '</div>' +
          '</button>';
      }).join('');

      var html =
        '<div class="mt-2 flex flex-col items-center gap-4">' +
          /* ---- 主视觉区（3D 可拖拽立绘，ugc 观赏体验）---- */
          '<div class="flex flex-col items-center gap-1">' +
            '<div class="mb-6 mt-4">' + App2.UI.Kitty3D.stage({ size: 210 }) + '</div>' +
            '<div class="pt-1 text-center">' +
              '<h1 class="kitty-title text-3xl font-extrabold sm:text-4xl">Kitty 英语乐园</h1>' +
              '<p class="mt-1.5 text-sm text-kitty-500/80">' +
                '<span class="font-bold">' + (user ? user.name + ' 你好呀~' : '嗨~') + '</span> · 和小猫一起开心学英语 🎀' +
              '</p>' +
            '</div>' +
          '</div>' +
          /* ---- 星星快照 ---- */
          '<div class="flex items-center gap-2 rounded-full border-2 border-kitty-200 bg-white/85 px-5 py-2 shadow-kitty">' +
            '<span class="animate-wiggle inline-block text-xl">⭐</span>' +
            '<span class="text-sm font-extrabold text-kitty-600">我的星星：' + stars + ' 颗</span>' +
            '<span class="rounded-full bg-kitty-100 px-2.5 py-0.5 text-[11px] font-bold text-kitty-500">' +
               (stars >= 100 ? '甜心学霸' : stars >= 50 ? '樱花学员' : stars >= 20 ? '蝴蝶结学徒' : '粉嫩新手') +
            '</span>' +
          '</div>' +
          /* ---- 四大入口 ---- */
          '<div class="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">' + entryCards + '</div>' +
          /* ---- 今日单词小贴士 ---- */
          '<div class="kitty-card mt-1 flex w-full flex-col items-center gap-2 p-4">' +
            '<div class="text-xs font-bold tracking-widest text-kitty-400">📌 今日单词推荐</div>' +
            '<div id="k-tip" class="flex w-full items-center justify-center gap-3"></div>' +
          '</div>' +
          '<p class="pb-2 text-center text-[11px] leading-5 text-slate-400">' +
            '✨ 零服务器 · 完全离线 · 学习数据保存在本机浏览器（IndexedDB）<br/>' +
            '主形象「Hello Kitty」取自公开素材 · 仅作学习演示，商用需取得 Sanrio 授权' +
          '</p>' +
        '</div>';

      App2.Utils.render(container, html);

      /* 绑定 3D 立绘拖拽交互 */
      App2.UI.Kitty3D.bind(container);

      /* 绑定入口跳转 */
      container.querySelectorAll('[data-route]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          App2.Audio.chime('click');
          App2.Router.go(btn.getAttribute('data-route'));
        });
      });

      /* 今日单词：每天换一个推荐词 */
      var dateseed = new Date().getDate();
      var words = App2.Data.Words.list('all');
      var tip = words[dateseed % words.length];
      var tipBox = container.querySelector('#k-tip');
      tipBox.innerHTML =
        '<span class="text-3xl align-middle">' + tip.emoji + '</span>' +
        '<span class="text-xl font-extrabold text-slate-700">' + App2.Utils.esc(tip.en) + '</span>' +
        '<span class="text-xs text-slate-400">' + App2.Utils.esc(tip.ipa) + '</span>' +
        '<span class="text-sm font-bold text-kitty-500">' + App2.Utils.esc(tip.zh) + '</span>';
      tipBox.appendChild(App2.UI.Components.speakBtn(tip.en, { size: 34 }));

      /* 拖过一次后隐藏「按住拖一拖」提示条 */
      var stageEl = container.querySelector('.kt-stage');
      if (stageEl) {
        stageEl.addEventListener('pointerdown', function () {
          var hint = stageEl.querySelector('.kt-hint');
          if (hint) hint.classList.add('kt-hidden');
        }, { once: true });
      }
    }
  };
})(window.App.Features = window.App.Features || {});
