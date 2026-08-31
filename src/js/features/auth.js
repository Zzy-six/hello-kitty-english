/* ============================================================================
 * features/auth.js — 账号登录 / 注册（本地账号体系）
 * ----------------------------------------------------------------------------
 * 说明：本应用零后端、全离线，账号与学习数据都保存在本机 IndexedDB，
 *       不上传任何服务器；换设备用「进度中心 → 数据同步」转移数据。
 * 管理员账号由 core/store.js 种子预置，文档不记载。
 * 数据流：登录/注册成功 → Store 自动进入该账号 → 跳转首页。
 * ============================================================================ */
(function (Feature) {
  'use strict';

  var App2 = window.App;

  var disposed = false;

  /** 账号名输入框公用类 */
  var INPUT_CLS =
    'w-full rounded-2xl border-2 border-kitty-100 bg-white px-4 py-3 text-sm font-bold ' +
    'outline-none transition focus:border-kitty-400 placeholder:font-normal placeholder:text-slate-300';

  var Label = function (text) {
    return '<label class="mb-1.5 block text-xs font-extrabold text-slate-500">' + text + '</label>';
  };

  function errBox(text) {
    return '<div id="k-auth-err" class="hidden rounded-2xl border-2 border-rose-100 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-500"></div>';
  }

  function showErr(container, text) {
    var el = container.querySelector('#k-auth-err');
    if (!el) return;
    el.textContent = '⚠️ ' + text;
    el.classList.remove('hidden');
    App2.Audio.chime('wrong');
  }

  function hideErr(container) {
    var el = container.querySelector('#k-auth-err');
    if (el) el.classList.add('hidden');
  }

  /* ---------------- 登录页 ---------------- */

  function loginView(container) {
    var html =
      '<div class="animate-fade-up mx-auto flex w-full max-w-sm flex-col items-center gap-5 pb-10 pt-8">' +
        '<div class="animate-bob">' + App2.UI.Kitty.fullBody({ size: 150 }) + '</div>' +
        '<div class="text-center">' +
          '<div class="text-2xl font-extrabold text-kitty-600">Welcome back ♪</div>' +
          '<div class="mt-1.5 text-sm text-slate-400">登录账号，接着学你的 Kitty 英语！</div>' +
        '</div>' +
        '<div class="kitty-card w-full p-6">' +
          errBox() +
          '<div class="mt-3">' + Label('账号') +
            '<input id="k-auth-user" class="' + INPUT_CLS + '" placeholder="字母、数字或下划线" autocomplete="username" maxlength="20" />' +
          '</div>' +
          '<div class="mt-4">' + Label('密码') +
            '<div class="relative">' +
              '<input id="k-auth-pass" type="password" class="' + INPUT_CLS + ' pr-12" placeholder="输入密码" autocomplete="current-password" />' +
              '<button id="k-auth-eye" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-lg opacity-50 hover:opacity-90">👁</button>' +
            '</div>' +
          '</div>' +
          '<button id="k-auth-go" class="btn-kitty mt-6 w-full py-3.5 text-base">🎀 登录</button>' +
          '<div class="mt-4 text-center text-xs text-slate-400">' +
            '还没有账号？<button id="k-auth-to-reg" class="font-extrabold text-kitty-500 underline underline-offset-2">去注册一个</button>' +
          '</div>' +
        '</div>' +
        '<div class="px-2 text-center text-[11px] leading-5 text-slate-300">' +
          '🔒 账号和学习数据只保存在<b>这台设备</b>上，完全离线、不用联网。<br/>换设备时用「学习进度中心 → 数据同步」即可带走学习记录。' +
        '</div>' +
      '</div>';

    App2.Utils.render(container, html);

    var uIn = container.querySelector('#k-auth-user');
    var pIn = container.querySelector('#k-auth-pass');
    var goBtn = container.querySelector('#k-auth-go');

    function submit() {
      hideErr(container);
      if (!uIn.value.trim()) { uIn.focus(); showErr(container, '先输入账号哦。'); return; }
      if (!pIn.value) { pIn.focus(); showErr(container, '再输入一下密码。'); return; }
      goBtn.disabled = true;
      App2.Store.login(uIn.value, pIn.value).then(function (user) {
        App2.Audio.chime('click');
        App2.Utils.bus.emit('progress', { type: 'user-switch' });
        App2.Router.go('#/home');
      }).catch(function (err) {
        goBtn.disabled = false;
        showErr(container, err.message || '登录失败，稍后再试试。');
      });
    }

    goBtn.addEventListener('click', submit);
    pIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    uIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') pIn.focus(); });
    container.querySelector('#k-auth-eye').addEventListener('click', function () {
      pIn.type = pIn.type === 'password' ? 'text' : 'password';
    });
    container.querySelector('#k-auth-to-reg').addEventListener('click', function () {
      App2.Audio.chime('click');
      App2.Router.go('#/auth/register');
    });
    setTimeout(function () { if (!disposed) uIn.focus(); }, 200);
  }

  /* ---------------- 注册页 ---------------- */

  function registerView(container) {
    var avatars = App2.Store.AVATARS;

    var avatarBtns = avatars.map(function (a, i) {
      return '<button type="button" data-avatar="' + a + '" class="flex h-11 w-11 items-center justify-center rounded-full border-2 text-xl transition ' +
        (i === 0 ? 'border-kitty-400 bg-kitty-50' : 'border-transparent bg-kitty-50/60 opacity-70 hover:opacity-100') + '">' + a + '</button>';
    }).join('');

    var html =
      '<div class="animate-fade-up mx-auto flex w-full max-w-sm flex-col items-center gap-5 pb-10 pt-8">' +
        '<div class="text-center">' +
          '<div class="flex items-center justify-center gap-2 text-2xl font-extrabold text-kitty-600">' +
            '<span class="flex h-10 w-10 items-center justify-center rounded-full bg-kitty-50">' + App2.UI.Kitty.head({ mood: 'normal', size: 22 }) + '</span>' +
            '创建你的学习账号' +
          '</div>' +
          '<div class="mt-1.5 text-sm text-slate-400">每个账号的学习记录独立保存，互不干扰</div>' +
        '</div>' +
        '<div class="kitty-card w-full p-6">' +
          errBox() +
          '<div class="mt-3">' + Label('账号（登录时使用）') +
            '<input id="k-reg-user" class="' + INPUT_CLS + '" placeholder="2~20 位字母、数字或下划线" maxlength="20" autocomplete="username" />' +
          '</div>' +
          '<div class="mt-4">' + Label('昵称（也可以先用账号名）') +
            '<input id="k-reg-name" class="' + INPUT_CLS + '" placeholder="想被人怎么称呼？" maxlength="12" />' +
          '</div>' +
          '<div class="mt-4">' + Label('选个可爱头像') +
            '<div class="flex flex-wrap gap-2">' + avatarBtns + '</div>' +
          '</div>' +
          '<div class="mt-4">' + Label('密码') +
            '<input id="k-reg-pass" type="password" class="' + INPUT_CLS + '" placeholder="至少 3 位" autocomplete="new-password" />' +
          '</div>' +
          '<div class="mt-4">' + Label('再输一次密码') +
            '<input id="k-reg-pass2" type="password" class="' + INPUT_CLS + '" placeholder="确认密码" autocomplete="new-password" />' +
          '</div>' +
          '<button id="k-reg-go" class="btn-kitty mt-6 w-full py-3.5 text-base">🎀 注册并开始学习</button>' +
          '<div class="mt-4 text-center text-xs text-slate-400">' +
            '已有账号？<button id="k-reg-to-login" class="font-extrabold text-kitty-500 underline underline-offset-2">返回登录</button>' +
          '</div>' +
        '</div>' +
        '<div class="px-2 text-center text-[11px] leading-5 text-slate-300">' +
          '🔒 账号数据只保存在本机浏览器（IndexedDB），不上网、不花钱。<br/>忘记密码？删除账号重新注册即可（旧学习记录无法找回）。' +
        '</div>' +
      '</div>';

    App2.Utils.render(container, html);

    var uIn = container.querySelector('#k-reg-user');
    var nIn = container.querySelector('#k-reg-name');
    var p1 = container.querySelector('#k-reg-pass');
    var p2 = container.querySelector('#k-reg-pass2');
    var goBtn = container.querySelector('#k-reg-go');
    var pickedAvatar = avatars[0];

    container.querySelectorAll('[data-avatar]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pickedAvatar = btn.getAttribute('data-avatar');
        container.querySelectorAll('[data-avatar]').forEach(function (b) {
          b.className =
            'flex h-11 w-11 items-center justify-center rounded-full border-2 text-xl transition ' +
            (b === btn ? 'border-kitty-400 bg-kitty-50' : 'border-transparent bg-kitty-50/60 opacity-70 hover:opacity-100');
        });
      });
    });

    function submit() {
      hideErr(container);
      if (!uIn.value.trim()) { uIn.focus(); showErr(container, '先给账号起个名字（登录要用）。'); return; }
      var pwd = p1.value;
      if (pwd.length < 3) { p1.focus(); showErr(container, '密码至少 3 位哦。'); return; }
      if (pwd !== p2.value) { p2.focus(); showErr(container, '两次输入的密码不一样，仔细检查一下。'); return; }
      goBtn.disabled = true;
      App2.Store.register(uIn.value, pwd, nIn.value, pickedAvatar).then(function (user) {
        App2.Audio.chime('click');
        App2.Utils.bus.emit('progress', { type: 'user-switch' });
        App2.Router.go('#/home');
      }).catch(function (err) {
        goBtn.disabled = false;
        showErr(container, err.message || '注册失败，稍后再试试。');
      });
    }

    goBtn.addEventListener('click', submit);
    p2.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    container.querySelector('#k-reg-to-login').addEventListener('click', function () {
      App2.Audio.chime('click');
      App2.Router.go('#/auth');
    });
    setTimeout(function () { if (!disposed) uIn.focus(); }, 200);
  }

  /* ---------------- 挂载入口 ---------------- */

  function handleMounted() {
    disposed = false;
    return function () { disposed = true; };
  }

  /** 登录页（路由 #/auth） */
  Feature.Auth = {
    mount: function (container) {
      // 已登录用户不再看登录页
      if (App2.Store.getCurrentUser()) { App2.Router.go('#/home'); return; }
      loginView(container);
      return handleMounted();
    }
  };

  /** 注册页（路由 #/auth/register） */
  Feature.AuthRegister = {
    mount: function (container) {
      if (App2.Store.getCurrentUser()) { App2.Router.go('#/home'); return; }
      registerView(container);
      return handleMounted();
    }
  };
})(window.App.Features = window.App.Features || {});
