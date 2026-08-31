/* ============================================================================
 * features/dialogue.js — 情景对话（气泡式 UI + 朗读 + 中文翻译）
 * ----------------------------------------------------------------------------
 * 页面一：场景列表；页面二：对话详情。
 * 场景数据来自 data/dialogues-data.js（ZyCode 在此新增即可）。
 * 交互：逐句朗读按钮 / 一键播放全部 / 中文翻译开关。
 * ============================================================================ */
(function (Feature) {
  'use strict';

  var App2 = window.App;
  var disposed = false;
  var playTimer = null; // 播放全部时的定时器

  /* ==================== 场景列表 ==================== */

  function renderList(container) {
    var scenarios = App2.Data.Dialogues.list();
    var cards = scenarios.map(function (s, i) {
      return '' +
        '<button data-scene="' + s.id + '" class="kitty-card kitty-card-hover animate-fade-up cursor-pointer p-4 text-left" style="animation-delay:' + (i * 0.05) + 's">' +
          '<div class="flex items-center gap-3">' +
            '<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-2xl">' + s.emoji + '</div>' +
            '<div class="min-w-0">' +
              '<div class="font-extrabold text-slate-700">' + App2.Utils.esc(s.title) + '</div>' +
              '<div class="truncate text-xs text-slate-400">' + App2.Utils.esc(s.desc) + ' · ' + s.lines.length + ' 句</div>' +
            '</div>' +
            '<span class="ml-auto text-kitty-300">›</span>' +
          '</div>' +
        '</button>';
    }).join('');

    var html =
      '<div class="animate-fade-up">' +
        App2.UI.Components.pageHeader('情景对话', '#/home', '点句子能听到发音 🔊') +
        '<div class="mt-3 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-500">' +
          '<span class="text-xl">💬</span>' +
          '<span>跟着 Kitty 和小伙伴李明一起演情景剧：先<b class="text-kitty-500">听发音</b>，再大声<b class="text-kitty-500">跟着读</b>吧！</span>' +
        '</div>' +
        '<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">' + cards + '</div>' +
      '</div>';

    App2.Utils.render(container, html);
    container.querySelectorAll('[data-scene]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        App2.Audio.chime('click');
        App2.Router.go('#/dialogue/chat?id=' + btn.getAttribute('data-scene'));
      });
    });
  }

  /* ==================== 对话详情 ==================== */

  function renderChat(container, sceneId) {
    var scene = App2.Data.Dialogues.byId(sceneId);
    if (!scene) { App2.Router.go('#/dialogue'); return; }

    var showZh = true; // 中文翻译开关状态

    var html =
      '<div class="animate-fade-up">' +
        App2.UI.Components.pageHeader(scene.emoji + ' ' + scene.title, '#/dialogue', scene.desc) +
        /* 控制条：播放全部 + 译文开关 */
        '<div class="kitty-card mt-3 flex flex-wrap items-center gap-2 px-4 py-3">' +
          '<button id="k-play-all" class="btn-kitty px-4 py-2 text-sm">▶️ 播放全部</button>' +
          '<button id="k-toggle-zh" class="btn-ghost px-4 py-2 text-sm">🌏 中文翻译：开</button>' +
          '<div class="ml-auto text-xs text-slate-400">点小喇叭🔊播放单句</div>' +
        '</div>' +
        '<div id="k-chat" class="mt-4 flex flex-col gap-3 py-2"></div>' +
      '</div>';

    App2.Utils.render(container, html);

    var chatBox = container.querySelector('#k-chat');
    var toggleBtn = container.querySelector('#k-toggle-zh');

    /** 渲染一句气泡：who=kitty 左侧，friend 右侧 */
    function bubbleHTML(line, idx) {
      var isKitty = line.who === 'kitty';
      var avatar = isKitty ? App2.UI.Kitty.head({ mood: 'normal', size: 44 }) : App2.UI.Kitty.bunny({ size: 44 });
      return '' +
        '<div class="animate-bubble flex items-end gap-2" style="animation-delay:' + (idx * 0.06) + 's">' +
          (isKitty ? '<div class="shrink-0">' + avatar + '</div>' : '') +
          '<div class="bubble ' + (isKitty ? 'bubble-left' : 'bubble-right') + '">' +
            '<div class="flex items-center gap-2">' +
              '<span class="text-base font-extrabold text-slate-700">' + App2.Utils.esc(line.en) + '</span>' +
              '<span data-speak="' + idx + '" class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-xs shadow-kitty hover:scale-110">🔊</span>' +
            '</div>' +
            (showZh ? '<div class="mt-1 text-xs text-slate-400">' + App2.Utils.esc(line.zh) + '</div>' : '') +
          '</div>' +
          (isKitty ? '' : '<div class="shrink-0">' + avatar + '</div>') +
        '</div>';
    }

    function renderBubbles() {
      chatBox.innerHTML = scene.lines.map(bubbleHTML).join('');
      chatBox.querySelectorAll('[data-speak]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var line = scene.lines[Number(btn.getAttribute('data-speak'))];
          App2.Audio.chime('click');
          App2.Audio.speak(line.en);
          highlight(btn);
        });
      });
      // 最新一句高亮滚动
      scrollChat();
    }

    /** 播放中的一句高亮（截图时方便看出进度） */
    function highlight(btn) {
      chatBox.querySelectorAll('.bubble').forEach(function (b) {
        b.classList.remove('ring-4', 'ring-kitty-300');
      });
      var bubble = btn.closest('.bubble');
      if (bubble) bubble.classList.add('ring-4', 'ring-kitty-300');
    }

    function scrollChat() {
      chatBox.parentElement.scrollTop = chatBox.parentElement.scrollHeight;
    }

    /* 播放全部：逐句 + 高亮 + 停顿（按句子长度给停顿） */
    var playAllBtn = container.querySelector('#k-play-all');
    playAllBtn.addEventListener('click', function () {
      App2.Audio.chime('click');
      if (playTimer) { clearInterval(playTimer); playTimer = null; }
      App2.Audio.stop();
      var i = 0;
      function next() {
        if (disposed || i >= scene.lines.length) return;
        var line = scene.lines[i];
        var btns = chatBox.querySelectorAll('[data-speak]');
        if (btns[i]) highlight(btns[i]);
        App2.Audio.speak(line.en);
        i++;
        // 按句子长度估算朗读时长 + 停顿
        var ms = Math.min(6000, 1800 + line.en.length * 85);
        playTimer = setTimeout(next, ms);
      }
      next();
    });

    /* 中文翻译开关 */
    toggleBtn.addEventListener('click', function () {
      showZh = !showZh;
      toggleBtn.textContent = '🌏 中文翻译：' + (showZh ? '开' : '关');
      renderBubbles();
    });

    renderBubbles();
  }

  Feature.Dialogue = {
    mount: function (container, params) {
      disposed = false;
      if (params.id) renderChat(container, params.id);
      else renderList(container);
      return function () {
        disposed = true;
        if (playTimer) { clearTimeout(playTimer); playTimer = null; }
        App2.Audio.stop();
      };
    }
  };
})(window.App.Features = window.App.Features || {});
