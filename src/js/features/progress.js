/* ============================================================================
 * features/progress.js — 学习进度中心
 * ----------------------------------------------------------------------------
 * 展示：个人卡片(称号+头像)、星星/已学单词/正确率/学习天数、
 *       近7天学习时长柱状图、分级掌握度进度条(七年级→高三)、单词列表(带筛选/发音)、
 *       数据管理(切换/新增/删除学员、重置进度)、存储方式提示。
 * 所有数据来自 core/store.js 的 IndexedDB 持久化（★ 数据层增改见 Store）。
 * ============================================================================ */
(function (Feature) {
  'use strict';

  var App2 = window.App;

  /* 称号规则（星星数 → 称号），与首页保持一致 */
  var TITLES = [
    [0, '粉嫩新手'], [50, '蝴蝶结学徒'], [150, '樱花学员'], [300, '甜心学霸']
  ];
  function titleOf(stars) {
    var t = TITLES[0][1];
    TITLES.forEach(function (p) { if (stars >= p[0]) t = p[1]; });
    return t;
  }

  /* 单词掌握状态：按最近答题记录判断 */
  function wordStatus(stats, wordId) {
    var s = stats[wordId];
    if (!s) return 'unlearned';           // 未学
    if (s.correct >= 5) return 'mastered'; // 已掌握
    if (s.correct > s.wrong) return 'learning'; // 学习中
    return 'review';                       // 待巩固
  }
  var STATUS_INFO = {
    mastered: { label: '已掌握', cls: 'bg-emerald-100 text-emerald-600' },
    learning: { label: '学习中', cls: 'bg-sky-100 text-sky-600' },
    review:   { label: '待巩固', cls: 'bg-amber-100 text-amber-600' },
    unlearned:{ label: '未学',   cls: 'bg-slate-100 text-slate-400' }
  };

  /* 挂载入口 */
  Feature.Progress = {
    mount: function (container) {
      render(container);
      // 监听数据变化（如在弹窗中切换学员、重置进度）→ 重新渲染
      var off = App2.Utils.bus.on('progress', function () { render(container); });
      var off2 = App2.Utils.bus.on('user', function () { render(container); });
      return function () { off(); off2(); };
    }
  };

  function render(container) {
    var ov = App2.Store.getOverview();
    if (!ov) { // 当前学员被删除等极端情况
      App2.Utils.render(container, App2.UI.Components.emptyState('🐰', '还没有学习档案，先创建一个学员吧！'));
      return;
    }
    var user = ov.user;

    /* —— 统计卡 —— */
    var stats =
      '<div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">' +
        statCard('⭐', '总星星', ov.stars, 'text-kitty-500') +
        statCard('📚', '已学单词', ov.learnedIds.length, 'text-sky-500') +
        statCard('🎯', '正确率', (ov.totalCorrect + ov.totalWrong) > 0 ? ov.accuracy + '%' : '--', 'text-emerald-500') +
        statCard('🗓', '学习天数', ov.studyDays + ' 天', 'text-grape-500') +
      '</div>';

    /* —— 近7天学习时长 —— */
    var days = App2.Store.getRecentDays(7);
    var barHtml = days.map(function (d) {
      var h = Math.min(100, Math.round(d.seconds / 3600 * 100));
      var minutes = Math.round(d.seconds / 60);
      return '' +
        '<div class="flex flex-1 flex-col items-center gap-1.5">' +
          '<div class="flex h-24 w-full items-end justify-center">' +
            '<div class="w-full max-w-[26px] rounded-full bg-gradient-to-t from-kitty-300 to-kitty-400 transition-all" style="height:' + Math.max(h, d.seconds > 0 ? 6 : 2) + '%">' +
              '<div class="text-center text-[9px] font-bold text-white/90" style="padding-top:2px">' + (d.seconds > 0 ? minutes : '') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="text-[10px] font-bold text-slate-400">' + d.label + '</div>' +
        '</div>';
    }).join('');
    var week =
      '<div class="kitty-card mt-4 p-5">' +
        '<div class="mb-4 flex items-center justify-between">' +
          '<div class="font-extrabold text-slate-700">📈 近 7 天学习时长</div>' +
          '<div class="text-xs text-slate-400">总时长 ' + App2.Utils.fmtDuration(ov.totalSeconds) + '</div>' +
        '</div>' +
        '<div class="flex items-end gap-1.5 sm:gap-2">' + barHtml + '</div>' +
      '</div>';

    /* —— 分级掌握度（按年级分组：七年级 → 高三） —— */
    var catHtml = App2.Data.Words.levels.map(function (lv) {
      var cats = App2.Data.Words.byLevel(lv.id) || [];
      var rows = cats.map(function (c) {
        var words = App2.Data.Words.list(c.id);
        var learned = 0;
        words.forEach(function (w) {
          var st = wordStatus(ov.wordStats, w.id);
          if (st !== 'unlearned') learned++;
        });
        var pct = words.length ? Math.round(learned / words.length * 100) : 0;
        return '' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-16 shrink-0 sm:w-20">' +
              '<div class="truncate text-xs font-bold text-slate-600">' + App2.Utils.esc(c.name) + '</div>' +
              '<div class="text-[10px] text-slate-400">' + learned + '/' + words.length + '</div>' +
            '</div>' +
            '<div class="h-3.5 flex-1 overflow-hidden rounded-full bg-slate-100" data-done="' + (learned === words.length) + '">' +
              '<div class="h-full rounded-full bg-gradient-to-r from-kitty-300 to-kitty-500 transition-all duration-700" style="width:' + pct + '%"></div>' +
            '</div>' +
            '<div class="w-12 shrink-0 text-right text-xs font-extrabold ' + (learned === words.length ? 'text-emerald-500' : 'text-kitty-500') + '">' +
              (learned === words.length ? '🎉' : pct + '%') + '</div>' +
          '</div>';
      }).join('');
      return '' +
        '<div class="rounded-2xl bg-kitty-50/60 p-3">' +
          '<div class="mb-2 text-xs font-extrabold">' + lv.emoji + ' ' + App2.Utils.esc(lv.name) + ' · ' + App2.Utils.esc(lv.tag) + '</div>' +
          '<div class="flex flex-col gap-3">' + rows + '</div>' +
        '</div>';
    }).join('');
    var mastery =
      '<div class="kitty-card mt-4 p-5">' +
        '<div class="mb-4 font-extrabold text-slate-700">🎨 分级掌握度</div>' +
        '<div class="flex flex-col gap-3.5">' + catHtml + '</div>' +
      '</div>';

    /* —— 单词列表 —— */
    var words = App2.Data.Words.list('all');
    var rows = words.map(function (w) {
      var st = wordStatus(ov.wordStats, w.id);
      var info = STATUS_INFO[st];
      var rec = ov.wordStats[w.id];
      var detail = rec ? ('对 ' + rec.correct + ' · 错 ' + rec.wrong) : '还没有学过';
      return '' +
        '<div class="word-row flex items-center gap-3" data-status="' + st + '">' +
          '<button class="speak-mini" data-speak="' + App2.Utils.esc(w.en) + '" title="点击发音">' + w.emoji + '</button>' +
          '<div class="min-w-0 flex-1">' +
            '<div class="truncate text-sm font-extrabold text-slate-600">' + App2.Utils.esc(w.en) + ' <span class="font-normal text-slate-400">' + App2.Utils.esc(w.ipa || '') + '</span></div>' +
            '<div class="text-xs text-slate-400">' + App2.Utils.esc(w.zh) + ' · ' + detail + '</div>' +
          '</div>' +
          '<span class="rounded-full px-2.5 py-1 text-[11px] font-extrabold ' + info.cls + '">' + info.label + '</span>' +
        '</div>';
    }).join('');
    var wordList =
      '<div class="kitty-card mt-4 p-5">' +
        '<div class="mb-3 flex flex-wrap items-center justify-between gap-2">' +
          '<div class="font-extrabold text-slate-700">🍬 单词收集册</div>' +
          '<div class="flex flex-wrap gap-1.5" id="k-filters">' +
            filterBtn('all', '全部', true) +
            filterBtn('mastered', '已掌握') +
            filterBtn('learning', '学习中') +
            filterBtn('review', '待巩固') +
            filterBtn('unlearned', '未学') +
          '</div>' +
        '</div>' +
        '<div class="max-h-80 space-y-1.5 overflow-y-auto pr-1" id="k-words">' + rows + '</div>' +
      '</div>';

    /* —— 数据管理 —— */
    var fallbackNote = App2.DB.isFallback()
      ? '<div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-600">⚠️ 当前浏览器不支持 IndexedDB，已自动改用 localStorage 保存（功能一致，但存储量较小且不建议用于正式学习）。</div>'
      : '';
    var manage =
      '<div class="kitty-card mt-4 p-5">' +
        '<div class="mb-3 font-extrabold text-slate-700">🛠 数据管理</div>' +
        '<div class="flex flex-wrap gap-2.5">' +
          '<button id="k-users" class="btn-ghost py-2.5">👧 切换 / 新增学员</button>' +
          '<button id="k-sync" class="btn-ghost py-2.5">🔄 换设备 / 数据同步</button>' +
          '<button id="k-reset" class="btn-ghost py-2.5 text-rose-400">🧹 清空我的进度</button>' +
        '</div>' +
        '<div class="mt-3 text-xs leading-5 text-slate-400">💾 学习记录(单词、星星、时长)都保存在<b>本机浏览器</b>的 IndexedDB 中，完全免费、无需联网、关掉页面也不会丢失。想在<b>电脑 ↔ 手机</b>间同步同一学员的数据？点「🔄 换设备 / 数据同步」，一键生成一串「分享码」，在另一台设备粘贴导入即可（可选合并或覆盖）。' + (App2.DB.isFallback() ? '' : '同一设备上还可用「👧」随时切换学员。') + '</div>' +
      '</div>' + fallbackNote;

    /* —— 组装 —— */
    var html =
      '<div class="animate-fade-up">' +
        App2.UI.Components.pageHeader('学习进度中心', '#/home', '继续加油 ♪') +
        '<div class="kitty-card mt-3 flex items-center gap-4 p-5">' +
          '<div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-kitty-200 to-kitty-300 text-[38px] shadow-kitty" id="k-avatar">' +
            (user.avatar || '🐰') +
          '</div>' +
          '<div class="min-w-0 flex-1">' +
            '<div class="flex items-center gap-2">' +
              '<div class="truncate text-lg font-extrabold text-slate-700">' + App2.Utils.esc(user.name) + '</div>' +
              '<span class="shrink-0 rounded-full bg-gradient-to-r from-kitty-400 to-kitty-500 px-2.5 py-0.5 text-[11px] font-extrabold text-white">' + titleOf(ov.stars) + '</span>' +
            '</div>' +
            '<div class="mt-1 text-xs text-slate-400">注册于 ' + fmtDate(user.createdAt) + ' · 坚持下去，你会越来越棒！</div>' +
          '</div>' +
        '</div>' +
        stats + week + mastery + wordList + manage +
      '</div>';

    App2.Utils.render(container, html);

    /* —— 交互绑定 —— */
    // 单词发音
    container.querySelectorAll('[data-speak]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        App2.Audio.speak(btn.getAttribute('data-speak'), { rate: 0.85 });
      });
    });
    // 筛选
    var filter = 'all';
    container.querySelectorAll('#k-filters [data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filter = btn.getAttribute('data-filter');
        container.querySelectorAll('#k-filters [data-filter]').forEach(function (b) {
          b.className = filterBtnClsRaw(b.getAttribute('data-filter'), b.getAttribute('data-filter') === filter);
        });
        container.querySelectorAll('#k-words .word-row').forEach(function (row) {
          row.style.display = (filter === 'all' || row.getAttribute('data-status') === filter) ? '' : 'none';
        });
      });
    });
    // 学员管理
    container.querySelector('#k-users').addEventListener('click', function () {
      App2.UI.Components.userModal();
    });
    // 重置进度
    container.querySelector('#k-reset').addEventListener('click', function () {
      if (window.confirm('确定清空『' + user.name + ' 』的全部学习记录吗？此操作不可恢复哦。')) {
        App2.Store.resetMyProgress();
        App2.Audio.chime('click');
        App2.UI.Components.celebrate(4);
        render(container);
      }
    });
    // 换设备 / 数据同步
    container.querySelector('#k-sync').addEventListener('click', function () {
      openSync(container);
    });
  }

  /** createdAt 可能是 Number 时间戳(旧数据)或 ISO 字符串，统一成 YYYY-MM-DD */
  function fmtDate(v) {
    if (!v) return '—';
    var d = new Date(v);
    if (isNaN(d.getTime())) return '—';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function statCard(emoji, label, value, color) {
    return '' +
      '<div class="kitty-card flex flex-col items-center gap-0.5 px-3 py-4 text-center">' +
        '<div class="text-lg">' + emoji + '</div>' +
        '<div class="text-xl font-extrabold ' + color + '">' + value + '</div>' +
        '<div class="text-[11px] text-slate-400">' + label + '</div>' +
      '</div>';
  }

  function filterBtn(key, label, active) {
    return '<button data-filter="' + key + '" class="' + filterBtnClsRaw(key, !!active) + '">' + label + '</button>';
  }

  function filterBtnClsRaw(key, active) {
    return 'rounded-full px-3 py-1 text-xs font-bold transition ' +
      (active ? 'bg-kitty-500 text-white shadow-kitty' : 'bg-slate-100 text-slate-500 hover:bg-kitty-100');
  }

  /* ============================================================================
   * 换设备 / 数据同步（导出 → 分享码 / 下载文件 → 另一台设备导入）
   * 说明：所有数据仍保存在本机，这里只是把当前学员的数据导出成一段可复制的
   *       文本（或一个 JSON 文件），在另一台设备上粘贴/选择后即可导入。
   *       全程离线、零成本、无需账号。
   * ============================================================================ */
  function openSync(container) {
    var ol = App2.UI.Components.modal({ content: syncShell() });
    var root = ol.root;

    // —— 顶部：导出区 ——
    var outBox = root.querySelector('#k-sync-out');
    var genBtn = root.querySelector('#k-sync-gen');
    var copyBtn = root.querySelector('#k-sync-copy');
    var downBtn = root.querySelector('#k-sync-down');
    var delBtn = root.querySelector('#k-sync-del');

    // —— 底部：导入区 ——
    var codeInput = root.querySelector('#k-sync-in-code');
    var fileInput = root.querySelector('#k-sync-in-file');
    var mergeBtn = root.querySelector('#k-sync-merge');
    var overwriteBtn = root.querySelector('#k-sync-overwrite');
    var importMsg = root.querySelector('#k-sync-msg');

    var currentCode = ''; // 最近一次导出的分享码

    function setOut(code) {
      currentCode = code;
      outBox.textContent = code ? code : '（还没有导出，点击下方按钮生成）';
      copyBtn.disabled = !code;
      downBtn.disabled = !code;
    }
    setOut('');

    function toast(cls, text) {
      importMsg.className = 'mt-3 rounded-2xl px-4 py-3 text-xs font-semibold leading-5 ' + cls;
      importMsg.textContent = text;
    }

    function doGen() {
      genBtn.disabled = true;
      App2.Store.exportShareCode().then(function (code) {
        genBtn.disabled = false;
        setOut(code);
        toast('bg-kitty-100 text-kitty-600', '已生成分享码！复制它并在另一台设备上粘贴导入。');
      }).catch(function (e) {
        genBtn.disabled = false;
        toast('bg-rose-100 text-rose-600', '导出失败：' + (e && e.message ? e.message : e));
      });
    }

    function doCopy() {
      if (!currentCode) return;
      copyText(currentCode).then(function () {
        App2.Audio.chime('click');
        toast('bg-emerald-100 text-emerald-600', '已复制到剪贴板！去另一台设备的「🔄 数据同步」粘贴导入吧。');
      }, function () {
        toast('bg-amber-100 text-amber-600', '复制失败，请长按上方文本手动复制。');
      });
    }

    function doDel() {
      if (!currentCode) return;
      downloadFile(currentCode, 'kitty-sharecode.txt');
      toast('bg-emerald-100 text-emerald-600', '已下载分享码文件（kitty-sharecode.txt），可整个发给另一台设备。');
    }

    function doImport(data, mode) {
      importMsg.textContent = '正在导入，请稍候…';
      importMsg.className = 'mt-3 rounded-2xl px-4 py-3 text-xs font-semibold leading-5 bg-kitty-100 text-kitty-600';
      App2.Store.importData(data, mode).then(function (summary) {
        App2.Audio.chime('happy');
        toast('bg-emerald-100 text-emerald-600', '导入成功！已更新为「' + (summary.user ? summary.user.name : '学员') + '」的学习进度。');
        render(container);
      }).catch(function (e) {
        toast('bg-rose-100 text-rose-600', '导入失败：' + (e && e.message ? e.message : e));
      });
    }

    function tryImport(code, mode) {
      if (!code) {
        toast('bg-amber-100 text-amber-600', '请先粘贴分享码，或选择一个导出的文件。');
        return;
      }
      App2.Store.parseShareCode(code).then(function (data) {
        doImport(data, mode);
      }).catch(function (e) {
        toast('bg-rose-100 text-rose-600', '无法解析分享码：' + (e && e.message ? e.message : e));
      });
    }

    genBtn.addEventListener('click', doGen);
    copyBtn.addEventListener('click', doCopy);
    downBtn.addEventListener('click', doDel);

    function onImport(mode) {
      var code = codeInput.value.trim();
      if (code) { tryImport(code, mode); return; }
      var f = fileInput.files && fileInput.files[0];
      if (f) {
        readTextFile(f).then(function (text) {
          tryImport(text, mode);
        }, function (e) {
          toast('bg-rose-100 text-rose-600', '读取文件失败：' + (e && e.message ? e.message : e));
        });
        return;
      }
      toast('bg-amber-100 text-amber-600', '请先粘贴分享码，或选择一个导出的文件。');
    }
    mergeBtn.addEventListener('click', function () { onImport('merge'); });
    overwriteBtn.addEventListener('click', function () { onImport('overwrite'); });

    // 关闭弹窗（点击右上角 ✕）
    root.querySelector('#k-sync-close').addEventListener('click', ol.close);
  }

  /** 分享码弹窗骨架 */
  function syncShell() {
    var primary = primaryBtn();
    return '' +
      '<div class="p-6">' +
        '<div class="flex items-start justify-between">' +
          '<div>' +
            '<div class="text-lg font-extrabold text-kitty-600">🔄 换设备 / 数据同步</div>' +
            '<div class="mt-0.5 text-xs text-slate-400">同一学员的数据，在电脑和手机之间自由互通</div>' +
          '</div>' +
          '<button id="k-sync-close" class="btn-ghost flex h-9 w-9 items-center justify-center text-slate-400" aria-label="关闭">✕</button>' +
        '</div>' +

        /* 导出 */
        '<div class="mt-5 rounded-2xl bg-kitty-50 p-4">' +
          '<div class="mb-2 text-sm font-extrabold text-slate-700">① 导出（在这个设备上）</div>' +
          '<div class="text-xs leading-5 text-slate-500">把当前学员的单词、星星、时长打包成一段「分享码」或一个文件，全程离线、零成本、无需注册。</div>' +
          '<div class="mt-3 min-h-[52px] break-all rounded-2xl border border-kitty-200 bg-white px-3 py-2 text-xs leading-5 text-slate-600 select-text" id="k-sync-out"></div>' +
          '<div class="mt-3 flex flex-wrap gap-2">' +
            '<button id="k-sync-gen" class="' + primary + '">✨ 生成分享码</button>' +
            '<button id="k-sync-copy" class="btn-ghost py-2.5" disabled>📋 复制分享码</button>' +
            '<button id="k-sync-down" class="btn-ghost py-2.5" disabled>⬇️ 下载分享码文件</button>' +
          '</div>' +
        '</div>' +

        /* 导入 */
        '<div class="mt-4 rounded-2xl bg-mint/20 p-4">' +
          '<div class="mb-2 text-sm font-extrabold text-slate-700">② 导入（在另一台设备上）</div>' +
          '<div class="text-xs leading-5 text-slate-500">粘贴上方生成的分享码，或选择下载的分享码文件。</div>' +
          '<input id="k-sync-in-code" class="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 select-text" placeholder="粘贴分享码（KSYNC1: 开头）…" />' +
          '<label class="mt-2 flex items-center gap-2 text-xs text-slate-500">📁 或选择文件：' +
            '<input id="k-sync-in-file" type="file" accept=".txt,.json,text/plain,application/json" class="text-xs" />' +
          '</label>' +
          '<div class="mt-3 flex flex-wrap gap-2">' +
            '<button id="k-sync-merge" class="btn-ghost py-2.5">🔀 合并导入</button>' +
            '<button id="k-sync-overwrite" class="' + primary + '">♻️ 覆盖导入</button>' +
          '</div>' +
          '<div class="mt-3 text-[11px] leading-4 text-slate-400">「合并」保留两台设备已有的记录并补上缺失部分；「覆盖」以导入的数据为准（<b>会清掉本机原有记录</b>）。</div>' +
        '</div>' +

        '<div id="k-sync-msg"></div>' +
      '</div>';
  }

  /** 主按钮样式（theme.css 里没有 .btn-primary，用内联 Tailwind 渐变） */
  function primaryBtn() {
    return 'rounded-full bg-gradient-to-r from-kitty-400 to-kitty-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-kitty transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  }

  /* ------- 复制文本到剪贴板（兼容旧浏览器 + iOS）------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(text);
      });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /* ------- 触发文件下载 ------- */
  function downloadFile(text, filename) {
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ------- 读取用户选择的文本文件 ------- */
  function readTextFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result)); };
      reader.onerror = function () { reject(reader.error || new Error('读取文件失败')); };
      reader.readAsText(file);
    });
  }
})(window.App.Features = window.App.Features || {});
