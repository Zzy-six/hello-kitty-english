/* ============================================================================
 * core/audio.js — 英语发音（TTS）+ 趣味音效（WebAudio 合成）
 * ----------------------------------------------------------------------------
 * 1) speak(text)：使用浏览器内置 SpeechSynthesis 引擎朗读英文。
 *    · 完全免费、无需任何 API 密钥、Electron/Chrome/Edge 下离线可用
 *      （Windows 自带 Microsoft 本地语音，断网也能发音）。
 *    · 自动挑选英文语音，找不到时仍用默认语音 + en-US 标记尝试。
 * 2) chime(name)：用 WebAudio 振荡器现场合成音效（答对/答错/点击/通关），
 *    无需任何音频文件，天然离线。
 * ============================================================================ */
(function (Audio) {
  'use strict';

  var synth = window.speechSynthesis || null;
  var enVoice = null;
  var audioCtx = null;   // 惰性创建，首次用户手势后解锁
  var speaking = false;

  /* ---------- 语音选择 ---------- */

  function pickVoice() {
    if (!synth) return;
    var voices = synth.getVoices() || [];
    if (!voices.length) return; // 异步加载中，等 voiceschanged 再试
    // 优先级：本地英文语音 > Google英文 > 任意英文 > 默认
    enVoice =
      voices.find(function (v) { return /^en[-_]/i.test(v.lang) && v.localService; }) ||
      voices.find(function (v) { return /english/i.test(v.name); }) ||
      voices.find(function (v) { return /^en[-_]/i.test(v.lang); }) ||
      null;
  }
  if (synth) {
    pickVoice();
    synth.onvoiceschanged = pickVoice;
  }

  /**
   * 朗读英文单词/句子
   * @param {string} text   要朗读的英文
   * @param {object} [opts] { rate: 语速(默认0.85适合零基础), pitch: 音调 }
   */
  Audio.speak = function (text, opts) {
    opts = opts || {};
    if (!synth || !text) return;
    try {
      synth.cancel(); // 打断上一次，避免排队延迟
      var u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'en-US';
      u.rate = opts.rate || 0.85;   // 放慢语速，零基础友好
      u.pitch = opts.pitch || 1.15; // 稍高音调更童趣
      if (enVoice) u.voice = enVoice;
      u.onstart = function () { speaking = true; };
      u.onend = u.onerror = function () { speaking = false; };
      synth.speak(u);
    } catch (e) { /* 发音失败不影响学习流程 */ }
  };

  /** 是否正在朗读 */
  Audio.isSpeaking = function () { return speaking; };
  /** 停止朗读 */
  Audio.stop = function () { if (synth) { try { synth.cancel(); } catch (e) {} } speaking = false; };

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
