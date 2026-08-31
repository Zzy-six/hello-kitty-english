/* ============================================================================
 * data/words-data.js — 内置英语单词库（初中→高中 6 级进阶，24 类 192 词）
 * ----------------------------------------------------------------------------
 * ★ ZyCode 迭代入口：新增/修改单词只需要在这里「注册」即可。
 *   单词闯关、消消乐、进度中心会自动兼容，无需改动任何页面代码。
 *
 * 学习定位：零基础从「七年级」起步，按等级一步一步进阶到「高三」，
 * 词表参考人教版《Go for it!》/《必修·选择性必修》高频核心词。
 *
 * 使用层级：
 *   Words.levels[c]          → 全部等级（七年级…高三，按 id 升序）
 *   Words.byLevel(levelId)   → 某等级的类别数组
 *   Words.categories()       → 全部类别（界面显示顺序）
 *   Words.list('all')        → 全部单词；Words.list(catId) → 某类别单词
 *   Words.listByLevel(id)    → 某等级全部单词
 *
 * 注册方式：
 *   Words.registerCategory({
 *     level: 1,               // 所属等级（1=七年级 … 6=高三）
 *     id: 'school',           // 唯一类别id（英文）
 *     name: '校园学习',        // 中文名称（界面显示）
 *     emoji: '🏫',           // 类别图标
 *     desc: '开学第一课',      // 一句话介绍
 *     words: [ { id, en, zh, emoji, ipa } ]  // id 全库唯一；en 大写开头
 *   });
 * ============================================================================ */
