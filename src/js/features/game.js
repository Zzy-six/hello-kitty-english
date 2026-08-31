/* ============================================================================
 * features/game.js — 单词消消乐（记忆翻牌配对小游戏）
 * ----------------------------------------------------------------------------
 * 玩法：所有卡牌背面朝上，翻开两张；若单词相同 → 消除成功并朗读该单词，
 *       不同 → 自动翻回。全部消除即获胜，按关卡奖励星星。
 * 关卡配置来自 data/game-config.js（★ ZyCode 在此加关卡/调难度）。
 * ============================================================================ */
(function (Feature) {
  'use strict';

  var App2 = window.App;

  var disposed = false;
  var gameTimer = null;  // 计时器

  /* ==================== 关卡选择 ==================== */

  /** 按关卡 source 学段取词池（不足 pairs 时回退全库） */
  function poolFor(level) {
    var W = App2.Data.Words;
    var source = level.source || '';
    if (source === 'l1') return W.listByLevel(1);
    if (source === 'l2') return W.listByLevel(2).concat(W.listByLevel(3));
    if (source === 'l3') return W.listByLevel(4).concat(W.listByLevel(5)).concat(W.listByLevel(6));
    return W.list('all');
  }

  function renderLevels(container) {
    var cards = App2.Data.GameConfig.levels.map(function (l, i) {
      return '' +
        '<button data-level="' + l.id + '" class="kitty-card kitty-card-hover animate-fade-up cursor-pointer p-5 text-center" style="animation-delay:' + (i * 0.07) + 's">' +
          '<div class="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-kitty-200 to-kitty-400 text-3xl shadow-kitty">' + (l.id === 1 ? '🌸' : l.id === 2 ? '🍓' : '🎀') + '</div>' +
          '<div class="font-extrabold text-slate-700">' + App2.Utils.esc(l.name) + '</div>' +
          '<div class="mt-1 text-xs text-slate-400">' + App2.Utils.esc(l.desc) + '</div>' +
          '<div class="mt-2 inline-block rounded-full bg-kitty-100 px-3 py-1 text-xs font-bold text-kitty-500">通关奖 ⭐x' + l.stars + '</div>' +
        '</button>';
    }).join('');

    var html =
      '<div class="animate-fade-up">' +
        App2.UI.Components.pageHeader('单词消消乐', '#/home', '记忆大挑战 🧠') +
        '<div class="mt-3 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-500">' +
          '<span class="text-xl">🍓</span>' +
          '<span>翻开两张卡片，找出<b class="text-kitty-500">相同的单词</b>就能消除！消除时会读出单词，<b class="text-kitty-500">边玩边记单词</b>。</span>' +
        '</div>' +
        '<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">' + cards + '</div>' +
      '</div>';

    App2.Utils.render(container, html);
    container.querySelectorAll('[data-level]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        App2.Audio.chime('click');
        App2.Router.go('#/game/play?level=' + btn.getAttribute('data-level'));
      });
    });
  }

  /* ==================== 游戏进行中 ==================== */

  function renderBoard(container, levelId) {
    levelId = Number(levelId) || 1; // 路由参数是字符串，"1"+1 会拼成 "11"
    var level = App2.Data.GameConfig.byId(levelId);
    if (!level) { renderLevels(container); return; } // 未知关卡回选择页
    var pairs = level.pairs;

    /* 随机抽 pairs 个单词（按关卡学段取词池），每个单词生成两张卡 */
    var pool = poolFor(level);
    if (pool.length < pairs) pool = App2.Data.Words.list('all'); // 学段词不够时回退全库兜底
    var words = App2.Utils.sample(pool, Math.min(pairs, pool.length));
    var cards = [];
    words.forEach(function (w, i) { cards.push({ id: 'a' + w.id + i, word: w }); cards.push({ id: 'b' + w.id + i, word: w }); });
    cards = App2.Utils.shuffle(cards);

    var cardsHtml = cards.map(function (c, i) {
      return '' +
        '<div class="flip-scene cursor-pointer" style="aspect-ratio:1/1" data-word="' + c.word.id + '" data-card="' + i + '">' +
          '<div class="flip-inner">' +
            '<div class="flip-face flip-back">' +
              '<svg viewBox="-40 -24 80 48" width="34" height="22" xmlns="http://www.w3.org/2000/svg" class="bow-watermark"><g stroke="#e6396c" stroke-width="2"><ellipse cx="-14" cy="-2" rx="14" ry="9.5" fill="#ffe1ec" transform="rotate(-22 -14 -2)"/><ellipse cx="14" cy="-2" rx="14" ry="9.5" fill="#ffe1ec" transform="rotate(22 14 -2)"/><circle cx="0" cy="0" r="6.5" fill="#ff9ab8"/></g></svg>' +
            '</div>' +
            '<div class="flip-face flip-front">' +
              '<span class="text-2xl leading-none">' + c.word.emoji + '</span>' +
              '<span class="px-0.5 text-center text-[10px] font-extrabold text-slate-600" style="word-break:break-all">' + App2.Utils.esc(c.word.en) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    var html =
      '<div class="animate-fade-up">' +
        App2.UI.Components.pageHeader('「' + level.name + '」', '#/game', '共 ' + pairs + ' 对') +
        '<div class="kitty-card mt-3 flex items-center justify-between px-5 py-3 text-sm font-bold">' +
          '<span class="text-kitty-500">⏱ <span id="k-time">00:00</span></span>' +
          '<span class="text-slate-500">已翻开 <span id="k-moves">0</span> 次</span>' +
          '<span class="text-emerald-500">✅ <span id="k-found">0</span>/' + pairs + '</span>' +
        '</div>' +
        '<div id="k-board" class="mx-auto mt-4 grid gap-2.5 sm:gap-3" style="grid-template-columns:repeat(' + level.cols + ',minmax(0,1fr));max-width:' + (level.cols * 84) + 'px">' + cardsHtml + '</div>' +
      '</div>';

    App2.Utils.render(container, html);
    var board = container.querySelector('#k-board');
    var timeEl = container.querySelector('#k-time');
    var movesEl = container.querySelector('#k-moves');
    var foundEl = container.querySelector('#k-found');

    var first = null;        // 第一张翻开的卡片
    var lock = false;        // 配对判定期间锁板
    var found = 0;           // 已消除对数
    var moves = 0;           // 翻牌次数（一次翻两张算1次）
    var seconds = 0;         // 用时

    /* 计时器 */
    gameTimer = setInterval(function () {
      if (disposed) return;
      if (document.visibilityState === 'visible') {
        seconds++;
        var m = String(Math.floor(seconds / 60)).padStart(2, '0');
        var s = String(seconds % 60).padStart(2, '0');
        timeEl.textContent = m + ':' + s;
      }
    }, 1000);

    function flipEl(cardEl) {
      var inner = cardEl.firstElementChild;
      inner.classList.toggle('is-flipped');
      return inner.classList.contains('is-flipped');
    }

    function handleClick(cardEl) {
      if (lock || disposed) return;
      var inner = cardEl.firstElementChild;
      if (inner.classList.contains('is-flipped')) return; // 已翻开的不再处理
      App2.Audio.chime('flip');
      flipEl(cardEl);

      if (!first) {
        first = cardEl;
        return;
      }
      // 第二张：开始判定
      moves++;
      movesEl.textContent = moves;
      var wordIdA = first.getAttribute('data-word');
      var wordIdB = cardEl.getAttribute('data-word');
      lock = true;

      if (wordIdA === wordIdB) {
        // 配对成功：消除 + 发音 + 记录
        var word = App2.Data.Words.byId(wordIdA);
        setTimeout(function () {
          [first, cardEl].forEach(function (el) {
            el.classList.add('animate-vanish');
            el.style.pointerEvents = 'none';
          });
          found++;
          foundEl.textContent = found;
          App2.Audio.chime('correct');
          App2.UI.Components.celebrate(6);
          App2.Audio.speak(word.en, { rate: 0.8 });
          first = null;
          lock = false;
          if (found >= pairs) setTimeout(win, 700);
        }, 300);
      } else {
        // 配对失败：0.7秒后翻回
        var lastSecond = cardEl;
        setTimeout(function () {
          flipEl(first);
          flipEl(lastSecond);
          first = null;
          lock = false;
        }, 750);
      }
    }

    board.querySelectorAll('.flip-scene').forEach(function (el) {
      el.addEventListener('click', function () { handleClick(el); });
    });

    /* 胜利结算 */
    function win() {
      App2.Audio.chime('win');
      App2.Store.addStars(level.stars); // 通关奖励星星（持久化）
      var m = String(Math.floor(seconds / 60)).padStart(2, '0');
      var s = String(seconds % 60).padStart(2, '0');
      var content =
        '<div class="flex flex-col items-center gap-3 p-8 text-center">' +
          '<div class="animate-jump">' + App2.UI.Kitty.head({ mood: 'happy', size: 150 }) + '</div>' +
          '<div class="text-2xl font-extrabold text-kitty-600">耶！全部消除成功！</div>' +
          '<div class="flex flex-col items-center gap-1 text-sm text-slate-500">' +
            '<span>用时 ' + m + ':' + s + ' · 翻开 ' + moves + ' 次</span>' +
            '<span class="text-base font-extrabold text-kitty-500">获得星星 ⭐ × ' + level.stars + '</span>' +
          '</div>' +
          '<div class="mt-2 flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">' +
            '<button id="k-next" class="btn-kitty flex-1 py-3">' +
              (App2.Data.GameConfig.byId(levelId + 1) ? '▶️ 下一关' : '🏆 已通关全部') + '</button>' +
            '<button id="k-retry" class="btn-ghost flex-1 py-3">🔁 再玩一次</button>' +
            '<button id="k-back" class="btn-ghost flex-1 py-3">📋 选关卡</button>' +
          '</div>' +
        '</div>';
      var modal = App2.UI.Components.modal({ content: content });
      modal.root.querySelector('#k-next').addEventListener('click', function () {
        modal.close();
        var next = App2.Data.GameConfig.byId(levelId + 1);
        App2.Router.go('#/game/play?level=' + (next ? next.id : levelId));
      });
      modal.root.querySelector('#k-retry').addEventListener('click', function () {
        modal.close();
        App2.Router.go('#/game/play?level=' + levelId);
      });
      modal.root.querySelector('#k-back').addEventListener('click', function () {
        modal.close();
        App2.Router.go('#/game');
      });
    }
  }

  Feature.Game = {
    mount: function (container, params) {
      disposed = false;
      if (gameTimer) { clearInterval(gameTimer); gameTimer = null; }
      if (params.level) renderBoard(container, params.level);
      else renderLevels(container);
      return function () {
        disposed = true;
        if (gameTimer) { clearInterval(gameTimer); gameTimer = null; }
      };
    }
  };
})(window.App.Features = window.App.Features || {});
