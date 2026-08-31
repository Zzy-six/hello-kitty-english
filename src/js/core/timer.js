/* ============================================================================
 * core/timer.js — 学习时长自动统计
 * ----------------------------------------------------------------------------
 * 应用打开后即开始计时，每 15 秒把增量写入 Store（IndexedDB 每日记录）。
 * 页面隐藏/关闭时把剩余不足 15 秒的零头也落盘，确保"学习时间记录"不丢。
 * ============================================================================ */
(function (Timer) {
  'use strict';

  var tick = 0;        // 累计秒数（满15秒提交一次）
  var intervalId = null;
  var started = false;

  /** 提交当前攒下的秒数 */
  function flush() {
    if (tick <= 0) return;
    var sec = tick;
    tick = 0;
    App.Store.addStudySeconds(sec);
  }

  /** 启动学习计时（app.js 初始化完成后调用） */
  Timer.start = function () {
    if (started) return;
    started = true;
    intervalId = setInterval(function () {
      // 仅在页面可见时累积，避免后台挂机刷时长
      if (document.visibilityState === 'visible') {
        tick++;
        if (tick >= 15) flush();
      }
    }, 1000);
    // 隐藏/离开页面前落盘零头
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') flush();
    });
    window.addEventListener('pagehide', flush);
  };

  Timer.stop = function () {
    if (!started) return;
    started = false;
    clearInterval(intervalId);
    flush();
  };
})(window.App.Timer = window.App.Timer || {});
