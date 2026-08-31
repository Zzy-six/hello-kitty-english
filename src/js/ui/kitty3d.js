/* ============================================================================
 * ui/kitty3d.js — 3D 可拖拽立绘组件「观赏模式」
 * ----------------------------------------------------------------------------
 * 把透明立绘 src/assets/kitty-3d.png 做成可以拿在手里玩的 3D 卡片：
 *   · 按住 Kitty 即可跟手拖动（支持鼠标与触屏 pointer 事件）
 *   · 拖动时按指针相对位置做透视倾斜（rotateX/rotateY，像转动一张立体卡片）
 *   · 脚下影子同步偏移、变淡，产生「离开地面」的立体感
 *   · 松手弹性回位（spring 缓动），平时漂浮摇摆 + 柔光晕
 *
 * ★ ZyCode 迭代入口：
 *   · 改尺寸：stage({ size })；改倾斜幅度：MAX_TILT / MAX_XROT
 *   · 换立绘：替换 assets/kitty-3d.png 即可（保持透明背景）
 *
 * 对外接口（经典全局命名空间，无构建）：
 *   App.UI.Kitty3D.stage({size})   生成舞台 HTML（未绑定交互）
 *   App.UI.Kitty3D.bind(root)      绑定 root 内所有 .kt-stage 的拖拽交互
 *
 * 用法：
 *   container.insertAdjacentHTML('beforeend', App.UI.Kitty3D.stage({ size: 210 }));
 *   App.UI.Kitty3D.bind(container);
 * ============================================================================ */
(function (Kitty3D) {
  'use strict';

  var MAX_TILT = 34;    // 最大 rotateY（左右甩动，度）
  var MAX_XROT = 26;    // 最大 rotateX（上下俯仰，度）
  var PULL_X = 0.55;    // 水平可拖范围（相对宽度的倍数）
  var PULL_UP = 0.55;   // 向上可拖范围（相对高度的倍数）
  var PULL_DOWN = 0.34; // 向下可拖范围（相对高度的倍数）

  /* 生成舞台 HTML（纯字符串，可被 insertAdjacentHTML / Utils.render 使用） */
  Kitty3D.stage = function (opts) {
    opts = opts || {};
    var w = opts.size || 220;
    var h = Math.round(w * 738 / 751); // 与 kitty-3d.png 宽高比一致
    return '' +
      '<div class="kt-stage" data-kt3d style="width:' + w + 'px;height:' + h + 'px;perspective:760px">' +
        '<div class="kt-halo"></div>' +
        '<div class="kt-shadow" aria-hidden="true"></div>' +
        '<div class="kt-drag" role="img" aria-label="Hello Kitty，可以拖动我">' +
          '<div class="kt-bob">' +
            '<img class="kt-cat" src="./assets/kitty-3d.png" alt="Hello Kitty" draggable="false" ' +
              'style="width:' + w + 'px;height:' + h + 'px;object-fit:contain">' +
          '</div>' +
        '</div>' +
        '<div class="kt-hint">🧸 按住 Kitty 拖一拖</div>' +
      '</div>';
  };

  /* 给 root 内所有舞台绑定交互（幂等：重复调用不会重复绑定） */
  Kitty3D.bind = function (root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('.kt-stage[data-kt3d]').forEach(function (stage) {
      if (stage.__kt3d) return; // 已绑定
      stage.__kt3d = true;
      bindStage(stage);
    });
  };

  function bindStage(stage) {
    var drag = stage.querySelector('.kt-drag');
    var shadow = stage.querySelector('.kt-shadow');
    if (!drag) return;

    var active = false;    // 是否正在拖拽
    var sx = 0, sy = 0;    // 按下时的指针坐标
    var rect = null;       // 按下时的舞台框（拖动中保持不变，保证跟手稳定）
    var bound = null;

    function onMove(e) {
      if (!active) return;
      var w = rect.width, h = rect.height;
      var dx = e.clientX - sx;
      var dy = e.clientY - sy;

      // 限制拖拽范围：立绘只允许在舞台附近滑动，松手后回位
      var lx = Math.max(-w * PULL_X, Math.min(w * PULL_X, dx));
      var ly = Math.max(-h * PULL_UP, Math.min(h * PULL_DOWN, dy));
      if (lx !== dx) lx = dx > 0 ? w * PULL_X : -w * PULL_X;
      if (ly !== dy) ly = dy > 0 ? h * PULL_DOWN : -h * PULL_UP;

      // 透视倾斜：指针在左右半边 → 立体旋转，像把立绘斜着转过来看
      var px = (e.clientX - rect.left) / w - 0.5;
      var py = (e.clientY - rect.top) / h - 0.5;
      var ry = px * MAX_TILT * 2;            // 左右 ±MAX_TILT
      var rx = -py * MAX_XROT * 2;           // 上下 ±MAX_XROT

      drag.style.transform =
        'translate3d(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px,0) ' +
        'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';

      // 影子：跟随半联动（拖得越远越淡），拉高时变小产生悬空感
      if (shadow) {
        var lift = Math.pow(Math.abs(ly) / (h * PULL_UP), 0.8);
        shadow.style.opacity = String(Math.max(0.25, 1 - lift * 0.9));
        shadow.style.transform =
          'translateX(calc(-50% + ' + (lx * 0.4).toFixed(1) + 'px)) scale(' + (1 - lift * 0.25).toFixed(3) + ')';
      }
      if (e.cancelable) e.preventDefault(); // 拖动时禁止页面滚动/选中
    }

    function onUp() {
      if (!active) return;
      active = false;
      drag.classList.remove('kt-hold');
      drag.style.transform = '';   // 清空内联 transform → 走 .kt-drag 的 spring 过渡回位
      if (shadow) {
        shadow.style.opacity = '';
        shadow.style.transform = '';
      }
      if (bound) {
        window.removeEventListener('pointermove', onMove, true);
        window.removeEventListener('pointerup', onUp, true);
        window.removeEventListener('pointercancel', onUp, true);
        bound = null;
      }
    }

    drag.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return; // 只响应主键/触摸
      if (active) return;
      active = true;
      sx = e.clientX; sy = e.clientY;
      rect = drag.getBoundingClientRect();
      drag.classList.add('kt-hold');
      // 全局监听：即使指针滑出舞台也能跟手
      window.addEventListener('pointermove', onMove, true);
      window.addEventListener('pointerup', onUp, true);
      window.addEventListener('pointercancel', onUp, true);
      bound = true;
      if (e.cancelable) e.preventDefault();
    });
  }
})((window.App.UI = window.App.UI || {}).Kitty3D ||= {});
