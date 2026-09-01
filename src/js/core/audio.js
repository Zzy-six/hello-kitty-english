/* ============================================================================
 * core/audio.js — 英语发音（TTS）+ 趣味音效（WebAudio 合成）
 * ----------------------------------------------------------------------------
 * 1) speak(text)：使用浏览器 SpeechSynthesis 引擎朗读英文，声音策略：
 *    · 自动挑“最像真人的女声”：自然英文女声（Edge/Chrome 的
 *      Microsoft Aria/Jenny/Michelle Online (Natural) 等）最优先，
 *      其次性别未知的自然语音、本地英文女声、自然男声，
 *      最后才用默认语音——总之女生优先、真人优先、不机械最优先。
 *    · “跟读两遍”：先常速念一遍，再慢速重念一遍，零基础更容易听清；
 *      可通过“学习进度中心 → 朗读设置”关闭。
 *    · 声音/语速/跟读偏好存 localStorage（kitty.audioPrefs）。
 *    · 完全免费：网页版在 Edge/Chrome 上连网自动用「真人女声」自然语音；
 *      Windows 可在“设置→时间和语言→语音”免费安装离线自然语音包（女生）。
 * 2) chime(name)：用 WebAudio 振荡器现场合成音效，无需任何音频文件。
 * ============================================================================ */
