/* ============================================================================
 * core/store.js — 学习进度业务存储（多用户数据隔离）
 * ----------------------------------------------------------------------------
 * 在 App.DB（IndexedDB）之上封装"业务语义"：
 *   · 学习者档案：增/切换/改名/删除（每个学习者数据完全隔离）
 *   · 答题记录：recordAnswer(wordId, correct) —— 对错次数 + 每日统计
 *   · 星星积分：addStars(n) —— 全局积分 + 每日统计
 *   · 学习时长：addStudySeconds(n) —— 每日统计（由 App.Timer 周期写入）
 *   · getOverview()：进度中心一次取全量汇总
 *
 * ★ ZyCode 迭代提示：要新增"错题本""连胜榜"等数据，只需在这里加方法，
 *   页面层调 Store.xxx() 即可，不要绕过本层直接碰 App.DB。
 * ============================================================================ */
(function (Store) {
  'use strict';

  var CURRENT_KEY = 'kitty.currentUserId'; // localStorage 记住上次登录的账号
  var current = null;    // 当前登录账号对象 {id,name,avatar,username,role,...}
  var cache = {};        // 当前用户数据缓存 { wordStats:{}, daily:{}, meta:{} }

  /* ---------------- 账号 & 档案 ---------------- */

  /** 可选头像（可爱表情，免费系统自带） */
  var AVATARS = ['🐱', '🎀', '🐰', '🐼', '🦄', '🌸', '🍓', '⭐', '🐹', '🍭'];
  var usersCache = []; // Store.init() 后可用，避免重复异步查询

  Store.AVATARS = AVATARS;

  /** 用户名规则：2~20 位字母/数字/下划线（存储/比较统一小写） */
  var USERNAME_RE = /^[a-z0-9_]{2,20}$/;

  /** 内置管理员账号（仅代码种子数据，不出现在任何文档说明中） */
  var ADMIN_SEED = { username: 'zzy', password: 'Zzy' };

  /** 应用启动时调用：加载账号列表 → 兜底创建管理员 → 恢复登录态 */
  Store.init = function () {
    return Store.listUsers().then(function (users) {
      usersCache = users;
      return ensureAdmin();
    }).then(function () {
      // 恢复上次登录的账号；必须是「完整账号」（有用户名+密码）才自动进入
      var savedId = null;
      try { savedId = localStorage.getItem(CURRENT_KEY); } catch (e) {}
      var saved = usersCache.find(function (u) { return u.id === savedId; });
      if (saved && saved.username && saved.passwordHash) return Store.enter(saved.id);
      return null; // 未登录 → 由启动器跳到登录页
    });
  };

  /** 预置管理员账号：每次启动兜底检查，保证管理员永远存在（不可删） */
  function ensureAdmin() {
    var has = usersCache.some(function (u) { return u.username === ADMIN_SEED.username; });
    if (has) return Promise.resolve();
    var admin = {
      id: App.Utils.uid('a'),
      name: ADMIN_SEED.username,
      avatar: '👑',
      username: ADMIN_SEED.username,
      role: 'admin',
      passwordHash: hashPassword(ADMIN_SEED.password, ADMIN_SEED.username),
      createdAt: Date.now()
    };
    return App.DB.put('users', admin).then(function () {
      usersCache.push(admin);
    });
  }

  /** 加盐单向哈希（非密码学安全，但用于本地防明文存储已足够） */
  function hashPassword(password, salt) {
    var str = salt + '\u2605kitty\u2605' + String(password) + '\u2605' + salt;
    var h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
    for (var r = 0; r < 512; r++) {
      for (var i = 0; i < str.length; i++) {
        h1 = Math.imul(h1 ^ str.charCodeAt(i), 2654435761);
        h2 = Math.imul(h2 ^ str.charCodeAt(i), 1597334677);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }

  Store.hashPassword = hashPassword; // 供其他层演示/校验复用

  /** 注册新账号（数据只保存在本机，账号名全局唯一） */
  Store.register = function (username, password, nickname, avatar) {
    username = String(username || '').trim().toLowerCase();
    nickname = String(nickname || '').trim().slice(0, 12);
    if (!USERNAME_RE.test(username)) {
      return Promise.reject(new Error('账号需 2~20 位字母、数字或下划线。'));
    }
    if (String(password || '').length < 3) {
      return Promise.reject(new Error('密码至少 3 位，记得保护好哦。'));
    }
    if (usersCache.some(function (u) { return u.username === username; })) {
      return Promise.reject(new Error('这个账号已经被注册啦，直接登录吧！'));
    }
    var user = {
      id: App.Utils.uid('k'),
      name: nickname || username,
      avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      username: username,
      role: 'user',
      passwordHash: hashPassword(password, username),
      createdAt: Date.now()
    };
    return App.DB.put('users', user).then(function () {
      usersCache.push(user);
      return Store.enter(user.id);
    }).then(function () {
      return user;
    });
  };

  /** 账号登录（用户名不区分大小写） */
  Store.login = function (username, password) {
    username = String(username || '').trim().toLowerCase();
    var u = usersCache.find(function (x) { return x.username === username; });
    if (!u) {
      return Promise.reject(new Error('该账号还没有注册，先创建一个吧！'));
    }
    if (hashPassword(password || '', username) !== u.passwordHash) {
      return Promise.reject(new Error('密码不对哦，再试一次～'));
    }
    return Store.enter(u.id);
  };

  /** 退出登录：回到登录页（数据都还在本机，下次登录接着学） */
  Store.logout = function () {
    current = null;
    cache = { wordStats: {}, daily: {}, meta: null };
    try { localStorage.removeItem(CURRENT_KEY); } catch (e) {}
    App.Utils.bus.emit('user-changed', null);
    return Promise.resolve();
  };

  /** 当前是否管理员 */
  Store.isAdmin = function () {
    return !!(current && current.role === 'admin');
  };

  /** 校验当前账号密码（删除账号等敏感操作前用） */
  Store.verifyPassword = function (password) {
    if (!current || !current.username) return Promise.resolve(false);
    return Promise.resolve(hashPassword(password || '', current.username) === current.passwordHash);
  };

  Store.listUsers = function () {
    return App.DB.all('users').then(function (users) {
      return users.sort(function (a, b) { return a.createdAt - b.createdAt; });
    });
  };

  /** 新增学习者并自动切换为当前用户（旧版无账号入口；新功能请用 Store.register） */
  Store.addUser = function (name, avatar) {
    var user = {
      id: App.Utils.uid('u'),
      name: String(name || '小可爱').slice(0, 12),
      avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      createdAt: Date.now()
    };
    return App.DB.put('users', user).then(function () {
      usersCache.push(user);
      return Store.enter(user.id);
    }).then(function () {
      return user;
    });
  };

  /** 切换当前学习者（数据隔离的关键：所有读写都带 userId） */
  Store.enter = function (userId) {
    return App.DB.get('users', userId).then(function (user) {
      if (!user) throw new Error('学习者不存在: ' + userId);
      current = user;
      try { localStorage.setItem(CURRENT_KEY, userId); } catch (e) {}
      cache = { wordStats: {}, daily: {}, meta: null };
      // 预热缓存：该用户的全部记录
      return App.DB.byUser('wordStats', userId).then(function (rows) {
        rows.forEach(function (r) { cache.wordStats[r.wordId] = r; });
        return App.DB.byUser('dailyStats', userId);
      }).then(function (rows) {
        rows.forEach(function (r) { cache.daily[r.date] = r; });
        return App.DB.get('meta', userId);
      }).then(function (meta) {
        cache.meta = meta || { id: userId, stars: 0, createdAt: user.createdAt };
        App.Utils.bus.emit('user-changed', current);
        return current;
      });
    });
  };

  Store.getCurrentUser = function () { return current; };

  /** 学员总数（同步，Store.init 之后可安全调用） */
  Store.userCount = function () { return usersCache.length; };

  /** 修改当前学习者昵称/头像 */
  Store.updateCurrentUser = function (patch) {
    if (!current) return Promise.resolve(null);
    Object.assign(current, patch);
    return App.DB.put('users', current).then(function () {
      App.Utils.bus.emit('user-changed', current);
      return current;
    });
  };

  /** 删除账号：清除其全部数据（档案/单词统计/每日统计/积分）；管理员账号受保护 */
  Store.deleteUser = function (userId) {
    var target = usersCache.find(function (u) { return u.id === userId; });
    if (target && target.role === 'admin') {
      return Promise.reject(new Error('管理员账号不可删除。'));
    }
    var jobs = [];
    jobs.push(App.DB.delete('users', userId));
    jobs.push(App.DB.byUser('wordStats', userId).then(function (rows) {
      rows.forEach(function (r) { jobs.push(App.DB.delete('wordStats', r.id)); });
    }));
    jobs.push(App.DB.byUser('dailyStats', userId).then(function (rows) {
      rows.forEach(function (r) { jobs.push(App.DB.delete('dailyStats', r.id)); });
    }));
    jobs.push(App.DB.delete('meta', userId));
    return Promise.all(jobs).then(function () {
      usersCache = usersCache.filter(function (u) { return u.id !== userId; });
      if (current && current.id === userId) {
        current = null;
        try { localStorage.removeItem(CURRENT_KEY); } catch (e) {}
      }
    });
  };

  /* ---------------- 每日统计（内部工具） ---------------- */

  /** 确保今天的 dailyStats 记录存在并返回（带缓存） */
  function todayRecord() {
    var date = App.Utils.today();
    var rec = cache.daily[date];
    if (!rec) {
      rec = { id: current.id + '::' + date, userId: current.id, date: date, seconds: 0, correct: 0, wrong: 0, stars: 0 };
      cache.daily[date] = rec;
    }
    return rec;
  }

  function saveDaily(rec) { return App.DB.put('dailyStats', rec); }

  /* ---------------- 核心业务方法 ---------------- */

  /**
   * 记录一次答题结果（单词闯关用）
   * @param {string} wordId  单词id
   * @param {boolean} correct 是否答对
   */
  Store.recordAnswer = function (wordId, correct) {
    if (!current) return Promise.resolve();
    // 1) 单词维度统计
    var st = cache.wordStats[wordId];
    if (!st) {
      st = { id: current.id + '::' + wordId, userId: current.id, wordId: wordId, correct: 0, wrong: 0, lastAt: 0 };
      cache.wordStats[wordId] = st;
    }
    if (correct) st.correct++; else st.wrong++;
    st.lastAt = Date.now();
    // 2) 每日统计
    var daily = todayRecord();
    if (correct) daily.correct++; else daily.wrong++;
    return Promise.all([App.DB.put('wordStats', st), saveDaily(daily)]).then(function () {
      App.Utils.bus.emit('progress', { type: 'answer', wordId: wordId, correct: correct });
    });
  };

  /** 增加星星积分（答对/游戏通关） */
  Store.addStars = function (n) {
    if (!current || !n) return Promise.resolve();
    cache.meta.stars = (cache.meta.stars || 0) + n;
    var daily = todayRecord();
    daily.stars += n;
    return Promise.all([App.DB.put('meta', cache.meta), saveDaily(daily)]).then(function () {
      App.Utils.bus.emit('stars', cache.meta.stars); // 顶栏实时刷新
    });
  };

  /** 累加学习秒数（由 App.Timer 每15秒调一次） */
  Store.addStudySeconds = function (sec) {
    if (!current || !sec) return Promise.resolve();
    var daily = todayRecord();
    daily.seconds += sec;
    return saveDaily(daily);
  };

  /** 清空"当前学习者"的全部学习数据（保留档案本身） */
  Store.resetMyProgress = function () {
    if (!current) return Promise.resolve();
    var jobs = [];
    Object.keys(cache.wordStats).forEach(function (wid) {
      jobs.push(App.DB.delete('wordStats', cache.wordStats[wid].id));
    });
    Object.keys(cache.daily).forEach(function (d) {
      jobs.push(App.DB.delete('dailyStats', cache.daily[d].id));
    });
    jobs.push(App.DB.delete('meta', current.id));
    return Promise.all(jobs).then(function () {
      cache = { wordStats: {}, daily: {}, meta: { id: current.id, stars: 0, createdAt: current.createdAt } };
      App.Utils.bus.emit('progress', { type: 'reset' });
      App.Utils.bus.emit('stars', 0);
    });
  };

  /* ---------------- 汇总查询（进度中心用） ---------------- */

  /**
   * 一次性取当前用户的全量进度汇总（同步：数据都在内存缓存，无需异步）
   * @returns {{stars,wordStats,daily,totalSeconds,totalCorrect,totalWrong,
   *           learnedIds,studyDays,accuracy}|null}
   */
  Store.getOverview = function () {
    if (!current) return null;
    var wordStats = cache.wordStats;
    var dailyRows = Object.keys(cache.daily).map(function (d) { return cache.daily[d]; });

    var learnedIds = Object.keys(wordStats).filter(function (w) {
      return wordStats[w].correct > 0 || wordStats[w].wrong > 0;
    });
    var totalCorrect = 0, totalWrong = 0;
    Object.keys(wordStats).forEach(function (w) {
      totalCorrect += wordStats[w].correct;
      totalWrong += wordStats[w].wrong;
    });
    var totalSeconds = dailyRows.reduce(function (s, r) { return s + r.seconds; }, 0);
    var studyDays = dailyRows.filter(function (r) { return r.seconds > 30 || r.correct + r.wrong > 0; }).length;

    return {
      user: current,
      stars: (cache.meta && cache.meta.stars) || 0,
      wordStats: wordStats,          // { wordId: {correct,wrong,lastAt} }
      daily: dailyRows,              // 原始每日记录数组
      totalSeconds: totalSeconds,
      totalCorrect: totalCorrect,
      totalWrong: totalWrong,
      learnedIds: learnedIds,        // 做过题的单词
      studyDays: studyDays,          // 有效学习天数
      accuracy: (totalCorrect + totalWrong) ? Math.round(totalCorrect / (totalCorrect + totalWrong) * 100) : 0
    };
  };

  /** 获取最近 n 天的每日统计（不足的补零，用于柱状图） */
  Store.getRecentDays = function (n) {
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      var date = App.Utils.dateOffset(i);
      var rec = cache.daily[date] || { date: date, seconds: 0, correct: 0, wrong: 0, stars: 0 };
      out.push({
        date: date,
        label: App.Utils.shortDate(date), // 柱状图 x 轴标签，如 08-31
        seconds: rec.seconds || 0,
        correct: rec.correct || 0,
        wrong: rec.wrong || 0,
        stars: rec.stars || 0
      });
    }
    return out;
  };

  /** 实时读当前星星数（顶栏） */
  Store.getStars = function () { return (cache.meta && cache.meta.stars) || 0; };

  /* ==========================================================================
   * 数据同步（跨设备「导出 / 导入 + 分享码」）—— 零后端、零账号、零成本
   * --------------------------------------------------------------------------
   * 导出一份当前学员的完整学习数据，可：
   *   1) 生成一串可复制的「分享码」（gzip 压缩 + Base64，便于微信/短信传递）；
   *   2) 下载为 .json 文件（不依赖压缩，兼容性最好）。
   * 另一台设备粘贴分享码 / 选文件导入，可选「合并」（对错/时长累加、星星取最大）
   * 或「覆盖」（以这份数据为准，适合换新设备）。导入会自动切换到该学员，
   * 且保留原学员 id —— 两台设备上"同一个人"始终是同一条档案。
   *
   * ★ 迭代提示：新增数据维度时，只需扩展 exportMyData() 与 importData() 的字段；
   *   分享码带版本号 v，向前兼容。页面层调 Store.exportShareCode() / Store.importData()。
   * ========================================================================== */

  var SYNC_APP_TAG = 'kitty-english-garden';

  /** 生成分享码（先用 gzip 压缩，压缩不可用时退化为未压缩 Base64） */
  Store.exportShareCode = function () {
    return Promise.resolve(exportMyData()).then(compressToShare);
  };

  /** 生成可下载的 JSON 文件内容与文件名 */
  Store.exportDataFile = function () {
    var data = exportMyData();
    return Promise.resolve({
      name: 'kitty-sync-' + (current ? current.name : 'user') + '.json',
      text: JSON.stringify(data)
    });
  };

  /** 解析分享码 / JSON 文本 → 导入数据对象（只解析，不写入任何数据） */
  Store.parseShareCode = function (code) {
    if (!code || !String(code).trim()) {
      return Promise.reject(new Error('请先粘贴分享码，或选择一个导出的文件。'));
    }
    return parseShareBody(String(code).trim());
  };

  /** 把解析好的同步数据写进本机 App：新建/匹配学员，按模式合并或覆盖其记录 */
  Store.importData = function (data, mode) {
    mode = mode === 'overwrite' ? 'overwrite' : 'merge';
    if (!data || !data.user || !data.user.id) {
      return Promise.reject(new Error('导入数据缺少学员身份，可能不是有效的同步文件。'));
    }
    var userId = data.user.id;
    var metaIn = data.meta || { stars: 0, createdAt: data.user.createdAt };
    var writeJobs = [], delJobs = [];
    var existingCreatedAt = null;

    // 1) 处理学员档案（本机已有则更新头像昵称，没有则新建并保留原 id）
    return App.DB.get('users', userId).then(function (existing) {
      if (existing) {
        existing.name = data.user.name || existing.name;
        existing.avatar = data.user.avatar || existing.avatar;
        existingCreatedAt = existing.createdAt;
        writeJobs.push(App.DB.put('users', existing));
      } else {
        var nu = {
          id: userId,
          name: String(data.user.name || '小可爱').slice(0, 12),
          avatar: data.user.avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
          createdAt: data.user.createdAt || Date.now()
        };
        existingCreatedAt = nu.createdAt;
        writeJobs.push(App.DB.put('users', nu));
      }
      // 2) 取目标用户现有记录：覆盖模式下排队删除旧值，合并模式用于累加
      return App.DB.byUser('wordStats', userId).then(function (ws) {
        var localWords = {};
        ws.forEach(function (r) {
          localWords[r.wordId] = r;
          if (mode === 'overwrite') delJobs.push(App.DB.delete('wordStats', r.id));
        });
        return App.DB.byUser('dailyStats', userId);
      }).then(function (ds) {
        var localDaily = {};
        ds.forEach(function (r) {
          localDaily[r.date] = r;
          if (mode === 'overwrite') delJobs.push(App.DB.delete('dailyStats', r.id));
        });
        if (mode === 'overwrite') delJobs.push(App.DB.delete('meta', userId));
        return { localWords: localWords, localDaily: localDaily };
      });
    }).then(function (local) {
      // 3) 单词统计
      var srcWords = data.wordStats || {};
      Object.keys(srcWords).forEach(function (wordId) {
        var s = srcWords[wordId];
        var rec;
        if (mode === 'overwrite' || !local.localWords[wordId]) {
          rec = { id: userId + '::' + wordId, userId: userId, wordId: wordId, correct: s.correct || 0, wrong: s.wrong || 0, lastAt: s.lastAt || 0 };
        } else {
          rec = local.localWords[wordId];
          rec.correct = (rec.correct || 0) + (s.correct || 0);
          rec.wrong = (rec.wrong || 0) + (s.wrong || 0);
          rec.lastAt = Math.max(rec.lastAt || 0, s.lastAt || 0);
        }
        writeJobs.push(App.DB.put('wordStats', rec));
      });
      // 4) 每日统计
      var srcDaily = data.daily || {};
      Object.keys(srcDaily).forEach(function (date) {
        var d = srcDaily[date];
        var rec;
        if (mode === 'overwrite' || !local.localDaily[date]) {
          rec = { id: userId + '::' + date, userId: userId, date: date, seconds: d.seconds || 0, correct: d.correct || 0, wrong: d.wrong || 0, stars: d.stars || 0 };
        } else {
          rec = local.localDaily[date];
          rec.seconds = (rec.seconds || 0) + (d.seconds || 0);
          rec.correct = (rec.correct || 0) + (d.correct || 0);
          rec.wrong = (rec.wrong || 0) + (d.wrong || 0);
          rec.stars = Math.max(rec.stars || 0, d.stars || 0);
        }
        writeJobs.push(App.DB.put('dailyStats', rec));
      });
      // 5) 积分 meta：覆盖直接写入；合并取更大值（避免重复计星）
      if (mode === 'overwrite') {
        writeJobs.push(App.DB.put('meta', { id: userId, stars: metaIn.stars || 0, createdAt: existingCreatedAt || metaIn.createdAt || Date.now() }));
        return null; // 无额外 metaJob
      }
      return App.DB.get('meta', userId).then(function (localMeta) {
        var merged = localMeta || { id: userId, stars: 0, createdAt: existingCreatedAt || Date.now() };
        merged.stars = Math.max(merged.stars || 0, metaIn.stars || 0);
        return App.DB.put('meta', merged);
      });
    }).then(function () {
      // 6) 先删旧残留，再写入新值（覆盖模式下避免旧记录残留）
      return Promise.all(delJobs).then(function () { return Promise.all(writeJobs); });
    }).then(function () {
      // 7) 刷新用户列表缓存并切换到该学员
      return Store.listUsers().then(function (users) {
        usersCache = users;
        return Store.enter(userId);
      }).then(function () {
        App.Utils.bus.emit('user', null);
        App.Utils.bus.emit('progress', { type: 'import' });
        return userId;
      });
    });
  };

  /* —— 把当前 current/cache 提炼成独立同步对象（纯数据，不带冗余 userId） —— */
  function exportMyData() {
    if (!current) throw new Error('当前还没有学员，无法导出。请先切换 / 新增学员。');
    var words = {}, daily = {};
    Object.keys(cache.wordStats).forEach(function (wid) {
      var r = cache.wordStats[wid];
      words[wid] = { correct: r.correct, wrong: r.wrong, lastAt: r.lastAt };
    });
    Object.keys(cache.daily).forEach(function (date) {
      var r = cache.daily[date];
      daily[date] = { seconds: r.seconds, correct: r.correct, wrong: r.wrong, stars: r.stars };
    });
    return {
      app: SYNC_APP_TAG,
      v: 1,
      exportedAt: Date.now(),
      user: { id: current.id, name: current.name, avatar: current.avatar, createdAt: current.createdAt },
      wordStats: words,
      daily: daily,
      meta: { stars: (cache.meta && cache.meta.stars) || 0, createdAt: (cache.meta && cache.meta.createdAt) || current.createdAt }
    };
  }

  /** 压缩(Gzip)+Base64 → 分享码；压缩不可用则退化为未压缩 Base64 */
  function compressToShare(obj) {
    var json = JSON.stringify(obj);
    var enc = new TextEncoder();
    if (typeof CompressionStream !== 'undefined' && typeof Blob !== 'undefined') {
      var stream = new Blob([enc.encode(json)]).stream().pipeThrough(new CompressionStream('gzip'));
      return new Response(stream).arrayBuffer().then(function (buf) {
        return 'KSYNC1:' + toBase64(new Uint8Array(buf));
      });
    }
    return Promise.resolve('KSYNC0:' + toBase64(enc.encode(json)));
  }

  /** 解析分享码 / 原始 JSON → 校验后的同步对象 */
  function parseShareBody(code) {
    var compressed = false, body = code;
    if (code.indexOf('KSYNC1:') === 0) { compressed = true; body = code.slice(7); }
    else if (code.indexOf('KSYNC0:') === 0) { compressed = false; body = code.slice(7); }
    else if (code.indexOf('KSYNC') === 0) { compressed = /^KSYNC1/.test(code); body = code.slice(5); }

    var bytes;
    try { bytes = fromBase64(body); }
    catch (e) { throw new Error('分享码 Base64 解析失败，请确认已完整复制全部字符。'); }

    var job = Promise.resolve(bytes);
    if (compressed) {
      if (typeof DecompressionStream === 'undefined') {
        return Promise.reject(new Error('当前浏览器不支持解压分享码，请改用「下载文件」方式导入，或换用 Edge/Chrome 等支持浏览器。'));
      }
      var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      job = new Response(stream).arrayBuffer().then(function (buf) { return new Uint8Array(buf); });
    }
    return job.then(function (data) {
      var json = new TextDecoder().decode(data);
      var obj;
      try { obj = JSON.parse(json); }
      catch (e) { throw new Error('分享码内容不是有效数据。'); }
      if (obj && obj.app === SYNC_APP_TAG && obj.user) return obj;
      if (obj && obj.user && obj.wordStats && obj.meta) return obj; // 兼容无标记版本
      throw new Error('无法识别该数据：这不是 Kitty 英语乐园的同步文件。');
    });
  }

  /* —— Base64 编码 / 还原（分块处理，避免大字符串调用栈溢出） —— */
  function toBase64(bytes) {
    var chunk = 0x8000, bin = '';
    for (var i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  }
  function fromBase64(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
})(window.App.Store = window.App.Store || {});
