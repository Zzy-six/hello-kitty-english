/* ============================================================================
 * ui/kitty.js — 主形象「Hello Kitty」角色系统
 * ----------------------------------------------------------------------------
 * 主形象「Hello Kitty」使用用户指定的 3D 立绘透明PNG（assets/kitty-3d.png），
 * 由开发期 AI 抠图工具生成（scripts/electron-cutout.js + electron-clean.js）。
 *
 * ⚠️ 版权说明：Hello Kitty 是 Sanrio 的注册商标/版权形象，本图用于学习演示用途，
 *    若用于商业发布需自行取得 Sanrio 授权；不可声称“免费可商用”。
 *
 * ★ ZyCode 迭代入口：
 *   · 想换主形象：替换 src/assets/kitty-3d.png 即可（保持透明背景）
 *   · 想加表情：目前 head/fullBody 使用单一立绘，mood 参数已忽略；
 *              如需表情可叠加纯 CSS 表情层或换图
 *   · 小伙伴兔子 bunny() 与蝴蝶结 bow() 仍为原创 SVG，安全可商用
 *
 * 对外接口：
 *   App.UI.Kitty.head({mood, size})       头像（圆形裁切到头部）
 *   App.UI.Kitty.fullBody({mood, size})   全身主视觉
 *   App.UI.Kitty.bunny({size})            小伙伴兔子头像（对话页用）
 *   App.UI.Kitty.bow({size})              独立蝴蝶结装饰
 * ============================================================================ */
