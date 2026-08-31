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
 *   App.UI.Components.userModal()                 学习者管理弹窗（添加/切换）
 *   App.UI.Components.welcomeModal(onDone)        首次使用欢迎弹窗（取名）
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

  /* ---------------- 学习者管理弹窗 ---------------- */

  /** 添加/切换/删除学习者（数据隔离的核心入口），弹窗可反复打开 */
  C.userModal = function () {
    function renderDialog() {
      return App.Store.listUsers().then(function (users) {
        var cur = App.Store.getCurrentUser();
        var rows = users.map(function (usr) {
          var isMe = cur && usr.id === cur.id;
          return '<div class="user-row flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ' +
            (isMe ? 'border-kitty-400 bg-kitty-50' : 'border-transparent bg-white') + '" data-uid="' + usr.id + '">' +
            '<div class="flex h-12 w-12 items-center justify-center rounded-full bg-kitty-100 text-2xl">' + usr.avatar + '</div>' +
            '<div class="min-w-0 flex-1">' +
              '<div class="truncate font-bold text-slate-700">' + u().esc(usr.name) +
                (isMe ? '<span class="ml-2 rounded-full bg-kitty-500 px-2 py-0.5 text-[10px] text-white">当前</span>' : '') +
              '</div>' +
              '<div class="text-xs text-slate-400">⭐ ' + '星星等你来赚</div>' +
            '</div>' +
          '</div>';
        }).join('');

        var content =
          '<div class="p-6">' +
            '<div class="mb-3 flex items-center justify-between">' +
              '<h2 class="text-lg font-extrabold text-kitty-600">🎀 学习者管理</h2>' +
              '<button data-close class="flex h-9 w-9 items-center justify-center rounded-full bg-kitty-50 text-lg text-kitty-500 hover:bg-kitty-100">✕</button>' +
            '</div>' +
            '<p class="mb-4 text-xs leading-5 text-slate-400">每一位学习者的成绩、星星、学习时间都独立保存，互不干扰！</p>' +
            '<div class="mb-4 flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">' + rows + '</div>' +
            '<div class="mb-3 flex gap-2">' +
              '<input id="k-new-name" maxlength="12" placeholder="新学习者的昵称（如：糖糖）" ' +
                'class="min-w-0 flex-1 rounded-full border-2 border-kitty-200 bg-white px-4 py-2.5 text-sm font-bold outline-none transition focus:border-kitty-400" />' +
              '<button id="k-add-user" class="btn-kitty px-5 text-sm">＋ 添加</button>' +
            '</div>' +
            '<button id="k-manage" class="btn-ghost w-full py-2.5 text-sm">🗑️ 删除当前学习者（清空其本机数据）</button>' +
          '</div>';

        var m = C.modal({ content: content, dark: true });
        m.root.querySelector('[data-close]').addEventListener('click', m.close);
        // 切换学习者
        m.root.querySelectorAll('.user-row').forEach(function (row) {
          row.addEventListener('click', function () {
            var uid = row.getAttribute('data-uid');
            if (cur && uid === cur.id) return;
            App.Store.enter(uid).then(function () {
              m.close();
              App.Utils.bus.emit('progress', { type: 'user-switch' }); // 各页面自己刷新
              App.Router.go(App.Router.current() === '/home' ? '#/home' : App.Router.current()); // 重新挂载当前页
            });
          });
        });
        // 添加
        var addBtn = m.root.querySelector('#k-add-user');
        function doAdd() {
          var input = m.root.querySelector('#k-new-name');
          var name = (input.value || '').trim();
          if (!name) { input.focus(); return; }
          App.Store.addUser(name).then(function () {
            m.close();
            App.Utils.bus.emit('progress', { type: 'user-switch' });
            App.Router.go(App.Router.current() === '/home' ? '#/home' : App.Router.current());
          });
        }
        addBtn.addEventListener('click', doAdd);
        m.root.querySelector('#k-new-name').addEventListener('keydown', function (e) {
          if (e.key === 'Enter') doAdd();
        });
        // 删除当前
        m.root.querySelector('#k-manage').addEventListener('click', function () {
          var curUser = App.Store.getCurrentUser();
          if (!curUser) return;
          var ok = confirm('确定删除「' + curUser.name + '」及其在本机的全部学习数据吗？此操作不可恢复。');
          if (!ok) return;
          App.Store.deleteUser(curUser.id).then(function () {
            m.close();
            // 若还有其他学习者，切换过去；否则回首页等引导
            App.Store.listUsers().then(function (users) {
              if (users.length) App.Store.enter(users[0].id);
              else App.Store.addUser('小可爱');
            }).then(function () {
              App.Utils.bus.emit('progress', { type: 'user-switch' });
              App.Router.go('#/home');
            });
          });
        });
        return m;
      });
    }
    renderDialog();
  };

  /* ---------------- 首次使用欢迎弹窗 ---------------- */

  /** 尚无学习者时调用：让小朋友输入名字创建学习档案 */
  C.welcomeModal = function () {
    var content =
      '<div class="relative flex flex-col items-center gap-3 p-8 text-center">' +
        '<div class="pointer-events-none absolute left-3 top-3 animate-wiggle">' + App.UI.Kitty.bow({ size: 34 }) + '</div>' +
        '<div class="animate-bob">' + App.UI.Kitty.fullBody({ size: 190 }) + '</div>' +
        '<div class="text-2xl font-extrabold text-kitty-600">欢迎来到 Kitty 英语乐园！</div>' +
        '<p class="text-sm leading-6 text-slate-500">你好呀～我是小猫 Kitty！<br/>先告诉我要怎么称呼你，我们一起开心学英语吧！</p>' +
        '<input id="k-welcome-name" maxlength="12" placeholder="输入你的名字（如：糖糖）" ' +
          'class="w-full rounded-full border-2 border-kitty-200 bg-white px-5 py-3 text-center text-base font-bold outline-none transition focus:border-kitty-400" />' +
        '<button id="k-welcome-go" class="btn-kitty w-full py-3.5 text-lg">🎀 开始学习吧！</button>' +
        '<p class="text-[11px] text-slate-400">学习进度会自动保存在本机浏览器，无需注册、断网也能学</p>' +
      '</div>';
    var m = C.modal({ content: content, dark: false });
    var input = m.root.querySelector('#k-welcome-name');
    var go = m.root.querySelector('#k-welcome-go');
    function submit() {
      var name = (input.value || '').trim() || '小可爱';
      App.Store.addUser(name).then(function () {
        m.close();
        App.Utils.bus.emit('progress', { type: 'user-switch' });
      });
    }
    go.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    setTimeout(function () { input.focus(); }, 300);
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
