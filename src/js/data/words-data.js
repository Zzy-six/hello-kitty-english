/* ============================================================================
 * data/words-data.js — 内置英语单词库（小学一年级→高三 12 级进阶，48 类 384 词）
 * ----------------------------------------------------------------------------
 * ★ ZyCode 迭代入口：新增/修改单词只需要在这里「注册」即可。
 *   单词闯关、消消乐、进度中心会自动兼容，无需改动任何页面代码。
 *
 * 学习定位：零基础从「小学一年级」起步，按等级一步一步进阶到「高三」，
 * 词表参考人教版《PEP》《Go for it!》/《必修·选择性必修》高频核心词。
 *
 * 使用层级：
 *   Words.levels[c]          → 全部等级（一年级…高三，按 id 升序）
 *   Words.byLevel(levelId)   → 某等级的类别数组
 *   Words.categories()       → 全部类别（界面显示顺序）
 *   Words.list('all')        → 全部单词；Words.list(catId) → 某类别单词
 *   Words.listByLevel(id)    → 某等级全部单词
 *
 * 注册方式：
 *   Words.registerCategory({
 *     level: 1,               // 所属等级（1=一年级 … 12=高三）
 *     id: 'greetings',        // 唯一类别id（英文）
 *     name: '见面问好',        // 中文名称（界面显示）
 *     emoji: '👋',            // 类别图标
 *     desc: '你好！我们认识一下吧', // 一句话介绍
 *     words: [ { id, en, zh, emoji, ipa } ]  // id 全库唯一；en 大写开头
 *   });
 * ============================================================================ */
