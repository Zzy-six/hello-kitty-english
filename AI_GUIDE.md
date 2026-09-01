# AI_GUIDE.md — 给 AI 协作者的项目速读

> 本文件是写给 AI 助手（如 ZyCode / Claude Code / Cursor）的**入口指南**，
> 让新会话在 60 秒内搞懂这个项目怎么改、怎么测、怎么不踩坑。
> 人类开发者请直接看 [README.md](README.md)。

## 一句话定位

零成本（无付费 API、无服务器、无构建）、纯静态 HTML+JS 的**一年级→高三分级**英语学习应用：
网页版（GitHub Pages）+ 桌面版（Electron）双交付，全部内容在 `src/`，离线可用。

## 架构铁律（违反必出 bug）

1. **经典脚本 + 全局命名空间**，禁止 ES module（`import/export`）。
   `file://` 协议下 module 会被 CORS 拦截，离线/桌面场景直接白屏。
   模块写法：`(function (NS) { ... })(window.App.Features.Quiz ||= {});`
2. 每个文件只向自己的命名空间挂东西：`App.Utils / App.DB / App.Store / App.Data.* / App.Features.* / App.UI.*`。
3. `src/index.html` 是唯一入口，所有 `src/js/**` 都以 `<script>` 标签顺序加载（顺序即依赖）。
4. 内容（数据）与逻辑分离：词句都放 `src/js/data/`，业务代码读数据不写死内容。
5. 路由是 hash 路由（`#/quiz/play?cat=animals`），**query 参数是字符串**，做算术先 `Number()`。
6. 游客放行路径（登录页/注册页：`/auth`、`/auth/register`）：
   `app.js` 的 `bus.on('route')` 守卫名单里必须保留，否则未登录会死循环跳转。
7. 账号是**本地账号**（存本机 IndexedDB，零后端）：新账号一律走 `Store.register()`；
   内置管理员种子在 `store.js` 顶部 `ADMIN_SEED`，**其账号密码永不写入 README/AI_GUIDE/任何用户文档**。

## 常用 API 速查

| 需求 | 调用 |
|---|---|
| 初始化存储 | `await App.DB.ready()`（不是 `App.DB.open`） |
| 当前账号 | `App.Store.getCurrentUser()` |
| 注册/登录/登出 | `Store.register(用户名, 密码, 昵称, 头像)` / `Store.login(u, p)` / `Store.logout()`（失败均 Promise.reject 中文错误） |
| 账号管理 | `Store.listUsers()` / `enter(id)` / `deleteUser(id)` / `verifyPassword(pwd)` / `isAdmin()`（返回 Promise） |
| 旧版无账号入口 | `Store.addUser(name)` 是遗留 API，新功能别用 |
| 词表 | `App.Data.Words.list(catId)` → 数组；`byCategory(id)` → 分类对象；`levels` → 12个等级（1=一年级…12=高三）；`byLevel(id)` → **某等级的类别数组**（不是等级对象）；`listByLevel(id)` → 某等级全部单词 |
| 关卡 | `App.Data.GameConfig.byId(n)`（安全返回 null，勿加默认可掩盖 bug） |
| 顶栏星星 | 事件 `App.Utils.bus.emit('stars', ...)`，页面监听刷新 |
| 发音 | `App.Utils.speak('Cat')`（SpeechSynthesis） |
| 路由 | `App.Router.go('#/xxx')`；`App.Router.current()` |
| 页面模块 | `App.Features.X.render(el)` / `App.Features.X.wire()`（看 home.js 怎么被 app.js 调用） |

## 改哪个文件干什么

- 加单词/分类 → `src/js/data/words-data.js`
- 加对话 → `src/js/data/dialogues-data.js`
- 加关卡 → `src/js/data/game-config.js`
- 加页面 → 复制 `src/js/features/` 任一页，注册路由（`src/js/core/router.js`），
  `src/index.html` 加 `<script>`，首页加卡片
- 换主题色 → `src/css/theme.css`；换小猫 → `src/js/ui/kitty.js`
- 桌面壳 → `electron/main.js`（`--smoke` 自检已是现成的验收入口）

## 怎么测（每个改动后必须跑）

```bash
npm run serve   # http://localhost:8080，浏览器手测功能
npm run smoke   # 桌面版自检：打印 [SMOKE] OK 且 exit 0
npm run dist    # 打包 exe
npx electron scripts/account-probe.js   # 账号功能探针：[ACCOUNT-PROBE] OK 且 exit 0
```

手测清单与已知坑见 [README.md](README.md) 的「每个迭代的必测清单」和「易踩的坑」。

## 沟通约定

- 中文注释、中文 UI 文案；英文只出现在学习内容（单词/对话）。
- 零成本路线不可动摇：不引付费 API、不加**联网**登录/云服务、不引入需要联网的 CDN
  （改 Tailwind 等资源必须本地化到 `src/vendor/`）。本地账号（数据存本机 IndexedDB）是允许的。
- 小猫是原创形象，任何新素材必须可自由商用或自绘/程序生成。
