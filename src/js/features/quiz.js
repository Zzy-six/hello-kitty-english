/* ============================================================================
 * features/quiz.js — 单词闯关（四选一答题）
 * ----------------------------------------------------------------------------
 * 流程：选择类别 → 10道题（看图听音选中文 / 看中文选英文 交替出题）
 *       答对 → 开心Kitty + 星星+1（连击>=3 额外+1）→ 答错 → 委屈Kitty提示正确答案
 * 数据流：题目由 data/words-data.js 自动生成，本页零硬编码单词。
 * ============================================================================ */
(function (Feature) {
  'use strict';

  var App2 = window.App;
  var Q_COUNT = 10;       // 每轮题数
  var BONUS_STREAK = 3;   // 连击多少题计额外星星

  var disposed = false;   // 页面卸载标记
  var activeModal = null; // 当前反馈弹窗（卸载时关闭）

  /* ==================== 等级体系：进度 + 解锁 ==================== */

  /** 某等级已学过（correct>0）的单词统计 */
  function levelProgress(lvId) {
    var words = App2.Data.Words.listByLevel(lvId);
    var overview = App2.Store.getOverview();
    var stats = overview ? overview.wordStats : {};
    var learned = 0;
    words.forEach(function (w) {
      var st = stats[w.id];
      if (st && st.correct > 0) learned++;
    });
    return { learned: learned, total: words.length };
  }

  /** 解锁规则：七年级默认解锁；其余需上一级已学单词 ≥ 60% */
  function isUnlocked(lvId) {
    if (lvId <= 1) return true;
    var prev = levelProgress(lvId - 1);
    return prev.learned >= Math.ceil(prev.total * 0.6);
  }

  /* ==================== 页面一：等级选择 ==================== */

  function renderSelect(container) {
    var levels = App2.Data.Words.levels;

    var cards = levels.map(function (lv, i) {
      var p = levelProgress(lv.id);
      var unlocked = isUnlocked(lv.id);
      var body =
        '<div class="mb-2 flex items-center gap-3">' +
          '<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-kitty-50 text-2xl">' + lv.emoji + '</div>' +
          '<div class="min-w-0">' +
            '<div class="font-extrabold text-slate-700">' + App2.Utils.esc(lv.name) + '</div>' +
            '<div class="truncate text-xs text-slate-400">' + App2.Utils.esc(lv.tag) + '</div>' +
          '</div>' +
          (unlocked ? '' : '<span class="ml-auto text-xl">🔒</span>') +
        '</div>' +
        '<div class="text-xs text-slate-500">' + App2.Utils.esc(lv.desc) + '</div>' +
        '<div class="mt-2 flex items-center gap-2 text-[11px] text-slate-400">' +
          '<div class="track h-2 flex-1"><div class="fill" style="width:' + App2.Utils.pct(p.learned, p.total) + '"></div></div>' +
          '<span class="shrink-0 font-bold text-kitty-400">' + p.learned + '/' + p.total + ' 词</span>' +
        '</div>';
      return '' +
        '<button data-level="' + lv.id + '" ' + (unlocked ? '' : 'data-locked="1" ') +
          'class="kitty-card kitty-card-hover animate-fade-up cursor-pointer p-4 text-left' + (unlocked ? '' : ' opacity-80') + '" ' +
          'style="animation-delay:' + (i * 0.05) + 's">' +
          body +
          '<div class="mt-2 text-right text-[11px] font-bold ' + (unlocked ? 'text-kitty-500' : 'text-slate-300') + '">' +
            (unlocked ? '进入学习 ›' : '学完上一级 60% 解锁') +
          '</div>' +
        '</button>';
    }).join('');

    var html =
      '<div class="animate-fade-up">' +
        App2.UI.Components.pageHeader('单词闯关', '#/home', '答对得星星 ⭐') +
        '<div class="mt-3 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-500">' +
          '<span class="text-xl">🎯</span>' +
          '<span>按<b class="text-kitty-500">初中到高中</b>一个年级一个年级地学：每级 4 个主题、32 个单词，' +
          '每轮 10 题，连续答对 3 题有<b class="text-kitty-500">星星加倍奖励</b>！</span>' +
        '</div>' +
        '<div class="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">' + cards + '</div>' +
        '<div class="mt-4">' +
          '<button data-cat="all" class="btn-kitty w-full py-3.5">🎊 全库总复习大挑战（192 词）</button>' +
        '</div>' +
      '</div>';

    App2.Utils.render(container, html);
    container.querySelectorAll('[data-level]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('data-locked')) { App2.Audio.chime('wrong'); return; }
        App2.Audio.chime('click');
        App2.Router.go('#/quiz/level?lv=' + btn.getAttribute('data-level'));
      });
    });
    container.querySelector('[data-cat]').addEventListener('click', function () {
      App2.Audio.chime('click');
      App2.Router.go('#/quiz/play?cat=all');
    });
  }

  /* ==================== 页面二：等级内类别选择 ==================== */

  function renderCats(container, lvId) {
    lvId = Number(lvId) || 1;
    var lv = App2.Data.Words.byLevel(lvId);           // 该等级的类别数组
    var lvMeta = App2.Data.Words.levels.find(function (x) { return x.id === lvId; });
    if (!lv || lv.length === 0 || !lvMeta) { renderSelect(container); return; } // 未知等级回等级页

    var overview = App2.Store.getOverview();
    var wordStats = overview ? overview.wordStats : {};

    var cards = lv.map(function (c, i) {
      var learned = 0;
      c.words.forEach(function (w) {
        var st = wordStats[w.id];
        if (st && st.correct > 0) learned++;
      });
      return '' +
        '<button data-cat="' + c.id + '" class="kitty-card kitty-card-hover animate-fade-up cursor-pointer p-4 text-left" style="animation-delay:' + (i * 0.05) + 's">' +
          '<div class="mb-2 flex items-center gap-3">' +
            '<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-kitty-50 text-2xl">' + c.emoji + '</div>' +
            '<div class="min-w-0">' +
              '<div class="font-extrabold text-slate-700">' + App2.Utils.esc(c.name) + '</div>' +
              '<div class="truncate text-xs text-slate-400">' + App2.Utils.esc(c.desc) + ' · ' + c.words.length + ' 词</div>' +
            '</div>' +
          '</div>' +
          '<div class="flex items-center gap-2 text-[11px] text-slate-400">' +
            '<div class="track h-2 flex-1"><div class="fill" style="width:' + App2.Utils.pct(learned, c.words.length) + '"></div></div>' +
            '<span class="shrink-0 font-bold text-kitty-400">' + learned + '/' + c.words.length + '</span>' +
          '</div>' +
        '</button>';
    }).join('');

    var html =
      '<div class="animate-fade-up">' +
        App2.UI.Components.pageHeader(lvMeta.name + ' · 单词闯关', '#/quiz', lvMeta.emoji + ' ' + lvMeta.tag) +
        '<div class="mt-3 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-500">' +
          '<span class="text-xl">📚</span>' +
          '<span>学完本级的 ' + lv.reduce(function (n, c) { return n + c.words.length; }, 0) + ' 个单词，' +
          '就可以<b class="text-kitty-500">解锁下一级</b>啦！</span>' +
        '</div>' +
        '<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">' + cards + '</div>' +
        '<div class="mt-4">' +
          '<button data-cat="lv' + lvId + '" class="btn-kitty w-full py-3.5">🎊 本级总复习大挑战</button>' +
        '</div>' +
      '</div>';

    App2.Utils.render(container, html);
    container.querySelectorAll('[data-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        App2.Audio.chime('click');
        App2.Router.go('#/quiz/play?cat=' + btn.getAttribute('data-cat'));
      });
    });
  }

  /* ==================== 页面二：答题进行中 ==================== */

  /**
   * 生成一轮题目
   * @returns [{ word, type: 'en2zh'|'zh2en', options: [word,...] }]
   */
  function buildRound(catId) {
    // 本级总复习：catId 形如 “lv1”，从该等级词池出题
    var pool = /^lv\d+$/.test(catId)
      ? App2.Data.Words.listByLevel(Number(catId.slice(2)))
      : App2.Data.Words.list(catId);
    // 洗两次保证混合；不足10题时重复补齐
    var picked = [];
    while (picked.length < Q_COUNT) {
      picked = picked.concat(App2.Utils.sample(pool, pool.length));
    }
    picked = picked.slice(0, Q_COUNT).map(function (w, i) {
      // 奇偶交替 + 随机，两种题型混合
      var type = (i % 2 === 0) ? 'en2zh' : (Math.random() < 0.5 ? 'zh2en' : 'en2zh');
      // 干扰项：从同类别（all时从全库）随机取3个不重复的
      var distract = App2.Utils.sample(pool.filter(function (x) { return x.id !== w.id; }), 3);
      var options = App2.Utils.shuffle([w].concat(distract));
      return { word: w, type: type, options: options };
    });
    return picked;
  }

  /** 渲染单个按钮 */
  function optionBtn(option, type, index) {
    var label = type === 'en2zh'
      ? '<span class="text-2xl">' + applyOpt(option) + '</span>'
      : '<span>' + App2.Utils.esc(option.en) + '</span><span class="text-xl">' + option.emoji + '</span>';
    return '<button data-index="' + index + '" class="option-btn flex items-center justify-center gap-2 px-4 py-3.5 text-base text-slate-700">' + label + '</button>';
  }

  // en2zh 选项显示 emoji + 中文（帮助零基础理解）
  function applyOpt(option) {
    return App2.Utils.esc(option.zh);
  }

  function renderPlay(container, catId) {
    var cat = App2.Data.Words.byCategory(catId);
    var title = cat ? cat.name :
      (/^lv\d+$/.test(catId)
        ? (function () { var m = App2.Data.Words.levels.find(function (x) { return x.id === Number(catId.slice(2)); }); return m ? m.name + ' · 总复习' : '本级总复习'; })()
        : '全库总复习大挑战');
    var questions = buildRound(catId);

    var qIndex = 0, correctCount = 0, roundStars = 0, streak = 0, locked = false;

    var html =
      '<div class="animate-fade-up">' +
        App2.UI.Components.pageHeader(title, '#/quiz', '<span id="k-q-count">第 1/' + Q_COUNT + ' 题</span>') +
        '<div class="mt-2 h-3 w-full">' + '' + '</div>' +
        '<div class="kitty-card mt-3 flex items-center justify-between px-5 py-3">' +
          '<div class="flex items-center gap-2 text-sm font-bold text-kitty-500">' +
            '<span class="inline-block animate-wiggle">⭐</span><span id="k-stars-now">' + App2.Store.getStars() + '</span>' +
          '</div>' +
          '<div id="k-streak" class="text-sm font-extrabold text-orange-400">🔥 0 连击</div>' +
        '</div>' +
        '<div id="k-question" class="mt-4"></div>' +
      '</div>';

    App2.Utils.render(container, html);

    /* 进度条 */
    var progressWrap = container.querySelector('.mt-2.h-3.w-full');
    var pbar = App2.UI.Components.progressBar(0);
    progressWrap.appendChild(pbar);

    var qBox = container.querySelector('#k-question');

    /** 渲染当前一题 */
    function renderQuestion() {
      locked = false;
      var q = questions[qIndex];
      var w = q.word;
      var isZh = q.type === 'zh2en';

      var options = q.options.map(function (o, i) { return optionBtn(o, q.type, i); }).join('');

      qBox.innerHTML =
        '<div class="kitty-card p-5">' +
          /* 题目区 */
          '<div class="flex flex-col items-center gap-1 rounded-2xl bg-kitty-50/80 px-4 py-5 text-center">' +
            (isZh ?
              '<div class="text-sm text-slate-400">请找到它的英文单词</div>' +
              '<div class="mt-1 text-3xl font-extrabold text-slate-700">' + App2.Utils.esc(w.zh) + '</div>' +
              '<div class="mt-1 text-4xl">' + w.emoji + '</div>'
            :
              '<div class="text-sm text-slate-400">请选出它对应的中文意思</div>' +
              '<div class="mt-1 text-4xl">' + w.emoji + '</div>' +
              '<div class="mt-1 text-3xl font-extrabold text-slate-700">' + App2.Utils.esc(w.en) + '</div>' +
              '<div class="text-xs text-slate-400">' + App2.Utils.esc(w.ipa) + '</div>'
            ) +
            '<div class="mt-2">' + (function () { // 发音按钮
              var btn = App2.UI.Components.speakBtn(w.en, { size: 40 });
              return btn.outerHTML;
            })() + '</div>' +
          '</div>' +
          /* 选项区 */
          '<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">' + options + '</div>' +
        '</div>';

      // 绑定发音按钮（外挂的 speakBtn 没有事件，需重新绑定点击）
      var speakBtn = qBox.querySelector('.kitty-card .flex.flex-col.items-center button');
      if (speakBtn) speakBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        App2.Audio.chime('click');
        App2.Audio.speak(w.en);
        speakBtn.classList.remove('animate-sound'); void speakBtn.offsetWidth;
        speakBtn.classList.add('animate-sound');
      });

      qBox.querySelectorAll('.option-btn').forEach(function (btn, i) {
        btn.addEventListener('click', function () { answer(q.options[i], btn); });
      });
    }

    /** 处理一次点击 */
    function answer(option, btnEl) {
      if (locked || disposed) return;
      locked = true;
      var q = questions[qIndex];
      var correct = option.id === q.word.id;

      // 显示正误样式
      btnEl.classList.add(correct ? 'correct' : 'wrong');
      qBox.querySelectorAll('.option-btn').forEach(function (b, i) {
        if (questions[qIndex].options[i].id === q.word.id) b.classList.add('correct');
        b.style.pointerEvents = 'none';
      });

      // 落库 + 星星结算
      App2.Store.recordAnswer(q.word.id, correct);
      var bonus = 0;
      streak = correct ? streak + 1 : 0;
      var gained = 0;
      if (correct) {
        gained += 1;
        if (streak >= BONUS_STREAK) { bonus = 1; gained += 1; }
        App2.Store.addStars(gained);
        roundStars += gained;
        correctCount++;
        App2.Audio.chime('correct');
        App2.UI.Components.celebrate(10);
      } else {
        App2.Audio.chime('wrong');
      }

      var starChip = container.querySelector('#k-stars-now');
      if (starChip) starChip.textContent = App2.Store.getStars();
      var streakEl = container.querySelector('#k-streak');
      if (streakEl) streakEl.textContent = '🔥 ' + streak + ' 连击';

      // 单词回顾卡
      var wordHtml =
        '<div class="flex items-center justify-center gap-3">' +
          '<span class="text-3xl">' + q.word.emoji + '</span>' +
          '<span class="text-xl font-extrabold text-slate-700">' + App2.Utils.esc(q.word.en) + '</span>' +
          '<span class="text-xs text-slate-400">' + App2.Utils.esc(q.word.ipa) + '</span>' +
          '<span class="font-bold text-kitty-500">' + App2.Utils.esc(q.word.zh) + '</span>' +
        '</div>';

      var info = correct
        ? { mood: 'happy', title: streak >= BONUS_STREAK ? '连击' + streak + '！星星+2 ⭐' : '答对啦！星星 +1 ⭐',
            desc: '真棒！顺带听一遍发音吧~', wordHtml: wordHtml, autoClose: 1700 }
        : { mood: 'sad', title: '再想一想～', desc: '记住它，下次一定对！', wordHtml: wordHtml, autoClose: 2100 };

      App2.Audio.speak(q.word.en, { rate: 0.8 });

      activeModal = App2.UI.Components.feedback(info);
      activeModal.then(function () {
        activeModal = null;
        if (disposed) return;
        qIndex++;
        var countEl = container.querySelector('#k-q-count');
        if (countEl && qIndex < Q_COUNT) countEl.textContent = '第 ' + (qIndex + 1) + '/' + Q_COUNT + ' 题';
        pbar.querySelector('.fill').style.width = (qIndex / Q_COUNT * 100) + '%';
        if (qIndex >= Q_COUNT) renderEnd();
        else renderQuestion();
      });
    }

    /** 结算页 */
    function renderEnd() {
      var acc = Math.round(correctCount / Q_COUNT * 100);
      qBox.innerHTML = '' +
        '<div class="kitty-card flex flex-col items-center gap-3 p-8 text-center">' +
          '<div class="animate-jump">' + App2.UI.Kitty.head({ mood: acc >= 60 ? 'happy' : 'normal', size: 150 }) + '</div>' +
          '<div class="text-2xl font-extrabold text-kitty-600">本轮答对 ' + correctCount + ' / ' + Q_COUNT + ' 题</div>' +
          '<div class="flex items-center gap-2 text-lg font-bold text-kitty-500">' +
            '<span class="animate-wiggle inline-block">⭐</span> 本轮获得星星 ' + roundStars + ' 颗' +
          '</div>' +
          '<div class="w-full max-w-xs">' + App2.UI.Components.progressBar(acc).outerHTML + '</div>' +
          '<div class="text-sm text-slate-400">正确率 ' + acc + '%' + (acc === 100 ? ' · 完美通关！🎉' : ' · 继续加油！') + '</div>' +
          '<div class="mt-2 flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">' +
            '<button id="k-again" class="btn-kitty flex-1 py-3">🔁 再来一轮</button>' +
            '<button id="k-cats" class="btn-ghost flex-1 py-3">📚 换主题</button>' +
            '<button id="k-home" class="btn-ghost flex-1 py-3">🏠 回首页</button>' +
          '</div>' +
        '</div>';
      App2.Audio.chime('win');
      container.querySelector('#k-q-count').textContent = '完成 🎉';
      container.querySelector('#k-again').addEventListener('click', function () {
        App2.Audio.chime('click');
        App2.Router.go('#/quiz/play?cat=' + catId);
      });
      container.querySelector('#k-cats').addEventListener('click', function () {
        App2.Audio.chime('click');
        App2.Router.go('#/quiz');
      });
      container.querySelector('#k-home').addEventListener('click', function () {
        App2.Audio.chime('click');
        App2.Router.go('#/home');
      });
    }

    renderQuestion();
  }

  /* ==================== 出口 ==================== */

  Feature.Quiz = {
    mount: function (container, params) {
      disposed = false;
      activeModal = null;
      if (params.lv) renderCats(container, params.lv);
      else if (params.cat) renderPlay(container, params.cat);
      else renderSelect(container);
      // 返回清理：卸载时关闭残留弹窗
      return function () {
        disposed = true;
        if (activeModal) { /* 反馈弹窗由 Promise 自身关闭，这里只标记 */ }
      };
    }
  };
})(window.App.Features = window.App.Features || {});
