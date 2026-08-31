/* ============================================================================
 * ui/decor.js — 全屏樱花花瓣 + 爱心漂浮装饰
 * ----------------------------------------------------------------------------
 * 全 SVG/文本表情粒子，纯 CSS 动画，零图片资源。
 * 粒子数量与速度保持克制（16个），保证低端手机流畅。
 * ============================================================================ */
(function (Decor) {
  'use strict';

  var PETALS = ['🌸', '💗', '🎀', '🩷', '💮', '🌸', '✨', '🩵'];

  /** 挂载背景粒子层（app.js 启动时调用一次） */
  Decor.init = function () {
    var layer = document.getElementById('decor-layer');
    if (!layer) return;
    var count = 16;

    for (var i = 0; i < count; i++) {
      var p = document.createElement('div');
      p.className = 'petal';
      p.textContent = PETALS[i % PETALS.length];
      p.style.left = (Math.random() * 96) + 'vw';
      p.style.fontSize = (12 + Math.random() * 14) + 'px';
      p.style.opacity = '0';

      // 每个粒子：起点/终点横向摆动/时长/延迟全部随机 → 错落自然
      var dur = 9 + Math.random() * 9;          // 飘完一轮的秒数
      var delay = -Math.random() * dur;          // 负延迟让页面一打开就有花瓣在半空
      p.style.setProperty('--petal-sway', (Math.random() * 90 - 45) + 'px');
      p.style.setProperty('--petal-opacity', (0.35 + Math.random() * 0.4).toFixed(2));
      p.style.animation = 'k-fall ' + dur + 's linear ' + delay + 's infinite';

      layer.appendChild(p);
    }
  };
})((window.App.UI = window.App.UI || {}).Decor ||= {});
