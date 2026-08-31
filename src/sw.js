/* ============================================================================
 * sw.js — Service Worker（PWA 离线支持）
 * ----------------------------------------------------------------------------
 * 策略：网络优先 + 失败回退缓存。打开过的页面在断网时也能访问，
 * 让「Kitty英语乐园」可以像原生 App 一样安装到桌面/主屏、离线可用。
 *
 * 只在 http/https 下注册（Electron 的 file:// 不注册，见 app.js），
 * 因此它不会影响桌面版的启动。
 * ============================================================================ */
'use strict';

var VERSION = 'kitty-english-v1';
var CACHE = VERSION;

// 需要预先缓存的核心资源（URL 相对 sw.js 所在目录）
var PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/theme.css',
  './vendor/tailwind.js',
  './js/core/utils.js',
  './js/core/db.js',
  './js/core/store.js',
  './js/core/audio.js',
  './js/core/timer.js',
  './js/core/router.js',
  './js/data/words-data.js',
  './js/data/dialogues-data.js',
  './js/data/game-config.js',
  './js/ui/kitty.js',
  './js/ui/components.js',
  './js/ui/decor.js',
  './js/features/home.js',
  './js/features/quiz.js',
  './js/features/dialogue.js',
  './js/features/game.js',
  './js/features/progress.js',
  './js/app.js',
  './assets/icon-192.png',
  './assets/icon-256.png',
  './assets/icon-512.png',
  './assets/kitty-logo.svg'
];

// 只处理同源请求，避免缓存第三方统计等
function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) {
        return Promise.all(
          PRECACHE.map(function (url) {
            var req = new Request(url, { credentials: 'same-origin' });
            return fetch(req).then(function (res) {
              // 只有有效响应才缓存
              if (res && res.ok) cache.put(url, res.clone());
              return res;
            }).catch(function () { /* 个别资源失败不阻塞安装 */ });
          })
        );
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
        })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  var url = new URL(req.url);

  // 只处理 GET 且同源（用户数据是 IndexedDB，不走网络）
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // 页面导航：网络优先，失败回退缓存
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // 其它资源：网络优先，失败回退缓存（并顺便更新缓存）
  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