(function (Audio) {
  'use strict';

  var synth = window.speechSynthesis || null;
  var enVoice = null;
  var audioCtx = null;   // 惰性创建，首次用户手势后解锁
  var queue = [];        // 待读队列（跟读两遍时压入两段）
  var active = null;     // 当前正在读的 utterance
  var pauseTimer = null; // 两遍之间的停顿计时器
  var speaking = false;  // 是否正在朗读（含队列中未读的）

  /* ---------- 朗读偏好（localStorage 持久化） ---------- */

  var PREFS_KEY = 'kitty.audioPrefs';
  var DEFAULT_PREFS = { voice: '', rate: 0.8, repeat: true };

  function loadPrefs() {
    var p = { voice: '', rate: 0.8, repeat: true };
    try {
      var raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        p.voice = typeof saved.voice === 'string' ? saved.voice : '';
        p.rate = (typeof saved.rate === 'number' && saved.rate >= 0.5 && saved.rate <= 1.2)
          ? saved.rate : 0.8;
        p.repeat = typeof saved.repeat === 'boolean' ? saved.repeat : true;
      }
    } catch (e) { /* 损坏则用默认 */ }
    return p;
  }
  var prefs = loadPrefs();

  /** 保存朗读偏好并立即生效 */
  Audio.savePrefs = function (next) {
    prefs = {
      voice: String(next.voice || ''),
      rate: (Number(next.rate) >= 0.5 && Number(next.rate) <= 1.2) ? Number(next.rate) : 0.8,
      repeat: !!next.repeat
    };
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* 隐私模式忽略 */ }
    pickVoice();
    return prefs;
  };
  /** 当前偏好 */
  Audio.getPrefs = function () { return prefs; };
  /** 用户是否手动保存过偏好 */
  Audio.hasSavedPrefs = function () {
    try { return !!localStorage.getItem(PREFS_KEY); } catch (e) { return false; }
  };

  /* ---------- 语音选择 ---------- */

  /** 自然语音：名字带 Online (Natural)/Neural/Premium，声线最接近真人 */
  function isNaturalVoice(v) {
    return /online\s*\(natural\)|natural|neural|premium/i.test(v.name || '');
  }

  /**
   * 女性英文语音判定（按语音名字典，大小写不敏感）。
   * 覆盖 Edge/Windows 离线自然包（Aria/Jenny/Michelle/Ana/Libby/Sonia/
   * Maisie/Ava/Natasha/Neerja 等）、经典本地声（Zira/Samantha/Karen/Hazel
   * 等）与常见第三方语音（Salli/Joanna/Amy/Emma 等）。
   */
  var FEMALE_RE =
    /(?:\b|^)(aria|jenny|michelle|ana|libby|sonia|maisie|ava|natasha|neerja|zira|samantha|karen|moira|tessa|victoria|susan|catherine|katharine|kate|carol|ellen|salli|joanna|maya|sofia|sophia|amy|emma|olivia|nicole|kendra|ivy|linda|heather|hazel|helen|callie|marissa|alice|clara|hannah|emily|jane|lucy|luna|vicki|tracy|emily|eloquence)(?:\b|$)/i;

  /** 男性英文语音判定：明确是男声的名字（David/Mark/Guy/George 等） */
  var MALE_RE =
    /(?:\b|^)(david|mark|guy|ryan|george|james|ben|jacob|sean|shaun|thomas|harry|daniel|eric|christopher|paul|peter|todd|steve|aaron|andrew|brian|bruce|fred|gary|jason|michael|nick|raymond|roger|richard|joshua|nathan|alex|william|will|connor|liam|oliver|edward|stephen|matthew|joey|justin|kevin|geraint|russell|gregory|cruze|kamil|felix|ramon|prabhat|ravi|heera|frederik)(?:\b|$)/i;

  function isFemaleVoice(v) { return FEMALE_RE.test(v.name || ''); }
  function isMaleVoice(v)   { return MALE_RE.test(v.name || ''); }

  /**
   * 声音质量档位（数字越小越优先）：
   * 0 自然·女声 > 1 自然·性别未知 > 2 本地·女声 > 3 自然·男声
   * > 4 本地·性别未知 > 5 本地·男声 > 6 在线·女声 > 7 在线·其他 > 8 在线·男声
   * > 99 非英文
   */
  function voiceTier(v) {
    if (!/^en-?/i.test(v.lang || '')) return 99;
    var natural = isNaturalVoice(v);
    var female = isFemaleVoice(v);
    var male = isMaleVoice(v);
    if (natural && female) return 0;
    if (natural && !male) return 1;
    if (female && v.localService) return 2;
    if (natural && male) return 3;
    if (!male && v.localService) return 4;
    if (male && v.localService) return 5;
    if (female) return 6;
    if (!male) return 7;
    return 8;
  }

  function pickVoice() {
    if (!synth) return;
    var voices = synth.getVoices() || [];
    if (!voices.length) return; // 异步加载中，等 voiceschanged 再试
    enVoice = null;
    if (prefs.voice) {
      enVoice = voices.find(function (v) { return v.name === prefs.voice; }) || null;
    } else {
      var tier = 99;
      voices.forEach(function (v) {
        var t = voiceTier(v);
        if (t < tier) { tier = t; enVoice = v; }
      });
    }
  }
  if (synth) {
    pickVoice();
    synth.onvoiceschanged = pickVoice;
  }

  /** 全部英文语音列表（供“朗读设置”面板），按自动选择优先级排序 */
  Audio.getVoiceList = function () {
    var voices = synth ? (synth.getVoices() || []) : [];
    var list = voices
      .filter(function (v) { return /^en-?/i.test(v.lang || ''); })
      .map(function (v) {
        return {
          name: v.name,
          lang: v.lang,
          local: !!v.localService,
          natural: isNaturalVoice(v),
          female: isFemaleVoice(v),
          male: isMaleVoice(v)
        };
      })
      .sort(function (a, b) {
        var ta = voiceTier({ name: a.name, lang: a.lang, localService: a.local, female: a.female, male: a.male });
        var tb = voiceTier({ name: b.name, lang: b.lang, localService: b.local, female: b.female, male: b.male });
        return (ta - tb) || a.name.localeCompare(b.name);
      });
    return list;
  };

  /* ---------- 朗读（支持跟读两遍） ---------- */

  function stopAll() {
    if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = null; }
    queue.length = 0;
    active = null;
    if (synth) { try { synth.cancel(); } catch (e) {} }
    speaking = false;
  }

  function mkUtter(text, rate, pitch) {
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'en-US';
    u.rate = rate;
    u.pitch = pitch;
    if (enVoice) u.voice = enVoice;
    return u;
  }

  /** 依次播放队列中的下一段 */
  function speakNext() {
    if (active || !queue.length || !synth) return;
    var u = queue.shift();
    active = u;
    u.onstart = function () { speaking = true; };
    u.onend = u.onerror = function () {
      if (active !== u) return;           // 已被新朗读打断，忽略迟到回调
      active = null;
      if (queue.length) {
        pauseTimer = setTimeout(speakNext, 240); // 两遍之间留点停顿
      } else {
        speaking = false;
      }
    };
    try { synth.speak(u); } catch (e) { active = null; speaking = false; }
  }

  /**
   * 朗读英文单词/句子
   * @param {string} text 要朗读的英文
   * @param {object} [opts] { rate: 临时语速, repeat: 跟读两遍(默认取用户偏好) }
   */
  Audio.speak = function (text, opts) {
    opts = opts || {};
    if (!synth || !text) return;
    stopAll();
    var rate = (typeof opts.rate === 'number' && opts.rate >= 0.5) ? opts.rate : prefs.rate;
    var repeat = (opts.repeat === undefined) ? prefs.repeat : !!opts.repeat;
    queue.push(mkUtter(text, rate, 1.1));
    if (repeat) queue.push(mkUtter(text, Math.max(0.5, rate - 0.25), 1.0));
    speaking = true;
    speakNext();
  };

  /** 是否正在朗读（含队列中未读的） */
  Audio.isSpeaking = function () { return speaking; };
  /** 停止朗读 */
  Audio.stop = stopAll;

  /* ---------- WebAudio 音效合成 ---------- */

  function ctx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  /**
   * 播放一个音符序列
   * @param {number[]} freqs 频率数组，依次播放
   * @param {number} dur 每个音符时长(秒)
   * @param {string} type 波形 sine/triangle
   */
  function playNotes(freqs, dur, type, gainVal) {
    var c = ctx();
    if (!c) return;
    var t = c.currentTime;
    freqs.forEach(function (f, i) {
      var osc = c.createOscillator();
      var g = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = f;
      var start = t + i * dur;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(gainVal || 0.18, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.95);
      osc.connect(g).connect(c.destination);
      osc.start(start);
      osc.stop(start + dur);
    });
  }

  /**
   * 趣味音效（全部本地合成，无音频文件）
   * correct 答对 | wrong 答错 | click 点击 | star 星星 | win 通关 | flip 翻牌
   */
  Audio.chime = function (name) {
    switch (name) {
      case 'correct': playNotes([523.25, 659.25, 783.99, 1046.5], 0.11, 'triangle'); break; // C大调上行琶音
      case 'wrong':   playNotes([329.63, 261.63], 0.16, 'sine', 0.12); break;               // 温柔下行，不吓到孩子
      case 'click':   playNotes([880], 0.05, 'sine', 0.06); break;
      case 'star':    playNotes([1318.5, 1568], 0.09, 'sine', 0.1); break;
      case 'flip':    playNotes([660], 0.05, 'triangle', 0.07); break;
      case 'win':     playNotes([523.25, 587.33, 659.25, 783.99, 1046.5, 1318.5], 0.12, 'triangle'); break;
      default: break;
    }
  };

  /** 首次用户手势解锁音频（浏览器自动播放策略） */
  Audio.unlock = function () {
    ctx();
    if (synth) pickVoice();
  };
})(window.App.Audio = window.App.Audio || {});