(function (Words) {
  'use strict';

  /* ---------------- 等级定义（循序渐进的一级台阶） ---------------- */

  Words.levels = [
    { id: 1, name: '七年级', emoji: '🌱', tag: '初中入门', desc: '校门口第一课 · 教室、家庭、三餐' },
    { id: 2, name: '八年级', emoji: '🌸', tag: '日常进阶', desc: '会说了就多说 · 运动、出行、旅行' },
    { id: 3, name: '九年级', emoji: '🍀', tag: '中考冲刺', desc: '规则、备考、环保、职业愿望' },
    { id: 4, name: '高一',   emoji: '🌿', tag: '高中衔接', desc: '新校园 · 兴趣、健康、读写' },
    { id: 5, name: '高二',   emoji: '🌻', tag: '深化提升', desc: '网络、自然、心理、社会' },
    { id: 6, name: '高三',   emoji: '🎓', tag: '高考冲刺', desc: '时事、大学、规划、应考心态' }
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

  /* ======================= 一级 · 七年级（入门） ======================= */

  Words.registerCategory({
    level: 1, id: 'school', name: '校园学习', emoji: '🏫', desc: '开学第一课',
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
    level: 1, id: 'family', name: '温馨家庭', emoji: '🏠', desc: '爸爸 妈妈 和我',
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
    level: 1, id: 'timeclass', name: '时间课程', emoji: '⏰', desc: '几点上课？',
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
    level: 1, id: 'food', name: '一日三餐', emoji: '🍚', desc: '吃好才有劲儿',
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

  /* ======================= 二级 · 八年级（进阶） ======================= */

  Words.registerCategory({
    level: 2, id: 'sports', name: '运动健身', emoji: '🏀', desc: '课间十分钟也要动',
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
    level: 2, id: 'transport', name: '出行交通', emoji: '🚌', desc: '怎么去学校？',
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
    level: 2, id: 'seasons', name: '天气季节', emoji: '🌦️', desc: '一年四季分得清',
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
    level: 2, id: 'travel', name: '旅游名胜', emoji: '🧳', desc: '世界那么大去走走',
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

  /* ======================= 三级 · 九年级（中考冲刺） ======================= */

  Words.registerCategory({
    level: 3, id: 'rules', name: '校园规则', emoji: '📋', desc: '图书馆礼仪与校规',
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
    level: 3, id: 'exam', name: '学习备考', emoji: '📝', desc: '错题都变对',
    words: [
      { id: 'exam',        en: 'Exam',        zh: '考试',   emoji: '📝', ipa: '/ɪɡˈzæm/' },
      { id: 'review',      en: 'Review',      zh: '复习',   emoji: '🔁', ipa: '/rɪˈvjuː/' },
      { id: 'mistake',     en: 'Mistake',     zh: '错误',   emoji: '❌', ipa: '/mɪˈsteɪk/' },
      { id: 'progress',    en: 'Progress',    zh: '进步',   emoji: '📈', ipa: '/ˈprəʊɡres/' },
      { id: 'improve',     en: 'Improve',     zh: '提高',   emoji: '⬆️', ipa: '/ɪmˈpruːv/' },
      { id: 'remember',    en: 'Remember',    zh: '记住',   emoji: '🧠', ipa: '/rɪˈmembə(r)/' },
      { id: 'understand',  en: 'Understand',  zh: '理解',   emoji: '💡', ipa: '/ˌʌndəˈstænd/' },
      { id: 'success',     en: 'Success',     zh: '成功',   emoji: '🏆', ipa: '/səkˈses/' }
    ]
  });

  Words.registerCategory({
    level: 3, id: 'eco', name: '环境保护', emoji: '🌏', desc: '绿色行动从我做起',
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
    level: 3, id: 'jobs', name: '职业梦想', emoji: '🚀', desc: '长大后想做什么',
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

  /* ======================= 四级 · 高一（高中衔接） ======================= */

  Words.registerCategory({
    level: 4, id: 'campus', name: '高中校园', emoji: '🏫', desc: '新环境 新起点',
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
    level: 4, id: 'hobbies', name: '兴趣培养', emoji: '🎸', desc: '把喜欢的事做长久',
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
    level: 4, id: 'fitness', name: '健康生活', emoji: '💪', desc: '身体是学习的本钱',
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
    level: 4, id: 'reading', name: '阅读写作', emoji: '📰', desc: '会读才会写',
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

  /* ======================= 五级 · 高二（深化提升） ======================= */

  Words.registerCategory({
    level: 5, id: 'cyber', name: '网络科技', emoji: '💻', desc: '数字世界好公民',
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
    level: 5, id: 'nature', name: '自然生态', emoji: '🌳', desc: '地球只有一个',
    words: [
      { id: 'climate',    en: 'Climate',    zh: '气候',       emoji: '🌡️', ipa: '/ˈklaɪmət/' },
      { id: 'wildlife',   en: 'Wildlife',   zh: '野生动物',   emoji: '🦌', ipa: '/ˈwaɪldlaɪf/' },
      { id: 'species',    en: 'Species',    zh: '物种',       emoji: '🧬', ipa: '/ˈspiːʃiːz/' },
      { id: 'habitat',    en: 'Habitat',    zh: '栖息地',     emoji: '🏞️', ipa: '/ˈhæbɪtæt/' },
      { id: 'conserve',   en: 'Conserve',   zh: '保护(资源)', emoji: '♻️', ipa: '/kənˈsɜːv/' },
      { id: 'sustainable',en: 'Sustainable',zh: '可持续的',   emoji: '🌸', ipa: '/səˈsteɪnəbl/' },
      { id: 'atmosphere', en: 'Atmosphere', zh: '大气',       emoji: '☁️', ipa: '/ˈætməsfɪə(r)/' },
      { id: 'ocean',      en: 'Ocean',      zh: '海洋',       emoji: '🌊', ipa: '/ˈəʊʃn/' }
    ]
  });

  Words.registerCategory({
    level: 5, id: 'mind', name: '情绪心理', emoji: '🧠', desc: '照顾好心情',
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
    level: 5, id: 'society', name: '社会服务', emoji: '🫶', desc: '公益从我做起',
    words: [
      { id: 'volunteer',     en: 'Volunteer',     zh: '志愿者',     emoji: '🫶', ipa: '/ˌvɒlənˈtɪə(r)/' },
      { id: 'charity',       en: 'Charity',       zh: '慈善',       emoji: '💝', ipa: '/ˈtʃærəti/' },
      { id: 'donate',        en: 'Donate',        zh: '捐赠',       emoji: '🎗️', ipa: '/dəʊˈneɪt/' },
      { id: 'community',     en: 'Community',     zh: '社区',       emoji: '🏘️', ipa: '/kəˈmjuːnəti/' },
      { id: 'service',       en: 'Service',       zh: '服务',       emoji: '🛎️', ipa: '/ˈsɜːvɪs/' },
      { id: 'welfare',       en: 'Welfare',       zh: '福利',       emoji: '🤲', ipa: '/ˈwelfeə(r)/' },
      { id: 'campaign',      en: 'Campaign',      zh: '公益活动',   emoji: '📢', ipa: '/kæmˈpeɪn/' },
      { id: 'responsibility',en: 'Responsibility',zh: '责任',       emoji: '🧑‍🤝‍🧑', ipa: '/rɪˌspɒnsəˈbɪləti/' }
    ]
  });

  /* ======================= 六级 · 高三（高考冲刺） ======================= */

  Words.registerCategory({
    level: 6, id: 'news', name: '时事社会', emoji: '📡', desc: '读懂世界新闻',
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
    level: 6, id: 'college', name: '大学之路', emoji: '🎓', desc: '门口那所好大学',
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
    level: 6, id: 'planning', name: '人生规划', emoji: '🧭', desc: '把未来握在手上',
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
    level: 6, id: 'mindset', name: '应考心态', emoji: '🧘', desc: '平常心 发挥好',
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
