/* ============================================================================
 * data/dialogues-data.js — 情景对话库（初中零基础起点，按年级分级）
 * ----------------------------------------------------------------------------
 * ★ ZyCode 迭代入口：新增对话场景只需在这里 registerScenario 即可，
 *   对话页面（features/dialogue.js）自动兼容。
 *
 * 结构说明：
 *   level: 建议学习的年级（1=七年级 2=八年级 3=九年级 4=高一），
 *          仅用于排序展示；场景列表 level 从低到高排列。
 *   who: 'kitty'（左边小猫）| 'friend'（右边小伙伴）；句子按顺序说下去。
 *   说话内容默认英文，播放时同步朗读；中文翻译可一键切换显示/隐藏。
 * ============================================================================ */
(function (Dialogues) {
  'use strict';

  var scenarios = [];

  /** 注册一个情景（见文件头注释） */
  Dialogues.registerScenario = function (s) { scenarios.push(s); return s; };

  Dialogues.list = function () {
    return scenarios.slice().sort(function (a, b) { return (a.level || 1) - (b.level || 1); });
  };
  Dialogues.byId = function (id) { return scenarios.find(function (s) { return s.id === id; }) || null; };

  /* ==================== 内置情景（8个初中日常场景，按年级进阶） ==================== */

  Dialogues.registerScenario({
    id: 'greet', level: 1, title: '开学第一天', emoji: '👋', desc: '打招呼 · 认识新同学',
    lines: [
      { who: 'kitty',  en: 'Hello! I am Kitty.',                 zh: '你好！我是Kitty。',                 emoji: '🐱' },
      { who: 'friend', en: 'Hello! My name is Li Ming.',         zh: '你好！我叫李明。',                  emoji: '🐰' },
      { who: 'kitty',  en: 'Nice to meet you, Li Ming!',         zh: '很高兴认识你，李明！',              emoji: '🐱' },
      { who: 'friend', en: 'Nice to meet you, too!',             zh: '我也很高兴认识你！',                emoji: '🐰' },
      { who: 'kitty',  en: 'What is your favorite subject?',     zh: '你最喜欢哪门科目？',                emoji: '🐱' },
      { who: 'friend', en: 'I like English because it is fun!',  zh: '我喜欢英语，因为它很有趣！',        emoji: '🐰' },
      { who: 'friend', en: 'See you! Goodbye!',                  zh: '回见！拜拜！',                      emoji: '🐰' }
    ]
  });

  Dialogues.registerScenario({
    id: 'introduce', level: 1, title: '自我介绍', emoji: '✨', desc: '我是谁 · 我来自哪里',
    lines: [
      { who: 'kitty',  en: 'What is your name?',                 zh: '你叫什么名字？',                    emoji: '🐱' },
      { who: 'friend', en: 'My name is Li Ming.',                zh: '我叫李明。',                        emoji: '🐰' },
      { who: 'kitty',  en: 'How old are you, Li Ming?',          zh: '你多大了，李明？',                  emoji: '🐱' },
      { who: 'friend', en: 'I am twelve years old.',             zh: '我十二岁。',                        emoji: '🐰' },
      { who: 'kitty',  en: 'Where are you from?',                zh: '你来自哪里？',                      emoji: '🐱' },
      { who: 'friend', en: 'I am from Beijing, China.',          zh: '我来自中国北京。',                  emoji: '🐰' },
      { who: 'kitty',  en: 'I am a new student in Grade Seven!', zh: '我是七年级的新学生！',              emoji: '🐱' },
      { who: 'friend', en: 'Welcome, Kitty!',                    zh: '欢迎你，Kitty！',                   emoji: '🐰' }
    ]
  });

  Dialogues.registerScenario({
    id: 'classroom', level: 2, title: '课堂互动', emoji: '📖', desc: '上课 · 提问 · 交作业',
    lines: [
      { who: 'kitty',  en: 'May I come in?',                     zh: '我可以进来吗？',                    emoji: '🐱' },
      { who: 'friend', en: 'Come in, please. You are late.',     zh: '请进。你迟到了。',                  emoji: '🐰' },
      { who: 'kitty',  en: 'Sorry, I missed the bus.',           zh: '对不起，我错过了公交车。',          emoji: '🐱' },
      { who: 'friend', en: 'That is all right. Sit down, please.', zh: '没关系。请坐吧。',                 emoji: '🐰' },
      { who: 'kitty',  en: 'Excuse me, may I ask a question?',   zh: '打扰一下，我能问个问题吗？',        emoji: '🐱' },
      { who: 'friend', en: 'Yes, of course. What is it?',        zh: '当然可以。什么问题？',              emoji: '🐰' },
      { who: 'kitty',  en: 'Thank you very much for your help!', zh: '非常感谢你的帮助！',                emoji: '🐱' }
    ]
  });

  Dialogues.registerScenario({
    id: 'shop', level: 2, title: '文具店购物', emoji: '🛍️', desc: '买文具 · 讲价钱',
    lines: [
      { who: 'friend', en: 'Can I help you?',                    zh: '需要帮忙吗？',                      emoji: '🐰' },
      { who: 'kitty',  en: 'I want a pen and a notebook.',       zh: '我想要一支钢笔和一个笔记本。',      emoji: '🐱' },
      { who: 'friend', en: 'Sure! Here you are.',                zh: '好的！给你。',                      emoji: '🐰' },
      { who: 'kitty',  en: 'How much are they?',                 zh: '一共多少钱？',                      emoji: '🐱' },
      { who: 'friend', en: 'They are fifteen yuan.',             zh: '一共十五元。',                      emoji: '🐰' },
      { who: 'kitty',  en: 'That is cheap! Thank you!',          zh: '真便宜！谢谢你！',                  emoji: '🐱' },
      { who: 'friend', en: 'You are welcome. Goodbye!',          zh: '不客气。再见！',                    emoji: '🐰' }
    ]
  });

  Dialogues.registerScenario({
    id: 'library', level: 3, title: '图书馆借书', emoji: '🏫', desc: '借书 · 还书 · 守规则',
    lines: [
      { who: 'kitty',  en: 'Excuse me, can I borrow this book?', zh: '打扰一下，我能借这本书吗？',        emoji: '🐱' },
      { who: 'friend', en: 'Of course. How long do you need?',   zh: '当然可以。你需要借多久？',          emoji: '🐰' },
      { who: 'kitty',  en: 'Two weeks, please.',                 zh: '两周吧。',                          emoji: '🐱' },
      { who: 'friend', en: 'Please keep it clean and on time.',  zh: '请保持整洁并按时归还。',            emoji: '🐰' },
      { who: 'kitty',  en: 'I will remember that. Thanks a lot!', zh: '我会记住的。非常感谢！',            emoji: '🐱' },
      { who: 'friend', en: 'You are welcome. Have a nice day!',  zh: '不客气。祝你愉快！',                emoji: '🐰' }
    ]
  });

  Dialogues.registerScenario({
    id: 'asking', level: 3, title: '问路', emoji: '🗺️', desc: '找人问路 · 到达目的地',
    lines: [
      { who: 'kitty',  en: 'Excuse me, where is the park?',      zh: '打扰一下，公园在哪里？',            emoji: '🐱' },
      { who: 'friend', en: 'Go straight and turn right at the corner.', zh: '直走，然后在拐角处右转。',    emoji: '🐰' },
      { who: 'kitty',  en: 'Is it far from here?',               zh: '离这里远吗？',                      emoji: '🐱' },
      { who: 'friend', en: 'No, it takes ten minutes on foot.',  zh: '不远，步行十分钟。',                emoji: '🐰' },
      { who: 'kitty',  en: 'Okay, thank you!',                   zh: '好的，谢谢！',                      emoji: '🐱' },
      { who: 'friend', en: 'You are welcome, bye!',              zh: '不客气，拜拜！',                    emoji: '🐰' }
    ]
  });

  Dialogues.registerScenario({
    id: 'weather', level: 4, title: '天气怎么样', emoji: '☀️', desc: '聊天气 · 安排活动',
    lines: [
      { who: 'kitty',  en: 'How is the weather today?',          zh: '今天天气怎么样？',                  emoji: '🐱' },
      { who: 'friend', en: 'It is sunny and warm today.',        zh: '今天又晴又暖和。',                  emoji: '🐰' },
      { who: 'kitty',  en: 'It is a good day for sports!',       zh: '是个运动的好日子！',                emoji: '🐱' },
      { who: 'friend', en: 'Yes! Let us play basketball.',       zh: '是的！我们去打篮球吧。',            emoji: '🐰' },
      { who: 'kitty',  en: 'Great! But what if it rains?',       zh: '太好了！但如果下雨怎么办？',        emoji: '🐱' },
      { who: 'friend', en: 'Then we can read books inside.',     zh: '那我们就待在屋里读书。',            emoji: '🐰' }
    ]
  });

  Dialogues.registerScenario({
    id: 'weekend', level: 4, title: '周末计划', emoji: '🎯', desc: '说说计划 · 互相邀请',
    lines: [
      { who: 'kitty',  en: 'What are you going to do this weekend?', zh: '这个周末你打算做什么？',        emoji: '🐱' },
      { who: 'friend', en: 'I am going to visit my grandparents.',   zh: '我要去看望我的祖父母。',         emoji: '🐰' },
      { who: 'kitty',  en: 'That sounds great! What about homework?', zh: '听起来很棒！那作业怎么办？',     emoji: '🐱' },
      { who: 'friend', en: 'I will finish it on Sunday morning.',     zh: '我星期天上午会完成作业。',       emoji: '🐰' },
      { who: 'kitty',  en: 'Can I go with you next time?',            zh: '下次我能跟你一起去吗？',         emoji: '🐱' },
      { who: 'friend', en: 'Sure! Let us go together.',               zh: '当然！咱们一起去。',             emoji: '🐰' }
    ]
  });
})((window.App.Data = window.App.Data || {}).Dialogues ||= {});