(function (Kitty) {
  'use strict';

  /* 配色常量：全局统一在这里改 */
  var C = {
    fur: '#ffffff',
    furLine: '#f2b4c6',      // 软粉描边
    bow: '#ff4d7d',
    bowDark: '#e6396c',
    nose: '#ffd35c',
    noseLine: '#ecae52',
    mouth: '#d1637f',
    mouthFill: '#e25975',
    blush: '#ffb3c9',
    tear: '#9fd8ff',
    shoe: '#ff4d7d'
  };

  /* 描边风格已通过叠层实现，此处保留配色常量即可 */

  /* ------------------------------------------------------------------
   * 脸部部件：根据 mood 拼装眼睛/嘴巴/腮红/眼泪
   * sx = 中心x, sy = 鼻子上方基准y（眼睛所在行）
   * ------------------------------------------------------------------ */
  function faceParts(mood, sx, sy) {
    var parts = '';
    var eyeL = sx - 30, eyeR = sx + 30;
    var eyeY = sy;

    if (mood === 'happy' || mood === 'win') {
      // 弯弯的笑眼 ^_^
      parts += '<path d="M' + (eyeL - 10) + ' ' + (eyeY + 1) + ' Q' + eyeL + ' ' + (eyeY - 15) + ' ' + (eyeL + 10) + ' ' + (eyeY + 1) + '" fill="none" stroke="#3f2a33" stroke-width="5.5" stroke-linecap="round"/>';
      parts += '<path d="M' + (eyeR - 10) + ' ' + (eyeY + 1) + ' Q' + eyeR + ' ' + (eyeY - 15) + ' ' + (eyeR + 10) + ' ' + (eyeY + 1) + '" fill="none" stroke="#3f2a33" stroke-width="5.5" stroke-linecap="round"/>';
    } else if (mood === 'sad') {
      // 下垂的委屈眼 + 眼泪
      parts += '<path d="M' + (eyeL - 9) + ' ' + (eyeY - 6) + ' Q' + eyeL + ' ' + (eyeY + 5) + ' ' + (eyeL + 9) + ' ' + (eyeY - 6) + '" fill="none" stroke="#3f2a33" stroke-width="5" stroke-linecap="round"/>';
      parts += '<path d="M' + (eyeR - 9) + ' ' + (eyeY - 6) + ' Q' + eyeR + ' ' + (eyeY + 5) + ' ' + (eyeR + 9) + ' ' + (eyeY - 6) + '" fill="none" stroke="#3f2a33" stroke-width="5" stroke-linecap="round"/>';
      parts += '<path d="M' + (eyeL + 14) + ' ' + (eyeY + 6) + ' c5 7 5 11 0 14 c-5 -3 -5 -7 0 -14" fill="' + C.tear + '"/>';
    } else {
      // 正常大眼睛 ●︿●
      parts += '<ellipse cx="' + eyeL + '" cy="' + eyeY + '" rx="5.6" ry="9.5" fill="#3f2a33"/>';
      parts += '<ellipse cx="' + eyeR + '" cy="' + eyeY + '" rx="5.6" ry="9.5" fill="#3f2a33"/>';
    }

    // 鼻子（黄色小椭圆）
    parts += '<ellipse cx="' + sx + '" cy="' + (eyeY + 19) + '" rx="7" ry="5" fill="' + C.nose + '" stroke="' + C.noseLine + '" stroke-width="1.6"/>';

    // 嘴巴
    if (mood === 'happy' || mood === 'win') {
      parts += '<path d="M' + (sx - 14) + ' ' + (eyeY + 26) + ' Q' + sx + ' ' + (eyeY + 46) + ' ' + (sx + 14) + ' ' + (eyeY + 26) + ' Z" fill="' + C.mouthFill + '"/>';
    } else if (mood === 'sad') {
      parts += '<path d="M' + (sx - 10) + ' ' + (eyeY + 38) + ' Q' + sx + ' ' + (eyeY + 28) + ' ' + (sx + 10) + ' ' + (eyeY + 38) + '" fill="none" stroke="' + C.mouth + '" stroke-width="3" stroke-linecap="round"/>';
    } else {
      // 经典猫咪「ω」嘴
      parts += '<path d="M' + (sx - 11) + ' ' + (eyeY + 27) + ' Q' + (sx - 5) + ' ' + (eyeY + 35) + ' ' + sx + ' ' + (eyeY + 27) + ' Q' + (sx + 5) + ' ' + (eyeY + 35) + ' ' + (sx + 11) + ' ' + (eyeY + 27) + '" fill="none" stroke="' + C.mouth + '" stroke-width="2.8" stroke-linecap="round"/>';
    }

    // 腮红
    parts += '<ellipse cx="' + (sx - 45) + '" cy="' + (eyeY + 20) + '" rx="10" ry="6.5" fill="' + C.blush + '" opacity="0.85"/>';
    parts += '<ellipse cx="' + (sx + 45) + '" cy="' + (eyeY + 20) + '" rx="10" ry="6.5" fill="' + C.blush + '" opacity="0.85"/>';
    return parts;
  }

  /* 蝴蝶结（两瓣 + 中心结），可指定中心坐标与缩放 */
  function bow(cx, cy, scale) {
    var s = scale || 1;
    return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" stroke="' + C.bowDark + '" stroke-width="2">' +
      '<ellipse cx="-14" cy="-2" rx="14" ry="9.5" fill="' + C.bow + '" transform="rotate(-22 -14 -2)"/>' +
      '<ellipse cx="14" cy="-2" rx="14" ry="9.5" fill="' + C.bow + '" transform="rotate(22 14 -2)"/>' +
      '<circle cx="0" cy="0" r="6.5" fill="#ff7ba0"/>' +
      '</g>';
  }

  /* 胡须工具：dir=1 向左伸（脸左侧），dir=-1 向右伸（脸右侧） */
  function whiskers(sx, sy, w, dir) {
    var d = dir || 1;
    return '<g stroke="#e79aae" stroke-width="2.6" stroke-linecap="round" fill="none">' +
      '<path d="M' + sx + ' ' + (sy - 10) + ' L' + (sx - w * d) + ' ' + (sy - 18) + '"/>' +
      '<path d="M' + sx + ' ' + sy + ' L' + (sx - w * d) + ' ' + sy + '"/>' +
      '<path d="M' + sx + ' ' + (sy + 10) + ' L' + (sx - w * d) + ' ' + (sy + 18) + '"/>' +
      '</g>';
  }

  /* ==================== 1. 头部头像（圆形裁切到头部） ==================== */
  Kitty.head = function (opts) {
    opts = opts || {};
    // mood 参数已忽略（单一立绘）
    var size = opts.size || 120;
    return '<div class="inline-block overflow-hidden rounded-full" style="width:' + size + 'px;height:' + size + 'px;">' +
      '<img src="./assets/kitty-3d.png" alt="Hello Kitty" style="width:100%;height:100%;object-fit:cover;object-position:50% 16%;display:block;">' +
      '</div>';
  };

  /* ==================== 2. 全身主视觉（自动按比例，透明背景） ==================== */
  Kitty.fullBody = function (opts) {
    opts = opts || {};
    // mood/animate 参数已忽略（单一立绘；由调用方包裹 animate-bob 实现浮动）
    var size = opts.size || 240;
    var h = Math.round(size * 738 / 751);
    return '<img src="./assets/kitty-3d.png" alt="Hello Kitty" style="width:' + size + 'px;height:' + h + 'px;object-fit:contain;display:block;">';
  };

  /* ==================== 3. 小伙伴兔子头像（对话页） ==================== */
  Kitty.bunny = function (opts) {
    opts = opts || {};
    var size = opts.size || 56;
    return '<svg viewBox="0 0 120 130" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg" style="display:block">' +
      '<path d="M34 46 Q30 8 46 8 Q58 16 52 44 Z" fill="#fff" stroke="#e9b7c6" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M86 46 Q90 8 74 8 Q62 16 68 44 Z" fill="#fff" stroke="#e9b7c6" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M38 34 Q38 20 46 21 Q52 27 49 40 Z" fill="#ffb7cd" opacity="0.9"/>' +
      '<path d="M82 34 Q82 20 74 21 Q68 27 71 40 Z" fill="#ffb7cd" opacity="0.9"/>' +
      '<ellipse cx="60" cy="84" rx="46" ry="40" fill="#fff" stroke="#e9b7c6" stroke-width="2.5"/>' +
      '<ellipse cx="46" cy="82" rx="4.6" ry="7.5" fill="#3f2a33"/>' +
      '<ellipse cx="74" cy="82" rx="4.6" ry="7.5" fill="#3f2a33"/>' +
      '<ellipse cx="60" cy="94" rx="4.5" ry="3.5" fill="#ffb7cd"/>' +
      '<ellipse cx="38" cy="94" rx="7" ry="4.5" fill="#ffc9d9" opacity="0.8"/>' +
      '<ellipse cx="82" cy="94" rx="7" ry="4.5" fill="#ffc9d9" opacity="0.8"/>' +
      '<path d="M52 102 Q57 108 60 102 L60 102 Q63 108 68 102" fill="none" stroke="#d1637f" stroke-width="2.5" stroke-linecap="round"/>' +
      '</svg>';
  };

  /* ==================== 4. 蝴蝶结装饰（标题/空状态） ==================== */
  Kitty.bow = function (opts) {
    opts = opts || {};
    var size = opts.size || 40;
    return '<svg viewBox="-40 -24 80 48" width="' + size + '" height="' + size * 0.6 + '" xmlns="http://www.w3.org/2000/svg" style="display:block">' +
      bow(0, 0, 1.6) + '</svg>';
  };
})((window.App.UI = window.App.UI || {}).Kitty ||= {});
