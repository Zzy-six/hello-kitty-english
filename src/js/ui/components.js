/* ============================================================================
 * ui/components.js — 通用 UI 组件（页面头 / 弹窗 / Kitty反馈 / 庆祝特效）
 * ----------------------------------------------------------------------------
 * 全部组件为纯函数返回 DOM 元素，页面模块直接复用：
 *   App.UI.Components.pageHeader(title, backTo)   子页面顶部栏（返回按钮）
 *   App.UI.Components.modal({content, dark})      通用全屏弹窗 → {root, close}
 *   App.UI.Components.feedback(kittyInfo)         答题反馈弹窗（开心Kitty/委屈Kitty）
 *   App.UI.Components.celebrate(el, count)        星星爱心爆裂特效
 *   App.UI.Components.speakBtn(text, size)        圆形发音按钮
 *   App.UI.Components.progressBar(value, cls)     粉色进度条
 *   App.UI.Components.userModal()                 账号管理弹窗（退出/注册/删除/管理员面板）
 * ============================================================================ */
(function (C) {
  'use strict';

  var U = null; // 运行时再绑定，避免加载顺序问题

  function u() {
    if (!U) U = App.Utils;
    return U;
  }

  /* ---------------- 子页面顶部栏 ---------------- */

  /** 子页面顶部栏（返回按钮用事件委托绑定，只注册一次） */
  var backBound = false;
  function bindBackNav() {
    if (backBound) return;
    backBound = true;
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-back]') : null;
      if (btn && btn.id === 'k-back') App.Router.go(btn.getAttribute('data-back') || '#/home');
    });
  }

  /**
   * @param {string} title 页面标题
   * @param {string} backTo 返回目标路由（默认 #/home）
   * @param {string} [rightHtml] 右侧自定义内容（如说明文字）
   * @returns {string} 页面顶部栏 HTML（可直接拼进页面模板）
   */
  C.pageHeader = function (title, backTo, rightHtml) {
    bindBackNav();
    return '' +
      '<div class="flex items-center gap-3 py-2">' +
        '<button id="k-back" data-back="' + u().esc(backTo || '#/home') + '" class="btn-ghost flex h-11 w-11 items-center justify-center text-xl" aria-label="返回">' +
          '<span class="text-kitty-600">←</span>' +
        '</button>' +
        '<h1 class="text-xl font-extrabold tracking-wide text-kitty-600 sm:text-2xl">' + u().esc(title) + '</h1>' +
        '<div class="ml-auto text-right text-xs text-kitty-400">' + (rightHtml || '') + '</div>' +
      '</div>';
  };

  /* ---------------- 通用弹窗 ---------------- */

  /**
   * @param {object} opts { content: 弹窗内部HTML, dark: 是否点击遮罩关闭, color: 遮罩色 }
   * @returns {{root: Element, close: Function}}
   */
  C.modal = function (opts) {
    opts = opts || {};
    var root = u().el(
      '<div class="overlay" style="animation:k-fade-up .3s ease both">' +
        '<div class="animate-pop kitty-card max-h-[88vh] w-full max-w-md overflow-y-auto p-0">' + (opts.content || '') + '</div>' +
      '</div>'
    );
    document.body.appendChild(root);
    var close = function () { root.remove(); };
    if (opts.dark) {
      root.addEventListener('click', function (e) { if (e.target === root) close(); });
    }
    return { root: root, close: close };
  };

  /* ---------------- 答题反馈弹窗（Kitty 开心/委屈 + 自动关闭） ---------------- */

  /**
   * @param {object} info {
   *   mood: 'happy'|'sad',       Kitty 表情
   *   title: 主文案（如 答对啦！/ 差一点点）
   *   desc: 副文案（正确单词回顾 / 鼓励语）
   *   wordHtml: 单词回顾卡片HTML（可空）
   *   autoClose: 毫秒，自动关闭时间（默认1600）
   * }
   * @returns {Promise} 关闭后 resolve
   */
  C.feedback = function (info) {
    var mood = info.mood === 'sad' ? 'sad' : 'happy';
    var content =
      '<div class="flex flex-col items-center gap-3 p-8 text-center">' +
        '<div class="' + (mood === 'happy' ? 'animate-jump' : 'animate-shake') + '">' +
          App.UI.Kitty.head({ mood: mood, size: 150 }) +
        '</div>' +
        '<div class="text-2xl font-extrabold ' + (mood === 'happy' ? 'text-kitty-500' : 'text-rose-500') + '">' + u().esc(info.title || (mood === 'happy' ? '答对啦！' : '差一点点')) + '</div>' +
        (info.wordHtml ? '<div class="w-full rounded-2xl bg-kitty-50 px-4 py-3">' + info.wordHtml + '</div>' : '') +
        '<div class="text-sm text-kitty-500/80">' + u().esc(info.desc || '') + '</div>' +
      '</div>';
    var m = C.modal({ content: content, dark: false });
    return new Promise(function (resolve) {
      setTimeout(function () { m.close(); resolve(); }, info.autoClose || 1600);
    });
  };

  /* ---------------- 星星/爱心爆裂庆祝特效 ---------------- */

  var PARTICLES = ['⭐', '✨', '💖', '🎀', '🌟', '🍓', '🌸'];

  /**
   * 从屏幕中心四周爆裂出星星
   * @param {number} count 粒子数
   */
  C.celebrate = function (count) {
    var n = count || 14;
    for (var i = 0; i < n; i++) {
      var p = u().el('<div class="burst-particle" style="font-size:' + u().randInt(16, 30) + 'px"></div>');
      p.textContent = PARTICLES[i % PARTICLES.length];
      document.body.appendChild(p);
      var ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      var dist = u().randInt(110, 210);
      p.style.left = '50%';
      p.style.top = '42%';
      p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      p.style.animation = 'k-burst 0.9s ease-out both';
      p.style.animationDelay = (Math.random() * 0.12) + 's';
      (function (node) {
        setTimeout(function () { node.remove(); }, 1150);
      })(p);
    }
  };

  /* ---------------- 圆形发音按钮 ---------------- */

  /**
   * @param {string} text 点击朗读的英文
   * @param {object} opts { size: 像素, sound: 点击是否加音效 }
   */
  C.speakBtn = function (text, opts) {
    opts = opts || {};
    var size = opts.size || 44;
    var btn = u().el(
      '<button class="flex items-center justify-center rounded-full bg-gradient-to-br from-kitty-300 to-kitty-500 text-white shadow-kitty transition-transform active:scale-90" ' +
      'style="width:' + size + 'px;height:' + size + 'px" aria-label="发音">' +
        '<svg width="' + Math.round(size * 0.5) + '" height="' + Math.round(size * 0.5) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>' +
          '<path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a9 9 0 0 1 0 12"/>' +
        '</svg>' +
      '</button>'
    );
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (opts.sound !== false) App.Audio.chime('click');
      App.Audio.speak(text);
      // 触发声波动画
      btn.classList.remove('animate-sound');
      void btn.offsetWidth;
      btn.classList.add('animate-sound');
    });
    return btn;
  };

  /* ---------------- 粉色进度条 ---------------- */

  /** @param {number} value 0-100 */
  C.progressBar = function (value) {
    var v = Math.max(0, Math.min(100, value || 0));
    return u().el(
      '<div class="track h-2.5 w-full"><div class="fill" style="width:' + v + '%"></div></div>'
    );
  };

  /* ---------------- 账号管理弹窗 ---------------- */

  /** 我的账号：退出登录 / 注册新账号 / 删除我的账号（管理员多一个本机账号面板） */
  C.userModal = function () {
    var cur = App.Store.getCurrentUser();
    var isAdmin = App.Store.isAdmin();
    if (!cur) return;

    var roleBadge = isAdmin
      ? '<span class="ml-2 rounded-full bg-gradient-to-r from-amber-300 to-kitty-400 px-2 py-0.5 text-[10px] font-extrabold text-white">👑 管理员</span>'
      : '';
    var content =
      '<div class="p-6">' +
        '<div class="mb-3 flex items-center justify-between">' +
          '<h2 class="text-lg font-extrabold text-kitty-600">🎀 我的账号</h2>' +
          '<button data-close class="flex h-9 w-9 items-center justify-center rounded-full bg-kitty-50 text-lg text-kitty-500 hover:bg-kitty-100">✕</button>' +
        '</div>' +
        '<div class="flex items-center gap-3 rounded-2xl border-2 border-kitty-200 bg-kitty-50 px-4 py-3">' +
          '<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl">' + (cur.avatar || '🐰') + '</div>' +
          '<div class="min-w-0 flex-1">' +
            '<div class="truncate font-extrabold text-slate-700">' + u().esc(cur.name) + roleBadge + '</div>' +
            '<div class="text-xs text-slate-400">账号：' + u().esc(cur.username || '—') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="mt-4 text-xs leading-5 text-slate-400">💾 你的学习数据（单词、星星、时长）随账号保存在<b>本机</b>，关掉页面、断开网络都不会丢。换设备请用「学习进度中心 → 数据同步」。</div>' +
        '<div class="mt-4 flex flex-col gap-2">' +
          '<button id="k-logout" class="btn-ghost w-full py-2.5 text-sm">🚪 退出登录（换账号）</button>' +
          '<button id="k-register" class="btn-ghost w-full py-2.5 text-sm">✨ 注册新账号</button>' +
          (isAdmin
            ? '<button id="k-super" class="btn-ghost w-full py-2.5 text-sm">👑 本机账号管理（管理员）</button>'
            : '<button id="k-del" class="btn-ghost w-full py-2.5 text-sm text-rose-400">🗑️ 删除我的账号（含全部数据）</button>') +
        '</div>' +
      '</div>';

    var m = C.modal({ content: content, dark: true });
    m.root.querySelector('[data-close]').addEventListener('click', m.close);
    m.root.querySelector('#k-logout').addEventListener('click', function () {
      App.Store.logout().then(function () {
        m.close();
        App.Audio.chime('click');
        App.Router.go('#/auth');
      });
    });
    m.root.querySelector('#k-register').addEventListener('click', function () {
      m.close();
      App.Router.go('#/auth/register');
    });
    var delBtn = m.root.querySelector('#k-del');
    if (delBtn) {
      delBtn.addEventListener('click', function () {
        if (!window.confirm('确定删除账号「' + cur.name + '」和它在本机的全部学习数据吗？此操作不可恢复。')) return;
        var pwd = window.prompt('为确保安全，请输入「' + cur.name + '」的登录密码：');
        if (pwd === null) return;
        App.Store.verifyPassword(pwd).then(function (ok) {
          if (!ok) { window.alert('密码不对，没有删除。'); return false; }
          return App.Store.deleteUser(cur.id).then(function () {
            m.close();
            App.Router.go('#/auth');
          }).catch(function (err) { window.alert(err.message || '删除失败。'); });
        }).catch(function () {});
      });
    }
    var superBtn = m.root.querySelector('#k-super');
    if (superBtn) {
      superBtn.addEventListener('click', function () {
        App.Store.listUsers().then(function (users) {
          var rows = users.map(function (u) {
            var isAdminRow = u.role === 'admin';
            return '<div class="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5">' +
              '<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kitty-50 text-xl">' + u.avatar + '</div>' +
              '<div class="min-w-0 flex-1">' +
                '<div class="truncate text-sm font-bold text-slate-700">' + u().esc(u.name) +
                  (isAdminRow ? ' <span class="text-[10px] text-amber-500">👑 管理员</span>' : '') + '</div>' +
                '<div class="text-[11px] text-slate-400">' + u().esc(u.username || '—') + ' · ' + new Date(u.createdAt).toLocaleDateString() + '</div>' +
              '</div>' +
              (isAdminRow
                ? '<span class="text-[11px] text-slate-300">受保护</span>'
                : '<button data-del="' + u.id + '" class="shrink-0 rounded-full border-2 border-rose-100 px-3 py-1 text-xs font-bold text-rose-400">删除</button>') +
            '</div>';
          }).join('');
          var content2 =
            '<div class="p-6">' +
              '<div class="mb-3 flex items-center justify-between">' +
                '<h2 class="text-lg font-extrabold text-kitty-600">👑 本机账号列表</h2>' +
                '<button data-close class="flex h-9 w-9 items-center justify-center rounded-full bg-kitty-50 text-lg text-kitty-500 hover:bg-kitty-100">✕</button>' +
              '</div>' +
              '<div class="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">' + rows + '</div>' +
            '</div>';
          var m2 = C.modal({ content: content2, dark: true });
          m2.root.querySelector('[data-close]').addEventListener('click', m2.close);
          m2.root.querySelectorAll('[data-del]').forEach(function (b) {
            b.addEventListener('click', function () {
              var uid = b.getAttribute('data-del');
              var target = users.find(function (x) { return x.id === uid; });
              if (!window.confirm('确定删除账号「' + (target ? target.name : '') + '」及其全部学习数据吗？')) return;
              App.Store.deleteUser(uid).then(function () {
                m2.close();
                userModal();
              }).catch(function (err) { window.alert(err.message || '删除失败。'); });
            });
          });
        });
      });
    }
  };

  /* ---------------- 页面通用空状态 ---------------- */

  C.empty = function (emoji, text) {
    return u().el(
      '<div class="flex flex-col items-center gap-2 py-14 text-center">' +
        '<div class="text-5xl">' + emoji + '</div>' +
        '<div class="text-sm text-slate-400">' + u().esc(text || '空空如也～') + '</div>' +
      '</div>'
    );
  };
})((window.App.UI = window.App.UI || {}).Components ||= {});