(function (Words) {
  'use strict';

  /* ---------------- 等级定义（循序渐进的一级台阶） ---------------- */

  Words.levels = [
    { id: 1,  name: '一年级', emoji: '🎈', tag: '启蒙起步', desc: '数字颜色 · 小猫小狗 · 认识自己' },
    { id: 2,  name: '二年级', emoji: '🍭', tag: '基础认知', desc: '水果点心 · 玩具游戏 · 自然观察' },
    { id: 3,  name: '三年级', emoji: '🧸', tag: '日常会话', desc: '衣帽鞋袜 · 教室帮手 · 温馨的家' },
    { id: 4,  name: '四年级', emoji: '🎡', tag: '兴趣拓展', desc: '快乐场所 · 日常动作 · 友好的朋友' },
    { id: 5,  name: '五年级', emoji: '🚀', tag: '进阶表达', desc: '心情滋味 · 职业启蒙 · 游戏运动' },
    { id: 6,  name: '六年级', emoji: '🎏', tag: '小升初衔接', desc: '时间节日 · 中国味道 · 毕业告别' },
    { id: 7,  name: '七年级', emoji: '🌱', tag: '初中入门', desc: '校门口第一课 · 教室、家庭、三餐' },
    { id: 8,  name: '八年级', emoji: '🌸', tag: '日常进阶', desc: '会说了就多说 · 运动、出行、旅行' },
    { id: 9,  name: '九年级', emoji: '🍀', tag: '中考冲刺', desc: '规则、备考、环保、职业愿望' },
    { id: 10, name: '高一',   emoji: '🌿', tag: '高中衔接', desc: '新校园 · 兴趣、健康、读写' },
    { id: 11, name: '高二',   emoji: '🌻', tag: '深化提升', desc: '网络、自然、心理、社会' },
    { id: 12, name: '高三',   emoji: '🎓', tag: '高考冲刺', desc: '时事、大学、规划、应考心态' }
  ];

  var categories = []; // 顺序即界面显示顺序

  /* ---------------- 注册 & 查询 ---------------- */

  /** 注册一个词组类别（见文件头注释） */
  Words.registerCategory = function (cat) {
    cat.words.forEach(function (w) {
      if (Words.byId(w.id)) console.warn('[words] 重复单词id:', w.id);
      w.category = cat.id;
      w.level = cat.level;
    });
    categories.push(cat);
    return cat;
  };

  Words.categories = function () { return categories; };

  Words.byLevel = function (levelId) {
    return categories.filter(function (c) { return c.level === Number(levelId); });
  };

  Words.listByLevel = function (levelId) {
    return Words.byLevel(levelId).reduce(function (arr, c) { return arr.concat(c.words); }, []);
  };

  /** 按 id 查单词（含全部类别） */
  Words.byId = function (id) {
    for (var i = 0; i < categories.length; i++) {
      var found = categories[i].words.find(function (w) { return w.id === id; });
      if (found) return found;
    }
    return null;
  };

  /** 按类别 id 取类别对象 */
  Words.byCategory = function (catId) {
    return categories.find(function (c) { return c.id === catId; }) || null;
  };

  /** 取某类别的全部单词（catId 传 'all' 返回全部词） */
  Words.list = function (catId) {
    if (!catId || catId === 'all') {
      return categories.reduce(function (arr, c) { return arr.concat(c.words); }, []);
    }
    var cat = Words.byCategory(catId);
    return cat ? cat.words.slice() : [];
  };

  /* =========================================================================
   * 以下为内置词库内容（全部含：id / 英文 / 中文 / emoji / 音标）
   * ========================================================================= */

  /* ======================= 一级 · 一年级（启蒙起步） ======================= */

  Words.registerCategory({
    level: 1, id: 'greetings', name: '见面问好', emoji: '👋', desc: '你好！我们认识一下吧',
    words: [
      { id: 'hello',   en: 'Hello',       zh: '你好',     emoji: '👋', ipa: '/həˈləʊ/' },
      { id: 'hi',      en: 'Hi',          zh: '嗨',       emoji: '🙂', ipa: '/haɪ/' },
      { id: 'goodbye', en: 'Goodbye',     zh: '再见',     emoji: '👋', ipa: '/ˌɡʊdˈbaɪ/' },
      { id: 'yes',     en: 'Yes',         zh: '是的',     emoji: '✅', ipa: '/jes/' },
      { id: 'no',      en: 'No',          zh: '不',       emoji: '❌', ipa: '/nəʊ/' },
      { id: 'please',  en: 'Please',      zh: '请',       emoji: '🙏', ipa: '/pliːz/' },
      { id: 'sorry',   en: 'Sorry',       zh: '对不起',   emoji: '😔', ipa: '/ˈsɒri/' },
      { id: 'thanks',  en: 'Thanks',      zh: '谢谢',     emoji: '💝', ipa: '/θæŋks/' }
    ]
  });

  Words.registerCategory({
    level: 1, id: 'colornums', name: '数字颜色', emoji: '🎨', desc: '数一数 · 认认颜色',
    words: [
      { id: 'one',     en: 'One',     zh: '一',       emoji: '1️⃣', ipa: '/wʌn/' },
      { id: 'two',     en: 'Two',     zh: '二',       emoji: '2️⃣', ipa: '/tuː/' },
      { id: 'three',   en: 'Three',   zh: '三',       emoji: '3️⃣', ipa: '/θriː/' },
      { id: 'four',    en: 'Four',    zh: '四',       emoji: '4️⃣', ipa: '/fɔː(r)/' },
      { id: 'five',    en: 'Five',    zh: '五',       emoji: '5️⃣', ipa: '/faɪv/' },
      { id: 'red',     en: 'Red',     zh: '红色的',   emoji: '🔴', ipa: '/red/' },
      { id: 'blue',    en: 'Blue',    zh: '蓝色的',   emoji: '🔵', ipa: '/bluː/' },
      { id: 'yellow',  en: 'Yellow',  zh: '黄色的',   emoji: '💛', ipa: '/ˈjeləʊ/' }
    ]
  });

  Words.registerCategory({
    level: 1, id: 'animals1', name: '可爱动物', emoji: '🐾', desc: '小猫小狗好朋友',
    words: [
      { id: 'cat',    en: 'Cat',    zh: '猫',   emoji: '🐱', ipa: '/kæt/' },
      { id: 'dog',    en: 'Dog',    zh: '狗',   emoji: '🐶', ipa: '/dɒɡ/' },
      { id: 'fish',   en: 'Fish',   zh: '鱼',   emoji: '🐟', ipa: '/fɪʃ/' },
      { id: 'bird',   en: 'Bird',   zh: '鸟',   emoji: '🐦', ipa: '/bɜːd/' },
      { id: 'pig',    en: 'Pig',    zh: '猪',   emoji: '🐷', ipa: '/pɪɡ/' },
      { id: 'duck',   en: 'Duck',   zh: '鸭子', emoji: '🦆', ipa: '/dʌk/' },
      { id: 'cow',    en: 'Cow',    zh: '奶牛', emoji: '🐮', ipa: '/kaʊ/' },
      { id: 'rabbit', en: 'Rabbit', zh: '兔子', emoji: '🐰', ipa: '/ˈræbɪt/' }
    ]
  });

  Words.registerCategory({
    level: 1, id: 'body', name: '我的身体', emoji: '👶', desc: '摸摸头 · 拍拍手',
    words: [
      { id: 'face',  en: 'Face',  zh: '脸',   emoji: '😊', ipa: '/feɪs/' },
      { id: 'hand',  en: 'Hand',  zh: '手',   emoji: '✋', ipa: '/hænd/' },
      { id: 'head',  en: 'Head',  zh: '头',   emoji: '🙆', ipa: '/hed/' },
      { id: 'eye',   en: 'Eye',   zh: '眼睛', emoji: '👁️', ipa: '/aɪ/' },
      { id: 'ear',   en: 'Ear',   zh: '耳朵', emoji: '👂', ipa: '/ɪə(r)/' },
      { id: 'nose',  en: 'Nose',  zh: '鼻子', emoji: '👃', ipa: '/nəʊz/' },
      { id: 'mouth', en: 'Mouth', zh: '嘴巴', emoji: '👄', ipa: '/maʊθ/' },
      { id: 'hair',  en: 'Hair',  zh: '头发', emoji: '💇', ipa: '/heə(r)/' }
    ]
  });

  /* ======================= 二级 · 二年级（基础认知） ======================= */

  Words.registerCategory({
    level: 2, id: 'fruits', name: '水果滋味', emoji: '🍉', desc: '甜甜的水果咬一口',
    words: [
      { id: 'apple',      en: 'Apple',      zh: '苹果', emoji: '🍎', ipa: '/ˈæpl/' },
      { id: 'banana',     en: 'Banana',     zh: '香蕉', emoji: '🍌', ipa: '/bəˈnɑːnə/' },
      { id: 'orange',     en: 'Orange',     zh: '橙子', emoji: '🍊', ipa: '/ˈɒrɪndʒ/' },
      { id: 'pear',       en: 'Pear',       zh: '梨',   emoji: '🍐', ipa: '/peə(r)/' },
      { id: 'peach',      en: 'Peach',      zh: '桃子', emoji: '🍑', ipa: '/piːtʃ/' },
      { id: 'grape',      en: 'Grape',      zh: '葡萄', emoji: '🍇', ipa: '/ɡreɪp/' },
      { id: 'watermelon', en: 'Watermelon', zh: '西瓜', emoji: '🍉', ipa: '/ˈwɔːtəmelən/' },
      { id: 'lemon',      en: 'Lemon',      zh: '柠檬', emoji: '🍋', ipa: '/ˈlemən/' }
    ]
  });

  Words.registerCategory({
    level: 2, id: 'snacks', name: '点心饮料', emoji: '🍪', desc: '小馋猫集合啦',
    words: [
      { id: 'cake',      en: 'Cake',      zh: '蛋糕',       emoji: '🍰', ipa: '/keɪk/' },
      { id: 'candy',     en: 'Candy',     zh: '糖果',       emoji: '🍬', ipa: '/ˈkændi/' },
      { id: 'water',     en: 'Water',     zh: '水',         emoji: '💧', ipa: '/ˈwɔːtə(r)/' },
      { id: 'icecream',  en: 'Ice Cream', zh: '冰淇淋',     emoji: '🍦', ipa: '/ˌaɪs ˈkriːm/' },
      { id: 'dumpling',  en: 'Dumpling',  zh: '饺子',       emoji: '🥟', ipa: '/ˈdʌmplɪŋ/' },
      { id: 'noodle',    en: 'Noodle',    zh: '面条',       emoji: '🍜', ipa: '/ˈnuːdl/' },
      { id: 'cookie',    en: 'Cookie',    zh: '曲奇饼干',   emoji: '🍪', ipa: '/ˈkʊki/' },
      { id: 'yogurt',    en: 'Yogurt',    zh: '酸奶',       emoji: '🥛', ipa: '/ˈjɒɡət/' }
    ]
  });

  Words.registerCategory({
    level: 2, id: 'toys', name: '玩具游戏', emoji: '🪁', desc: '我的宝贝玩具',
    words: [
      { id: 'toy',    en: 'Toy',    zh: '玩具', emoji: '🧸', ipa: '/tɔɪ/' },
      { id: 'ball',   en: 'Ball',   zh: '球',   emoji: '⚽', ipa: '/bɔːl/' },
      { id: 'doll',   en: 'Doll',   zh: '娃娃', emoji: '🎎', ipa: '/dɒl/' },
      { id: 'kite',   en: 'Kite',   zh: '风筝', emoji: '🪁', ipa: '/kaɪt/' },
      { id: 'swing',  en: 'Swing',  zh: '秋千', emoji: '🎠', ipa: '/swɪŋ/' },
      { id: 'slide',  en: 'Slide',  zh: '滑梯', emoji: '🛝', ipa: '/slaɪd/' },
      { id: 'puzzle', en: 'Puzzle', zh: '拼图', emoji: '🧩', ipa: '/ˈpʌzl/' },
      { id: 'bubble', en: 'Bubble', zh: '泡泡', emoji: '🫧', ipa: '/ˈbʌbl/' }
    ]
  });

  Words.registerCategory({
    level: 2, id: 'naturekids', name: '自然小发现', emoji: '🌤️', desc: '抬头看看天',
    words: [
      { id: 'sun',    en: 'Sun',    zh: '太阳', emoji: '☀️', ipa: '/sʌn/' },
      { id: 'moon',   en: 'Moon',   zh: '月亮', emoji: '🌙', ipa: '/muːn/' },
      { id: 'star',   en: 'Star',   zh: '星星', emoji: '⭐', ipa: '/stɑː(r)/' },
      { id: 'tree',   en: 'Tree',   zh: '树',   emoji: '🌳', ipa: '/triː/' },
      { id: 'flower', en: 'Flower', zh: '花',   emoji: '🌸', ipa: '/ˈflaʊə(r)/' },
      { id: 'leaf',   en: 'Leaf',   zh: '叶子', emoji: '🍃', ipa: '/liːf/' },
      { id: 'grass',  en: 'Grass',  zh: '草',   emoji: '🌱', ipa: '/ɡrɑːs/' },
      { id: 'cloud',  en: 'Cloud',  zh: '云',   emoji: '☁️', ipa: '/klaʊd/' }
    ]
  });

  /* ======================= 三级 · 三年级（日常会话） ======================= */

  Words.registerCategory({
    level: 3, id: 'clothes', name: '衣帽鞋袜', emoji: '🧥', desc: '今天穿什么呀',
    words: [
      { id: 'hat',    en: 'Hat',    zh: '帽子',   emoji: '🎩', ipa: '/hæt/' },
      { id: 'coat',   en: 'Coat',   zh: '外套',   emoji: '🧥', ipa: '/kəʊt/' },
      { id: 'shirt',  en: 'Shirt',  zh: '衬衫',   emoji: '👔', ipa: '/ʃɜːt/' },
      { id: 'skirt',  en: 'Skirt',  zh: '裙子',   emoji: '👗', ipa: '/skɜːt/' },
      { id: 'dress',  en: 'Dress',  zh: '连衣裙', emoji: '💃', ipa: '/dres/' },
      { id: 'shoe',   en: 'Shoe',   zh: '鞋子',   emoji: '👟', ipa: '/ʃuː/' },
      { id: 'sock',   en: 'Sock',   zh: '袜子',   emoji: '🧦', ipa: '/sɒk/' },
      { id: 'glove',  en: 'Glove',  zh: '手套',   emoji: '🧤', ipa: '/ɡlʌv/' }
    ]
  });

  Words.registerCategory({
    level: 3, id: 'schoolkids', name: '教室小帮手', emoji: '🖍️', desc: '铅笔橡皮放整齐',
    words: [
      { id: 'schoolbag',    en: 'Schoolbag',    zh: '书包',   emoji: '🎒', ipa: '/ˈskuːlbæɡ/' },
      { id: 'pencilcase',   en: 'Pencil Case',  zh: '文具盒', emoji: '🖋️', ipa: '/ˈpensl keɪs/' },
      { id: 'desk',         en: 'Desk',         zh: '课桌',   emoji: '🪑', ipa: '/desk/' },
      { id: 'chair',        en: 'Chair',        zh: '椅子',   emoji: '💺', ipa: '/tʃeə(r)/' },
      { id: 'blackboard',   en: 'Blackboard',   zh: '黑板',   emoji: '⬛', ipa: '/ˈblækbɔːd/' },
      { id: 'chalk',        en: 'Chalk',        zh: '粉笔',   emoji: '⬜', ipa: '/tʃɔːk/' },
      { id: 'paper',        en: 'Paper',        zh: '纸',     emoji: '📄', ipa: '/ˈpeɪpə(r)/' },
      { id: 'scissors',     en: 'Scissors',     zh: '剪刀',   emoji: '✂️', ipa: '/ˈsɪzəz/' }
    ]
  });

  Words.registerCategory({
    level: 3, id: 'house', name: '温馨的家', emoji: '🏠', desc: '从客厅到卧室',
    words: [
      { id: 'home',   en: 'Home',   zh: '家',   emoji: '🏠', ipa: '/həʊm/' },
      { id: 'door',   en: 'Door',   zh: '门',   emoji: '🚪', ipa: '/dɔː(r)/' },
      { id: 'window', en: 'Window', zh: '窗户', emoji: '🪟', ipa: '/ˈwɪndəʊ/' },
      { id: 'bed',    en: 'Bed',    zh: '床',   emoji: '🛏️', ipa: '/bed/' },
      { id: 'table',  en: 'Table',  zh: '桌子', emoji: '🍽️', ipa: '/ˈteɪbl/' },
      { id: 'sofa',   en: 'Sofa',   zh: '沙发', emoji: '🛋️', ipa: '/ˈsəʊfə/' },
      { id: 'clock',  en: 'Clock',  zh: '时钟', emoji: '🕐', ipa: '/klɒk/' },
      { id: 'lamp',   en: 'Lamp',   zh: '台灯', emoji: '💡', ipa: '/læmp/' }
    ]
  });

  Words.registerCategory({
    level: 3, id: 'pets', name: '宠物朋友', emoji: '🐶', desc: '动物是我的伙伴',
    words: [
      { id: 'pet',      en: 'Pet',      zh: '宠物',   emoji: '🐾', ipa: '/pet/' },
      { id: 'puppy',    en: 'Puppy',    zh: '小狗',   emoji: '🐕', ipa: '/ˈpʌpi/' },
      { id: 'kitten',   en: 'Kitten',   zh: '小猫',   emoji: '🐈', ipa: '/ˈkɪtn/' },
      { id: 'turtle',   en: 'Turtle',   zh: '乌龟',   emoji: '🐢', ipa: '/ˈtɜːtl/' },
      { id: 'parrot',   en: 'Parrot',   zh: '鹦鹉',   emoji: '🦜', ipa: '/ˈpærət/' },
      { id: 'hamster',  en: 'Hamster',  zh: '仓鼠',   emoji: '🐹', ipa: '/ˈhæmstə(r)/' },
      { id: 'goldfish', en: 'Goldfish', zh: '金鱼',   emoji: '🐠', ipa: '/ˈɡəʊldfɪʃ/' },
      { id: 'pigeon',   en: 'Pigeon',   zh: '鸽子',   emoji: '🕊️', ipa: '/ˈpɪdʒɪn/' }
    ]
  });

  /* ======================= 四级 · 四年级（兴趣拓展） ======================= */

  Words.registerCategory({
    level: 4, id: 'places', name: '快乐场所', emoji: '🎡', desc: '周末去哪儿玩',
    words: [
      { id: 'park',        en: 'Park',        zh: '公园',     emoji: '⛲', ipa: '/pɑːk/' },
      { id: 'street',      en: 'Street',      zh: '街道',     emoji: '🚥', ipa: '/striːt/' },
      { id: 'zoo',         en: 'Zoo',         zh: '动物园',   emoji: '🦁', ipa: '/zuː/' },
      { id: 'picnic',      en: 'Picnic',      zh: '野餐',     emoji: '🧺', ipa: '/ˈpɪknɪk/' },
      { id: 'playground',  en: 'Playground',  zh: '游乐场',   emoji: '🎡', ipa: '/ˈpleɪɡraʊnd/' },
      { id: 'cinema',      en: 'Cinema',      zh: '电影院',   emoji: '🎬', ipa: '/ˈsɪnəmə/' },
      { id: 'restaurant',  en: 'Restaurant',  zh: '餐厅',     emoji: '🍴', ipa: '/ˈrestrɒnt/' },
      { id: 'supermarket', en: 'Supermarket', zh: '超市',     emoji: '🛒', ipa: '/ˈsuːpəmɑːkɪt/' }
    ]
  });

  Words.registerCategory({
    level: 4, id: 'actions', name: '日常动作', emoji: '🏃', desc: '我会做的动作',
    words: [
      { id: 'play',  en: 'Play',  zh: '玩',   emoji: '🎮', ipa: '/pleɪ/' },
      { id: 'sing',  en: 'Sing',  zh: '唱歌', emoji: '🎤', ipa: '/sɪŋ/' },
      { id: 'run',   en: 'Run',   zh: '跑',   emoji: '🏃', ipa: '/rʌn/' },
      { id: 'jump',  en: 'Jump',  zh: '跳',   emoji: '🦘', ipa: '/dʒʌmp/' },
      { id: 'walk',  en: 'Walk',  zh: '走路', emoji: '🚶', ipa: '/wɔːk/' },
      { id: 'smile', en: 'Smile', zh: '微笑', emoji: '😄', ipa: '/smaɪl/' },
      { id: 'laugh', en: 'Laugh', zh: '大笑', emoji: '😂', ipa: '/lɑːf/' },
      { id: 'cry',   en: 'Cry',   zh: '哭',   emoji: '😭', ipa: '/kraɪ/' }
    ]
  });

  Words.registerCategory({
    level: 4, id: 'friends', name: '友好朋友', emoji: '👭', desc: '好朋友一起玩',
    words: [
      { id: 'friend',   en: 'Friend',   zh: '朋友',   emoji: '🧑‍🤝‍🧑', ipa: '/frend/' },
      { id: 'happy',    en: 'Happy',    zh: '开心的', emoji: '😀', ipa: '/ˈhæpi/' },
      { id: 'kind',     en: 'Kind',     zh: '友善的', emoji: '💖', ipa: '/kaɪnd/' },
      { id: 'fun',      en: 'Fun',      zh: '有趣的', emoji: '🎉', ipa: '/fʌn/' },
      { id: 'together', en: 'Together', zh: '一起',   emoji: '🤗', ipa: '/təˈɡeðə(r)/' },
      { id: 'share',    en: 'Share',    zh: '分享',   emoji: '🧡', ipa: '/ʃeə(r)/' },
      { id: 'help',     en: 'Help',     zh: '帮助',   emoji: '🆘', ipa: '/help/' },
      { id: 'team',     en: 'Team',     zh: '团队',   emoji: '👭', ipa: '/tiːm/' }
    ]
  });

  Words.registerCategory({
    level: 4, id: 'outdoor', name: '户外走走', emoji: '🏞️', desc: '山野湖河任你行',
    words: [
      { id: 'garden', en: 'Garden', zh: '花园', emoji: '🌷', ipa: '/ˈɡɑːdn/' },
      { id: 'farm',   en: 'Farm',   zh: '农场', emoji: '🚜', ipa: '/fɑːm/' },
      { id: 'river',  en: 'River',  zh: '河流', emoji: '🏞️', ipa: '/ˈrɪvə(r)/' },
      { id: 'lake',   en: 'Lake',   zh: '湖',   emoji: '🪷', ipa: '/leɪk/' },
      { id: 'hill',   en: 'Hill',   zh: '小山', emoji: '⛰️', ipa: '/hɪl/' },
      { id: 'stone',  en: 'Stone',  zh: '石头', emoji: '🪨', ipa: '/stəʊn/' },
      { id: 'sand',   en: 'Sand',   zh: '沙子', emoji: '🏖️', ipa: '/sænd/' },
      { id: 'sky',    en: 'Sky',    zh: '天空', emoji: '🌌', ipa: '/skaɪ/' }
    ]
  });

  /* ======================= 五级 · 五年级（进阶表达） ======================= */

  Words.registerCategory({
    level: 5, id: 'feelings', name: '心情小管家', emoji: '🥰', desc: '开心难过说出来',
    words: [
      { id: 'glad',    en: 'Glad',    zh: '高兴的', emoji: '🥰', ipa: '/ɡlæd/' },
      { id: 'excited', en: 'Excited', zh: '兴奋的', emoji: '🤩', ipa: '/ɪkˈsaɪtɪd/' },
      { id: 'bored',   en: 'Bored',   zh: '无聊的', emoji: '🥱', ipa: '/bɔːd/' },
      { id: 'hungry',  en: 'Hungry',  zh: '饿的',   emoji: '😋', ipa: '/ˈhʌŋɡri/' },
      { id: 'angry',   en: 'Angry',   zh: '生气的', emoji: '😠', ipa: '/ˈæŋɡri/' },
      { id: 'shy',     en: 'Shy',     zh: '害羞的', emoji: '😳', ipa: '/ʃaɪ/' },
      { id: 'tired',   en: 'Tired',   zh: '累的',   emoji: '😪', ipa: '/ˈtaɪəd/' },
      { id: 'afraid',  en: 'Afraid',  zh: '害怕的', emoji: '😨', ipa: '/əˈfreɪd/' }
    ]
  });

  Words.registerCategory({
    level: 5, id: 'jobskids', name: '长大做什么', emoji: '💈', desc: '身边劳动者的职业',
    words: [
      { id: 'nurse',         en: 'Nurse',         zh: '护士',     emoji: '👩‍⚕️', ipa: '/nɜːs/' },
      { id: 'policeofficer', en: 'Police Officer', zh: '警察',     emoji: '👮', ipa: '/pəˈliːs ˈɒfɪsə(r)/' },
      { id: 'cook',          en: 'Cook',          zh: '厨师',     emoji: '👨‍🍳', ipa: '/kʊk/' },
      { id: 'driver',        en: 'Driver',        zh: '司机',     emoji: '🚙', ipa: '/ˈdraɪvə(r)/' },
      { id: 'farmer',        en: 'Farmer',        zh: '农民',     emoji: '👩‍🌾', ipa: '/ˈfɑːmə(r)/' },
      { id: 'singer',        en: 'Singer',        zh: '歌手',     emoji: '🎶', ipa: '/ˈsɪŋə(r)/' },
      { id: 'firefighter',   en: 'Firefighter',   zh: '消防员',   emoji: '🧑‍🚒', ipa: '/ˈfaɪəfaɪtə(r)/' },
      { id: 'barber',        en: 'Barber',        zh: '理发师',   emoji: '💈', ipa: '/ˈbɑːbə(r)/' }
    ]
  });

  Words.registerCategory({
    level: 5, id: 'games', name: '课间游戏', emoji: '🕹️', desc: '跳房子 · 丢沙包',
    words: [
      { id: 'ski',   en: 'Ski',   zh: '滑雪', emoji: '⛷️', ipa: '/skiː/' },
      { id: 'skate', en: 'Skate', zh: '滑冰', emoji: '⛸️', ipa: '/skeɪt/' },
      { id: 'rope',  en: 'Rope',  zh: '绳子', emoji: '🪢', ipa: '/rəʊp/' },
      { id: 'game',  en: 'Game',  zh: '游戏', emoji: '🕹️', ipa: '/ɡeɪm/' },
      { id: 'prize', en: 'Prize', zh: '奖品', emoji: '🥇', ipa: '/praɪz/' },
      { id: 'win',   en: 'Win',   zh: '赢',   emoji: '🥳', ipa: '/wɪn/' },
      { id: 'guess', en: 'Guess', zh: '猜',   emoji: '🤔', ipa: '/ɡes/' },
      { id: 'race',  en: 'Race',  zh: '比赛', emoji: '🏎️', ipa: '/reɪs/' }
    ]
  });

  Words.registerCategory({
    level: 5, id: 'directions', name: '我在哪儿', emoji: '🧭', desc: '上上下下找一找',
    words: [
      { id: 'here',  en: 'Here',  zh: '这里',     emoji: '📍', ipa: '/hɪə(r)/' },
      { id: 'there', en: 'There', zh: '那里',     emoji: '👉', ipa: '/ðeə(r)/' },
      { id: 'in',    en: 'In',    zh: '在…里面',  emoji: '📦', ipa: '/ɪn/' },
      { id: 'on',    en: 'On',    zh: '在…上面',  emoji: '☝️', ipa: '/ɒn/' },
      { id: 'under', en: 'Under', zh: '在…下面',  emoji: '👇', ipa: '/ˈʌndə(r)/' },
      { id: 'near',  en: 'Near',  zh: '在…附近',  emoji: '🧭', ipa: '/nɪə(r)/' },
      { id: 'left',  en: 'Left',  zh: '左边',     emoji: '⬅️', ipa: '/left/' },
      { id: 'right', en: 'Right', zh: '右边',     emoji: '➡️', ipa: '/raɪt/' }
    ]
  });

  /* ======================= 六级 · 六年级（小升初衔接） ======================= */

  Words.registerCategory({
    level: 6, id: 'calendar', name: '日历转转转', emoji: '🗓️', desc: '今天星期几呀',
    words: [
      { id: 'today',    en: 'Today',    zh: '今天',   emoji: '🗓️', ipa: '/təˈdeɪ/' },
      { id: 'monday',   en: 'Monday',   zh: '星期一', emoji: '📅', ipa: '/ˈmʌndeɪ/' },
      { id: 'sunday',   en: 'Sunday',   zh: '星期日', emoji: '🌞', ipa: '/ˈsʌndeɪ/' },
      { id: 'weekend',  en: 'Weekend',  zh: '周末',   emoji: '🎣', ipa: '/ˌwiːkˈend/' },
      { id: 'festival', en: 'Festival', zh: '节日',   emoji: '🎏', ipa: '/ˈfestɪvl/' },
      { id: 'birthday', en: 'Birthday', zh: '生日',   emoji: '🎂', ipa: '/ˈbɜːθdeɪ/' },
      { id: 'party',    en: 'Party',    zh: '聚会',   emoji: '🎈', ipa: '/ˈpɑːti/' },
      { id: 'calendar', en: 'Calendar', zh: '日历',   emoji: '🗓️', ipa: '/ˈkælɪndə(r)/' }
    ]
  });

  Words.registerCategory({
    level: 6, id: 'taste', name: '餐桌小达人', emoji: '🍽️', desc: '酸甜苦辣尝一尝',
    words: [
      { id: 'sweet',     en: 'Sweet',     zh: '甜的',   emoji: '🍯', ipa: '/swiːt/' },
      { id: 'sour',      en: 'Sour',      zh: '酸的',   emoji: '😖', ipa: '/ˈsaʊə(r)/' },
      { id: 'spicy',     en: 'Spicy',     zh: '辣的',   emoji: '🌶️', ipa: '/ˈspaɪsi/' },
      { id: 'taste',     en: 'Taste',     zh: '味道',   emoji: '👅', ipa: '/teɪst/' },
      { id: 'menu',      en: 'Menu',      zh: '菜单',   emoji: '📜', ipa: '/ˈmenjuː/' },
      { id: 'plate',     en: 'Plate',     zh: '盘子',   emoji: '🍽️', ipa: '/pleɪt/' },
      { id: 'fork',      en: 'Fork',      zh: '叉子',   emoji: '🍴', ipa: '/fɔːk/' },
      { id: 'chopsticks',en: 'Chopsticks',zh: '筷子',   emoji: '🥢', ipa: '/ˈtʃɒpstɪks/' }
    ]
  });

  Words.registerCategory({
    level: 6, id: 'china', name: '大美中国', emoji: '🇨🇳', desc: '中国我们爱你',
    words: [
      { id: 'china',    en: 'China',    zh: '中国',   emoji: '🇨🇳', ipa: '/ˈtʃaɪnə/' },
      { id: 'chinese',  en: 'Chinese',  zh: '中文的', emoji: '🀄', ipa: '/ˌtʃaɪˈniːz/' },
      { id: 'beijing',  en: 'Beijing',  zh: '北京',   emoji: '🏙️', ipa: '/ˌbeɪˈdʒɪŋ/' },
      { id: 'flag',     en: 'Flag',     zh: '国旗',   emoji: '🚩', ipa: '/flæɡ/' },
      { id: 'panda',    en: 'Panda',    zh: '熊猫',   emoji: '🐼', ipa: '/ˈpændə/' },
      { id: 'dragon',   en: 'Dragon',   zh: '龙',     emoji: '🐉', ipa: '/ˈdræɡən/' },
      { id: 'lantern',  en: 'Lantern',  zh: '灯笼',   emoji: '🏮', ipa: '/ˈlæntən/' },
      { id: 'greatwall',en: 'Great Wall',zh:'万里长城', emoji: '🧱', ipa: '/ˌɡreɪt ˈwɔːl/' }
    ]
  });

  Words.registerCategory({
    level: 6, id: 'farewell', name: '毕业告别', emoji: '🎒', desc: '再见小学 · 你好初中',
    words: [
      { id: 'classmate', en: 'Classmate', zh: '同学',   emoji: '🧑‍🎓', ipa: '/ˈklɑːsmeɪt/' },
      { id: 'memory',    en: 'Memory',    zh: '回忆',   emoji: '💭', ipa: '/ˈmeməri/' },
      { id: 'farewell',  en: 'Farewell',  zh: '告别',   emoji: '👋', ipa: '/ˌfeəˈwel/' },
      { id: 'promise',   en: 'Promise',   zh: '承诺',   emoji: '🤞', ipa: '/ˈprɒmɪs/' },
      { id: 'future',    en: 'Future',    zh: '未来',   emoji: '🔮', ipa: '/ˈfjuːtʃə(r)/' },
      { id: 'dream',     en: 'Dream',     zh: '梦想',   emoji: '✨', ipa: '/driːm/' },
      { id: 'wish',      en: 'Wish',      zh: '愿望',   emoji: '🌠', ipa: '/wɪʃ/' },
      { id: 'hope',      en: 'Hope',      zh: '希望',   emoji: '🐣', ipa: '/həʊp/' }
    ]
  });

  /* ======================= 七级 · 七年级（初中入门） ======================= */

  Words.registerCategory({
    level: 7, id: 'school', name: '校园学习', emoji: '🏫', desc: '开学第一课',
    words: [
      { id: 'pen',        en: 'Pen',        zh: '钢笔',     emoji: '🖊️', ipa: '/pen/' },
      { id: 'pencil',     en: 'Pencil',     zh: '铅笔',     emoji: '✏️', ipa: '/ˈpensl/' },
      { id: 'ruler',      en: 'Ruler',      zh: '尺子',     emoji: '📏', ipa: '/ˈruːlə(r)/' },
      { id: 'eraser',     en: 'Eraser',     zh: '橡皮',     emoji: '🩹', ipa: '/ɪˈreɪzə(r)/' },
      { id: 'book',       en: 'Book',       zh: '书本',     emoji: '📖', ipa: '/bʊk/' },
      { id: 'notebook',   en: 'Notebook',   zh: '笔记本',   emoji: '📓', ipa: '/ˈnəʊtbʊk/' },
      { id: 'dictionary', en: 'Dictionary', zh: '词典',     emoji: '📕', ipa: '/ˈdɪkʃənri/' },
      { id: 'classroom',  en: 'Classroom',  zh: '教室',     emoji: '🏫', ipa: '/ˈklɑːsruːm/' }
    ]
  });

  Words.registerCategory({
    level: 7, id: 'family', name: '温馨家庭', emoji: '🏠', desc: '爸爸 妈妈 和我',
    words: [
      { id: 'family',      en: 'Family',      zh: '家庭',     emoji: '👨‍👩‍👧', ipa: '/ˈfæməli/' },
      { id: 'father',      en: 'Father',      zh: '爸爸',     emoji: '👨', ipa: '/ˈfɑːðə(r)/' },
      { id: 'mother',      en: 'Mother',      zh: '妈妈',     emoji: '👩', ipa: '/ˈmʌðə(r)/' },
      { id: 'brother',     en: 'Brother',     zh: '兄·弟',    emoji: '👦', ipa: '/ˈbrʌðə(r)/' },
      { id: 'sister',      en: 'Sister',      zh: '姐·妹',    emoji: '👧', ipa: '/ˈsɪstə(r)/' },
      { id: 'grandfather', en: 'Grandfather', zh: '祖父',     emoji: '👴', ipa: '/ˈɡrænfɑːðə(r)/' },
      { id: 'grandmother', en: 'Grandmother', zh: '祖母',     emoji: '👵', ipa: '/ˈɡrænmʌðə(r)/' },
      { id: 'cousin',      en: 'Cousin',      zh: '堂/表亲',  emoji: '🧒', ipa: '/ˈkʌzn/' }
    ]
  });

  Words.registerCategory({
    level: 7, id: 'timeclass', name: '时间课程', emoji: '⏰', desc: '几点上课？',
    words: [
      { id: 'time',      en: 'Time',      zh: '时间',   emoji: '⏰', ipa: '/taɪm/' },
      { id: 'morning',   en: 'Morning',   zh: '早晨',   emoji: '🌅', ipa: '/ˈmɔːnɪŋ/' },
      { id: 'afternoon', en: 'Afternoon', zh: '下午',   emoji: '🌇', ipa: '/ˌɑːftəˈnuːn/' },
      { id: 'evening',   en: 'Evening',   zh: '晚上',   emoji: '🌙', ipa: '/ˈiːvnɪŋ/' },
      { id: 'week',      en: 'Week',      zh: '星期',   emoji: '📅', ipa: '/wiːk/' },
      { id: 'class',     en: 'Class',     zh: '课',     emoji: '🧑‍🏫', ipa: '/klɑːs/' },
      { id: 'subject',   en: 'Subject',   zh: '科目',   emoji: '📚', ipa: '/ˈsʌbdʒɪkt/' },
      { id: 'homework',  en: 'Homework',  zh: '作业',   emoji: '📝', ipa: '/ˈhəʊmwɜːk/' }
    ]
  });

  Words.registerCategory({
    level: 7, id: 'food', name: '一日三餐', emoji: '🍚', desc: '吃好才有劲儿',
    words: [
      { id: 'breakfast', en: 'Breakfast', zh: '早餐',     emoji: '🥐', ipa: '/ˈbrekfəst/' },
      { id: 'lunch',     en: 'Lunch',     zh: '午餐',     emoji: '🍱', ipa: '/lʌntʃ/' },
      { id: 'dinner',    en: 'Dinner',    zh: '晚餐',     emoji: '🍽️', ipa: '/ˈdɪnə(r)/' },
      { id: 'rice',      en: 'Rice',      zh: '米饭',     emoji: '🍚', ipa: '/raɪs/' },
      { id: 'egg',       en: 'Egg',       zh: '鸡蛋',     emoji: '🥚', ipa: '/eɡ/' },
      { id: 'milk',      en: 'Milk',      zh: '牛奶',     emoji: '🥛', ipa: '/mɪlk/' },
      { id: 'bread',     en: 'Bread',     zh: '面包',     emoji: '🍞', ipa: '/bred/' },
      { id: 'vegetable', en: 'Vegetable', zh: '蔬菜',     emoji: '🥦', ipa: '/ˈvedʒtəbl/' }
    ]
  });

  /* ======================= 八级 · 八年级（日常进阶） ======================= */

  Words.registerCategory({
    level: 8, id: 'sports', name: '运动健身', emoji: '🏀', desc: '课间十分钟也要动',
    words: [
      { id: 'sport',      en: 'Sport',      zh: '运动',   emoji: '🏃', ipa: '/spɔːt/' },
      { id: 'basketball', en: 'Basketball', zh: '篮球',   emoji: '🏀', ipa: '/ˈbɑːskɪtbɔːl/' },
      { id: 'football',   en: 'Football',   zh: '足球',   emoji: '⚽', ipa: '/ˈfʊtbɔːl/' },
      { id: 'swimming',   en: 'Swimming',   zh: '游泳',   emoji: '🏊', ipa: '/ˈswɪmɪŋ/' },
      { id: 'running',    en: 'Running',    zh: '跑步',   emoji: '🏃‍♀️', ipa: '/ˈrʌnɪŋ/' },
      { id: 'jogging',    en: 'Jogging',    zh: '慢跑',   emoji: '🎽', ipa: '/ˈdʒɒɡɪŋ/' },
      { id: 'badminton',  en: 'Badminton',  zh: '羽毛球', emoji: '🏸', ipa: '/ˈbædmɪntən/' },
      { id: 'tennis',     en: 'Tennis',     zh: '网球',   emoji: '🎾', ipa: '/ˈtenɪs/' }
    ]
  });

  Words.registerCategory({
    level: 8, id: 'transport', name: '出行交通', emoji: '🚌', desc: '怎么去学校？',
    words: [
      { id: 'bus',    en: 'Bus',    zh: '公交车', emoji: '🚌', ipa: '/bʌs/' },
      { id: 'bike',   en: 'Bike',   zh: '自行车', emoji: '🚲', ipa: '/baɪk/' },
      { id: 'subway', en: 'Subway', zh: '地铁',   emoji: '🚇', ipa: '/ˈsʌbweɪ/' },
      { id: 'taxi',   en: 'Taxi',   zh: '出租车', emoji: '🚕', ipa: '/ˈtæksi/' },
      { id: 'train',  en: 'Train',  zh: '火车',   emoji: '🚆', ipa: '/treɪn/' },
      { id: 'plane',  en: 'Plane',  zh: '飞机',   emoji: '✈️', ipa: '/pleɪn/' },
      { id: 'car',    en: 'Car',    zh: '小汽车', emoji: '🚗', ipa: '/kɑː(r)/' },
      { id: 'ticket', en: 'Ticket', zh: '车票',   emoji: '🎫', ipa: '/ˈtɪkɪt/' }
    ]
  });

  Words.registerCategory({
    level: 8, id: 'seasons', name: '天气季节', emoji: '🌦️', desc: '一年四季分得清',
    words: [
      { id: 'weather', en: 'Weather', zh: '天气',   emoji: '⛅', ipa: '/ˈweðə(r)/' },
      { id: 'sunny',   en: 'Sunny',   zh: '晴朗的', emoji: '☀️', ipa: '/ˈsʌni/' },
      { id: 'rainy',   en: 'Rainy',   zh: '下雨的', emoji: '🌧️', ipa: '/ˈreɪni/' },
      { id: 'windy',   en: 'Windy',   zh: '刮风的', emoji: '🌬️', ipa: '/ˈwɪndi/' },
      { id: 'snowy',   en: 'Snowy',   zh: '下雪的', emoji: '🌨️', ipa: '/ˈsnəʊi/' },
      { id: 'season',  en: 'Season',  zh: '季节',   emoji: '🍂', ipa: '/ˈsiːzn/' },
      { id: 'spring',  en: 'Spring',  zh: '春天',   emoji: '🌱', ipa: '/sprɪŋ/' },
      { id: 'autumn',  en: 'Autumn',  zh: '秋天',   emoji: '🍁', ipa: '/ˈɔːtəm/' }
    ]
  });

  Words.registerCategory({
    level: 8, id: 'travel', name: '旅游名胜', emoji: '🧳', desc: '世界那么大去走走',
    words: [
      { id: 'travel',   en: 'Travel',   zh: '旅行',     emoji: '🧳', ipa: '/ˈtrævl/' },
      { id: 'hotel',    en: 'Hotel',    zh: '宾馆',     emoji: '🏨', ipa: '/həʊˈtel/' },
      { id: 'beach',    en: 'Beach',    zh: '海滩',     emoji: '🏖️', ipa: '/biːtʃ/' },
      { id: 'mountain', en: 'Mountain', zh: '山',       emoji: '⛰️', ipa: '/ˈmaʊntən/' },
      { id: 'museum',   en: 'Museum',   zh: '博物馆',   emoji: '🏛️', ipa: '/mjuˈziːəm/' },
      { id: 'map',      en: 'Map',      zh: '地图',     emoji: '🗺️', ipa: '/mæp/' },
      { id: 'camera',   en: 'Camera',   zh: '照相机',   emoji: '📷', ipa: '/ˈkæmərə/' },
      { id: 'souvenir', en: 'Souvenir', zh: '纪念品',   emoji: '🎁', ipa: '/ˌsuːvəˈnɪə(r)/' }
    ]
  });

  /* ======================= 九级 · 九年级（中考冲刺） ======================= */

  Words.registerCategory({
    level: 9, id: 'rules', name: '校园规则', emoji: '📋', desc: '图书馆礼仪与校规',
    words: [
      { id: 'rule',    en: 'Rule',    zh: '规则',   emoji: '📋', ipa: '/ruːl/' },
      { id: 'library', en: 'Library', zh: '图书馆', emoji: '📚', ipa: '/ˈlaɪbrəri/' },
      { id: 'borrow',  en: 'Borrow',  zh: '借入',   emoji: '🤲', ipa: '/ˈbɒrəʊ/' },
      { id: 'return',  en: 'Return',  zh: '归还',   emoji: '↩️', ipa: '/rɪˈtɜːn/' },
      { id: 'quiet',   en: 'Quiet',   zh: '安静的', emoji: '🤫', ipa: '/ˈkwaɪət/' },
      { id: 'queue',   en: 'Queue',   zh: '排队',   emoji: '🧍‍♀️', ipa: '/kjuː/' },
      { id: 'uniform', en: 'Uniform', zh: '校服',   emoji: '👔', ipa: '/ˈjuːnɪfɔːm/' },
      { id: 'respect', en: 'Respect', zh: '尊重',   emoji: '🤝', ipa: '/rɪˈspekt/' }
    ]
  });

  Words.registerCategory({
    level: 9, id: 'exam', name: '学习备考', emoji: '📝', desc: '错题都变对',
    words: [
      { id: 'exam',       en: 'Exam',       zh: '考试',   emoji: '📝', ipa: '/ɪɡˈzæm/' },
      { id: 'review',     en: 'Review',     zh: '复习',   emoji: '🔁', ipa: '/rɪˈvjuː/' },
      { id: 'mistake',    en: 'Mistake',    zh: '错误',   emoji: '❌', ipa: '/mɪˈsteɪk/' },
      { id: 'progress',   en: 'Progress',   zh: '进步',   emoji: '📈', ipa: '/ˈprəʊɡres/' },
      { id: 'improve',    en: 'Improve',    zh: '提高',   emoji: '⬆️', ipa: '/ɪmˈpruːv/' },
      { id: 'remember',   en: 'Remember',   zh: '记住',   emoji: '🧠', ipa: '/rɪˈmembə(r)/' },
      { id: 'understand', en: 'Understand', zh: '理解',   emoji: '💡', ipa: '/ˌʌndəˈstænd/' },
      { id: 'success',    en: 'Success',    zh: '成功',   emoji: '🏆', ipa: '/səkˈses/' }
    ]
  });

  Words.registerCategory({
    level: 9, id: 'eco', name: '环境保护', emoji: '🌏', desc: '绿色行动从我做起',
    words: [
      { id: 'environment', en: 'Environment', zh: '环境',   emoji: '🌏', ipa: '/ɪnˈvaɪrənmənt/' },
      { id: 'pollution',   en: 'Pollution',   zh: '污染',   emoji: '🏭', ipa: '/pəˈluːʃn/' },
      { id: 'recycle',     en: 'Recycle',     zh: '回收',   emoji: '♻️', ipa: '/ˌriːˈsaɪkl/' },
      { id: 'protect',     en: 'Protect',     zh: '保护',   emoji: '🛡️', ipa: '/prəˈtekt/' },
      { id: 'save',        en: 'Save',        zh: '节约',   emoji: '💧', ipa: '/seɪv/' },
      { id: 'energy',      en: 'Energy',      zh: '能源',   emoji: '⚡', ipa: '/ˈenədʒi/' },
      { id: 'forest',      en: 'Forest',      zh: '森林',   emoji: '🌲', ipa: '/ˈfɒrɪst/' },
      { id: 'rescue',      en: 'Rescue',      zh: '救援',   emoji: '🚁', ipa: '/ˈreskjuː/' }
    ]
  });

  Words.registerCategory({
    level: 9, id: 'jobs', name: '职业梦想', emoji: '🚀', desc: '长大后想做什么',
    words: [
      { id: 'job',       en: 'Job',       zh: '工作',   emoji: '💼', ipa: '/dʒɒb/' },
      { id: 'doctor',    en: 'Doctor',    zh: '医生',   emoji: '🧑‍⚕️', ipa: '/ˈdɒktə(r)/' },
      { id: 'teacher',   en: 'Teacher',   zh: '老师',   emoji: '🧑‍🏫', ipa: '/ˈtiːtʃə(r)/' },
      { id: 'musician',  en: 'Musician',  zh: '音乐家', emoji: '🎹', ipa: '/mjuˈzɪʃn/' },
      { id: 'engineer',  en: 'Engineer',  zh: '工程师', emoji: '👷', ipa: '/ˌendʒɪˈnɪə(r)/' },
      { id: 'pilot',     en: 'Pilot',     zh: '飞行员', emoji: '🧑‍✈️', ipa: '/ˈpaɪlət/' },
      { id: 'scientist', en: 'Scientist', zh: '科学家', emoji: '🔬', ipa: '/ˈsaɪəntɪst/' },
      { id: 'writer',    en: 'Writer',    zh: '作家',   emoji: '✍️', ipa: '/ˈraɪtə(r)/' }
    ]
  });

  /* ======================= 十级 · 高一（高中衔接） ======================= */

  Words.registerCategory({
    level: 10, id: 'campus', name: '高中校园', emoji: '🏫', desc: '新环境 新起点',
    words: [
      { id: 'campus',    en: 'Campus',    zh: '校园',     emoji: '🏫', ipa: '/ˈkæmpəs/' },
      { id: 'dormitory', en: 'Dormitory', zh: '宿舍',     emoji: '🛏️', ipa: '/ˈdɔːmətri/' },
      { id: 'canteen',   en: 'Canteen',   zh: '食堂',     emoji: '🍜', ipa: '/kænˈtiːn/' },
      { id: 'schedule',  en: 'Schedule',  zh: '日程表',   emoji: '📆', ipa: '/ˈʃedjuːl/' },
      { id: 'club',      en: 'Club',      zh: '社团',     emoji: '🎪', ipa: '/klʌb/' },
      { id: 'meeting',   en: 'Meeting',   zh: '会议',     emoji: '🤝', ipa: '/ˈmiːtɪŋ/' },
      { id: 'lecture',   en: 'Lecture',   zh: '讲座',     emoji: '🎤', ipa: '/ˈlektʃə(r)/' },
      { id: 'semester',  en: 'Semester',  zh: '学期',     emoji: '🗓️', ipa: '/sɪˈmestə(r)/' }
    ]
  });

  Words.registerCategory({
    level: 10, id: 'hobbies', name: '兴趣培养', emoji: '🎸', desc: '把喜欢的事做长久',
    words: [
      { id: 'hobby',       en: 'Hobby',       zh: '爱好',     emoji: '🎨', ipa: '/ˈhɒbi/' },
      { id: 'photography', en: 'Photography', zh: '摄影',     emoji: '📸', ipa: '/fəˈtɒɡrəfi/' },
      { id: 'guitar',      en: 'Guitar',      zh: '吉他',     emoji: '🎸', ipa: '/ɡɪˈtɑː(r)/' },
      { id: 'dance',       en: 'Dance',       zh: '跳舞',     emoji: '💃', ipa: '/dɑːns/' },
      { id: 'chess',       en: 'Chess',       zh: '国际象棋', emoji: '♟️', ipa: '/tʃes/' },
      { id: 'cooking',     en: 'Cooking',     zh: '烹饪',     emoji: '🍳', ipa: '/ˈkʊkɪŋ/' },
      { id: 'painting',    en: 'Painting',    zh: '绘画',     emoji: '🖼️', ipa: '/ˈpeɪntɪŋ/' },
      { id: 'collection',  en: 'Collection',  zh: '收藏',     emoji: '🪙', ipa: '/kəˈlekʃn/' }
    ]
  });

  Words.registerCategory({
    level: 10, id: 'fitness', name: '健康生活', emoji: '💪', desc: '身体是学习的本钱',
    words: [
      { id: 'health',   en: 'Health',   zh: '健康',   emoji: '💪', ipa: '/helθ/' },
      { id: 'exercise', en: 'Exercise', zh: '锻炼',   emoji: '🏋️', ipa: '/ˈeksəsaɪz/' },
      { id: 'yoga',     en: 'Yoga',     zh: '瑜伽',   emoji: '🧘', ipa: '/ˈjəʊɡə/' },
      { id: 'cycling',  en: 'Cycling',  zh: '骑行',   emoji: '🚴', ipa: '/ˈsaɪklɪŋ/' },
      { id: 'marathon', en: 'Marathon', zh: '马拉松', emoji: '🏅', ipa: '/ˈmærəθən/' },
      { id: 'diet',     en: 'Diet',     zh: '饮食',   emoji: '🥗', ipa: '/ˈdaɪət/' },
      { id: 'sleep',    en: 'Sleep',    zh: '睡眠',   emoji: '😴', ipa: '/sliːp/' },
      { id: 'strength', en: 'Strength', zh: '力量',   emoji: '🦾', ipa: '/streŋθ/' }
    ]
  });

  Words.registerCategory({
    level: 10, id: 'reading', name: '阅读写作', emoji: '📰', desc: '会读才会写',
    words: [
      { id: 'language',   en: 'Language',   zh: '语言',   emoji: '🗨️', ipa: '/ˈlæŋɡwɪdʒ/' },
      { id: 'grammar',    en: 'Grammar',    zh: '语法',   emoji: '🛠️', ipa: '/ˈɡræmə(r)/' },
      { id: 'vocabulary', en: 'Vocabulary', zh: '词汇',   emoji: '🧩', ipa: '/vəˈkæbjələri/' },
      { id: 'sentence',   en: 'Sentence',   zh: '句子',   emoji: '✏️', ipa: '/ˈsentəns/' },
      { id: 'article',    en: 'Article',    zh: '文章',   emoji: '📄', ipa: '/ˈɑːtɪkl/' },
      { id: 'culture',    en: 'Culture',    zh: '文化',   emoji: '🏮', ipa: '/ˈkʌltʃə(r)/' },
      { id: 'newspaper',  en: 'Newspaper',  zh: '报纸',   emoji: '📰', ipa: '/ˈnjuːzpeɪpə(r)/' },
      { id: 'diary',      en: 'Diary',      zh: '日记',   emoji: '📔', ipa: '/ˈdaɪəri/' }
    ]
  });

  /* ======================= 十一级 · 高二（深化提升） ======================= */

  Words.registerCategory({
    level: 11, id: 'cyber', name: '网络科技', emoji: '💻', desc: '数字世界好公民',
    words: [
      { id: 'internet',   en: 'Internet',   zh: '互联网',   emoji: '🌐', ipa: '/ˈɪntənet/' },
      { id: 'password',   en: 'Password',   zh: '密码',     emoji: '🔑', ipa: '/ˈpɑːswɜːd/' },
      { id: 'download',   en: 'Download',   zh: '下载',     emoji: '⬇️', ipa: '/ˌdaʊnˈləʊd/' },
      { id: 'website',    en: 'Website',    zh: '网站',     emoji: '🖥️', ipa: '/ˈwebsaɪt/' },
      { id: 'digital',    en: 'Digital',    zh: '数字的',   emoji: '🔢', ipa: '/ˈdɪdʒɪtl/' },
      { id: 'online',     en: 'Online',     zh: '在线的',   emoji: '🟢', ipa: '/ˌɒnˈlaɪn/' },
      { id: 'technology', en: 'Technology', zh: '技术',     emoji: '🤖', ipa: '/tekˈnɒlədʒi/' },
      { id: 'software',   en: 'Software',   zh: '软件',     emoji: '💿', ipa: '/ˈsɒftweə(r)/' }
    ]
  });

  Words.registerCategory({
    level: 11, id: 'nature', name: '自然生态', emoji: '🌳', desc: '地球只有一个',
    words: [
      { id: 'climate',     en: 'Climate',     zh: '气候',       emoji: '🌡️', ipa: '/ˈklaɪmət/' },
      { id: 'wildlife',    en: 'Wildlife',    zh: '野生动物',   emoji: '🦌', ipa: '/ˈwaɪldlaɪf/' },
      { id: 'species',     en: 'Species',     zh: '物种',       emoji: '🧬', ipa: '/ˈspiːʃiːz/' },
      { id: 'habitat',     en: 'Habitat',     zh: '栖息地',     emoji: '🏞️', ipa: '/ˈhæbɪtæt/' },
      { id: 'conserve',    en: 'Conserve',    zh: '保护(资源)', emoji: '♻️', ipa: '/kənˈsɜːv/' },
      { id: 'sustainable', en: 'Sustainable', zh: '可持续的',   emoji: '🌸', ipa: '/səˈsteɪnəbl/' },
      { id: 'atmosphere',  en: 'Atmosphere',  zh: '大气',       emoji: '☁️', ipa: '/ˈætməsfɪə(r)/' },
      { id: 'ocean',       en: 'Ocean',       zh: '海洋',       emoji: '🌊', ipa: '/ˈəʊʃn/' }
    ]
  });

  Words.registerCategory({
    level: 11, id: 'mind', name: '情绪心理', emoji: '🧠', desc: '照顾好心情',
    words: [
      { id: 'emotion',   en: 'Emotion',   zh: '情绪',     emoji: '🎭', ipa: '/ɪˈməʊʃn/' },
      { id: 'stress',    en: 'Stress',    zh: '压力',     emoji: '😰', ipa: '/stres/' },
      { id: 'confident', en: 'Confident', zh: '自信的',   emoji: '😎', ipa: '/ˈkɒnfɪdənt/' },
      { id: 'relax',     en: 'Relax',     zh: '放松',     emoji: '😌', ipa: '/rɪˈlæks/' },
      { id: 'patient',   en: 'Patient',   zh: '有耐心的', emoji: '🕰️', ipa: '/ˈpeɪʃnt/' },
      { id: 'support',   en: 'Support',   zh: '支持',     emoji: '🤗', ipa: '/səˈpɔːt/' },
      { id: 'trust',     en: 'Trust',     zh: '信任',     emoji: '🤝', ipa: '/trʌst/' },
      { id: 'motivate',  en: 'Motivate',  zh: '激励',     emoji: '🚀', ipa: '/ˈməʊtɪveɪt/' }
    ]
  });

  Words.registerCategory({
    level: 11, id: 'society', name: '社会服务', emoji: '🫶', desc: '公益从我做起',
    words: [
      { id: 'volunteer',      en: 'Volunteer',      zh: '志愿者',   emoji: '🫶', ipa: '/ˌvɒlənˈtɪə(r)/' },
      { id: 'charity',        en: 'Charity',        zh: '慈善',     emoji: '💝', ipa: '/ˈtʃærəti/' },
      { id: 'donate',         en: 'Donate',         zh: '捐赠',     emoji: '🎗️', ipa: '/dəʊˈneɪt/' },
      { id: 'community',      en: 'Community',      zh: '社区',     emoji: '🏘️', ipa: '/kəˈmjuːnəti/' },
      { id: 'service',        en: 'Service',        zh: '服务',     emoji: '🛎️', ipa: '/ˈsɜːvɪs/' },
      { id: 'welfare',        en: 'Welfare',        zh: '福利',     emoji: '🤲', ipa: '/ˈwelfeə(r)/' },
      { id: 'campaign',       en: 'Campaign',       zh: '公益活动', emoji: '📢', ipa: '/kæmˈpeɪn/' },
      { id: 'responsibility', en: 'Responsibility', zh: '责任',     emoji: '🧑‍🤝‍🧑', ipa: '/rɪˌspɒnsəˈbɪləti/' }
    ]
  });

  /* ======================= 十二级 · 高三（高考冲刺） ======================= */

  Words.registerCategory({
    level: 12, id: 'news', name: '时事社会', emoji: '📡', desc: '读懂世界新闻',
    words: [
      { id: 'media',     en: 'Media',     zh: '媒体',   emoji: '📡', ipa: '/ˈmiːdiə/' },
      { id: 'event',     en: 'Event',     zh: '事件',   emoji: '🎬', ipa: '/ɪˈvent/' },
      { id: 'interview', en: 'Interview', zh: '采访',   emoji: '🎙️', ipa: '/ˈɪntəvjuː/' },
      { id: 'report',    en: 'Report',    zh: '报道',   emoji: '🗞️', ipa: '/rɪˈpɔːt/' },
      { id: 'economy',   en: 'Economy',   zh: '经济',   emoji: '💹', ipa: '/ɪˈkɒnəmi/' },
      { id: 'public',    en: 'Public',    zh: '公众的', emoji: '👥', ipa: '/ˈpʌblɪk/' },
      { id: 'influence', en: 'Influence', zh: '影响',   emoji: '🌀', ipa: '/ˈɪnfluəns/' },
      { id: 'debate',    en: 'Debate',    zh: '辩论',   emoji: '🎤', ipa: '/dɪˈbeɪt/' }
    ]
  });

  Words.registerCategory({
    level: 12, id: 'college', name: '大学之路', emoji: '🎓', desc: '门口那所好大学',
    words: [
      { id: 'college',     en: 'College',     zh: '大学',     emoji: '🎓', ipa: '/ˈkɒlɪdʒ/' },
      { id: 'major',       en: 'Major',       zh: '专业',     emoji: '📖', ipa: '/ˈmeɪdʒə(r)/' },
      { id: 'degree',      en: 'Degree',      zh: '学位',     emoji: '🎖️', ipa: '/dɪˈɡriː/' },
      { id: 'application', en: 'Application', zh: '申请',     emoji: '📋', ipa: '/ˌæplɪˈkeɪʃn/' },
      { id: 'scholarship', en: 'Scholarship', zh: '奖学金',   emoji: '🏅', ipa: '/ˈskɒləʃɪp/' },
      { id: 'laboratory',  en: 'Laboratory',  zh: '实验室',   emoji: '🧪', ipa: '/ləˈbɒrətri/' },
      { id: 'experiment',  en: 'Experiment',  zh: '实验',     emoji: '⚗️', ipa: '/ɪkˈsperɪmənt/' },
      { id: 'graduation',  en: 'Graduation',  zh: '毕业',     emoji: '🎊', ipa: '/ˌɡrædʒuˈeɪʃn/' }
    ]
  });

  Words.registerCategory({
    level: 12, id: 'planning', name: '人生规划', emoji: '🧭', desc: '把未来握在手上',
    words: [
      { id: 'ambition',    en: 'Ambition',    zh: '抱负',     emoji: '🔥', ipa: '/æmˈbɪʃn/' },
      { id: 'career',      en: 'Career',      zh: '职业生涯', emoji: '🛤️', ipa: '/kəˈrɪə(r)/' },
      { id: 'goal',        en: 'Goal',        zh: '目标',     emoji: '🎯', ipa: '/ɡəʊl/' },
      { id: 'effort',      en: 'Effort',      zh: '努力',     emoji: '💪', ipa: '/ˈefət/' },
      { id: 'achievement', en: 'Achievement', zh: '成就',     emoji: '🌟', ipa: '/əˈtʃiːvmənt/' },
      { id: 'experience',  en: 'Experience',  zh: '经历',     emoji: '🎒', ipa: '/ɪkˈspɪəriəns/' },
      { id: 'challenge',   en: 'Challenge',   zh: '挑战',     emoji: '⚔️', ipa: '/ˈtʃælɪndʒ/' },
      { id: 'opportunity', en: 'Opportunity', zh: '机会',     emoji: '🚪', ipa: '/ˌɒpəˈtjuːnəti/' }
    ]
  });

  Words.registerCategory({
    level: 12, id: 'mindset', name: '应考心态', emoji: '🧘', desc: '平常心 发挥好',
    words: [
      { id: 'strategy',     en: 'Strategy',     zh: '策略',     emoji: '♟️', ipa: '/ˈstrætədʒi/' },
      { id: 'focus',        en: 'Focus',        zh: '专注',     emoji: '🎯', ipa: '/ˈfəʊkəs/' },
      { id: 'confidence',   en: 'Confidence',   zh: '信心',     emoji: '💗', ipa: '/ˈkɒnfɪdəns/' },
      { id: 'discipline',   en: 'Discipline',   zh: '自律',     emoji: '⏳', ipa: '/ˈdɪsəplɪn/' },
      { id: 'balance',      en: 'Balance',      zh: '平衡',     emoji: '⚖️', ipa: '/ˈbæləns/' },
      { id: 'perseverance', en: 'Perseverance', zh: '坚持不懈', emoji: '🧗', ipa: '/ˌpɜːsəˈvɪərəns/' },
      { id: 'optimism',     en: 'Optimism',     zh: '乐观',     emoji: '🌈', ipa: '/ˈɒptɪmɪzəm/' },
      { id: 'preparation',  en: 'Preparation',  zh: '准备',     emoji: '🧰', ipa: '/ˌprepəˈreɪʃn/' }
    ]
  });
})((window.App.Data = window.App.Data || {}).Words ||= {});
