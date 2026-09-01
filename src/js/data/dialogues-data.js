/* ============================================================================
 * data/dialogues-data.js — 情景对话库（小学一年级→高三 12 级，循序渐进）
 * ----------------------------------------------------------------------------
 * ★ ZyCode 迭代入口：新增对话场景只需在这里 registerScenario 即可，
 *   对话页面（features/dialogue.js）自动兼容。
 *
 * 结构说明：
 *   level: 建议学习的年级（1=一年级 … 6=六年级 7=七年级 … 12=高三），
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

  /* ============= 内置情景（14 个：小学 6 个 + 初中 4 个 + 高中 4 个） ============= */

  /* ---------------- 一级 · 一年级：打招呼 ---------------- */

  Dialogues.registerScenario({
    id: 'hello', level: 1, title: '见面问好', emoji: '👋', desc: 'Hello! 你好！',
    lines: [
      { who: 'kitty',  en: 'Hello! I am Kitty.',            zh: '你好！我是Kitty。',        emoji: '🐱' },
      { who: 'friend', en: 'Hello, Kitty! I am Mia.',       zh: '你好，Kitty！我是米娅。',  emoji: '🐰' },
      { who: 'kitty',  en: 'Hi, Mia! Please come in.',      zh: '嗨，米娅！请进。',         emoji: '🐱' },
      { who: 'friend', en: 'Thank you!',                    zh: '谢谢你！',                 emoji: '🐰' },
      { who: 'kitty',  en: 'Would you like some milk?',     zh: '你想喝点牛奶吗？',         emoji: '🐱' },
      { who: 'friend', en: 'Yes, please!',                  zh: '好的，请给我一点！',       emoji: '🐰' },
      { who: 'friend', en: 'Goodbye, Kitty!',               zh: '再见，Kitty！',            emoji: '🐰' },
      { who: 'kitty',  en: 'Goodbye! See you!',             zh: '再见！回头见！',           emoji: '🐱' }
    ]
  });

  /* ---------------- 二级 · 二年级：数字颜色 ---------------- */

  Dialogues.registerScenario({
    id: 'numbers', level: 2, title: '数一数认颜色', emoji: '🎨', desc: '1、2、3…是什么颜色？',
    lines: [
      { who: 'kitty',  en: 'Look! One, two, three, four, five!',  zh: '快看！一、二、三、四、五！', emoji: '🐱' },
      { who: 'friend', en: 'Wow! I can count to five!',           zh: '哇！我可以数到五啦！',       emoji: '🐰' },
      { who: 'kitty',  en: 'Nice! What color is this?',            zh: '真棒！这是什么颜色？',       emoji: '🐱' },
      { who: 'friend', en: 'It is red.',                           zh: '它是红色的。',               emoji: '🐰' },
      { who: 'kitty',  en: 'Yes! And what color is that?',         zh: '对！那那个呢？',             emoji: '🐱' },
      { who: 'friend', en: 'It is blue. It is pretty!',            zh: '它是蓝色的。真漂亮！',       emoji: '🐰' },
      { who: 'kitty',  en: 'You are great, Mia!',                  zh: '你真棒，米娅！',             emoji: '🐱' }
    ]
  });

  /* ---------------- 三级 · 三年级：点心时刻 ---------------- */

  Dialogues.registerScenario({
    id: 'snacktime', level: 3, title: '点心时刻', emoji: '🍪', desc: '请吃蛋糕和饼干',
    lines: [
      { who: 'kitty',  en: 'Are you hungry, Mia?',            zh: '你饿了吗，米娅？',        emoji: '🐱' },
      { who: 'friend', en: 'Yes, a little!',                  zh: '有一点！',                emoji: '🐰' },
      { who: 'kitty',  en: 'Here is a cake for you.',         zh: '这块蛋糕给你。',          emoji: '🐱' },
      { who: 'friend', en: 'Wow, thank you! It is sweet.',    zh: '哇，谢谢！它是甜的。',    emoji: '🐰' },
      { who: 'kitty',  en: 'Do you want a cookie, too?',      zh: '你还要一块曲奇饼干吗？',  emoji: '🐱' },
      { who: 'friend', en: 'No, thanks. I am full now.',      zh: '不用了，谢谢。我吃饱啦。', emoji: '🐰' },
      { who: 'kitty',  en: 'Let us drink some water.',        zh: '那我们去喝点水吧。',      emoji: '🐱' }
    ]
  });

  /* ---------------- 四级 · 四年级：宠物朋友 ---------------- */

  Dialogues.registerScenario({
    id: 'pets', level: 4, title: '宠物朋友', emoji: '🐱', desc: '聊聊我家的小动物',
    lines: [
      { who: 'friend', en: 'Do you have a pet, Kitty?',           zh: '你有宠物吗，Kitty？',    emoji: '🐰' },
      { who: 'kitty',  en: 'Yes! I have a cat. Its name is Mimi.', zh: '有！我有一只猫。它叫咪咪。', emoji: '🐱' },
      { who: 'friend', en: 'What does it look like?',              zh: '它长什么样呀？',         emoji: '🐰' },
      { who: 'kitty',  en: 'It is white and very small.',          zh: '它是白色的，非常小。',   emoji: '🐱' },
      { who: 'friend', en: 'I have a puppy. He is brown.',         zh: '我有一只小狗。他是棕色的。', emoji: '🐰' },
      { who: 'kitty',  en: 'Let us play with them together!',      zh: '咱们带着它们一起玩吧！', emoji: '🐱' },
      { who: 'friend', en: 'Good idea! Let us go!',                zh: '好主意！走吧！',         emoji: '🐰' }
    ]
  });

  /* ---------------- 五级 · 五年级：外出游玩 ---------------- */

  Dialogues.registerScenario({
    id: 'dayout', level: 5, title: '周末去公园', emoji: '🌳', desc: '湖边野餐真快乐',
    lines: [
      { who: 'kitty',  en: 'It is a nice day! Let us go to the park.',   zh: '天气真好！我们去公园吧。', emoji: '🐱' },
      { who: 'friend', en: 'Great! I love the park very much.',          zh: '太好了！我特别喜欢公园。', emoji: '🐰' },
      { who: 'kitty',  en: 'Look at the lake. It is so blue.',           zh: '看那个湖，它好蓝呀。',     emoji: '🐱' },
      { who: 'friend', en: 'I can see the hills and the green grass.',   zh: '我能看到小山和绿草地。',   emoji: '🐰' },
      { who: 'kitty',  en: 'Let us ride bikes around the lake!',         zh: '咱们绕湖骑自行车吧！',     emoji: '🐱' },
      { who: 'friend', en: 'Sounds fun! And we can have a picnic later.', zh: '听起来好玩！待会儿我们还能野餐。', emoji: '🐰' },
      { who: 'kitty',  en: 'Perfect! Let us go!',                        zh: '完美！出发！',             emoji: '🐱' }
    ]
  });

  /* ---------------- 六级 · 六年级：毕业告别 ---------------- */

  Dialogues.registerScenario({
    id: 'goodbye', level: 6, title: '毕业告别', emoji: '🎓', desc: '再见小学 · 友谊不散',
    lines: [
      { who: 'kitty',  en: 'Primary school is over. I will miss you.',   zh: '小学就要结束了。我会想你的。', emoji: '🐱' },
      { who: 'friend', en: 'Me too! We have so many happy memories.',    zh: '我也是！我们有好多快乐的回忆。', emoji: '🐰' },
      { who: 'kitty',  en: 'I promise to come and see you often.',       zh: '我承诺会常来看你。',           emoji: '🐱' },
      { who: 'friend', en: 'Thank you. I hope we are always friends.',   zh: '谢谢。我希望我们永远是朋友。', emoji: '🐰' },
      { who: 'kitty',  en: 'Never give up your dream, Mia!',             zh: '永远不要放弃你的梦想，米娅！', emoji: '🐱' },
      { who: 'friend', en: 'I will! I wish you a bright future!',        zh: '我会的！祝你前程似锦！',       emoji: '🐰' },
      { who: 'kitty',  en: 'Goodbye! See you in middle school!',         zh: '再见！初中见！',               emoji: '🐱' }
    ]
  });

  /* ---------------- 七级 · 七年级：开学第一天 ---------------- */

  Dialogues.registerScenario({
    id: 'greet', level: 7, title: '开学第一天', emoji: '👋', desc: '打招呼 · 认识新同学',
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
    id: 'introduce', level: 7, title: '自我介绍', emoji: '✨', desc: '我是谁 · 我来自哪里',
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

  /* ---------------- 八级 · 八年级：课堂与购物 ---------------- */

  Dialogues.registerScenario({
    id: 'classroom', level: 8, title: '课堂互动', emoji: '📖', desc: '上课 · 提问 · 交作业',
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
    id: 'shop', level: 8, title: '文具店购物', emoji: '🛍️', desc: '买文具 · 讲价钱',
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

  /* ---------------- 九级 · 九年级：规则与问路 ---------------- */

  Dialogues.registerScenario({
    id: 'library', level: 9, title: '图书馆借书', emoji: '🏫', desc: '借书 · 还书 · 守规则',
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
    id: 'asking', level: 9, title: '问路', emoji: '🗺️', desc: '找人问路 · 到达目的地',
    lines: [
      { who: 'kitty',  en: 'Excuse me, where is the park?',      zh: '打扰一下，公园在哪里？',            emoji: '🐱' },
      { who: 'friend', en: 'Go straight and turn right at the corner.', zh: '直走，然后在拐角处右转。',    emoji: '🐰' },
      { who: 'kitty',  en: 'Is it far from here?',               zh: '离这里远吗？',                      emoji: '🐱' },
      { who: 'friend', en: 'No, it takes ten minutes on foot.',  zh: '不远，步行十分钟。',                emoji: '🐰' },
      { who: 'kitty',  en: 'Okay, thank you!',                   zh: '好的，谢谢！',                      emoji: '🐱' },
      { who: 'friend', en: 'You are welcome, bye!',              zh: '不客气，拜拜！',                    emoji: '🐰' }
    ]
  });

  /* ---------------- 十级 · 高一：天气与计划 ---------------- */

  Dialogues.registerScenario({
    id: 'weather', level: 10, title: '天气怎么样', emoji: '☀️', desc: '聊天气 · 安排活动',
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
    id: 'weekend', level: 10, title: '周末计划', emoji: '🎯', desc: '说说计划 · 互相邀请',
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
