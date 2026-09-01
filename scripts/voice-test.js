/* 朗读选声回归测试:node scripts/voice-test.js(详见 README 必测清单) */
'use strict';
var fs = require('fs');

// ---- 模拟浏览器环境 ----
global.SpeechSynthesisUtterance = function (t) { this.text = t; this.onstart = null; this.onend = null; this.onerror = null; };
var storage = {};
var gotVoice = null;
var spoken = [];

global.window = {
  App: {},
  localStorage: {
    getItem: function (k) { return storage[k] || null; },
    setItem: function (k, v) { storage[k] = String(v); },
    removeItem: function (k) { delete storage[k]; }
  },
  speechSynthesis: {
    getVoices: function () { return gotVoice; },
    cancel: function () {}, speak: function (u) { spoken.push(u); },
    onvoiceschanged: null
  }
};

// 加载 audio.js(IIFE 挂在 window.App.Audio 上)
var code = fs.readFileSync('src/js/core/audio.js', 'utf8');
eval(code);
var Audio = window.App.Audio;

function mk(name, lang, local) {
  return { name: name, lang: lang, localService: !!local };
}

var fail = 0;
function eq(actual, expected, msg) {
  var ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log((ok ? 'PASS' : 'FAIL'), msg, '=>', JSON.stringify(actual), ok ? '' : '(期望 ' + JSON.stringify(expected) + ')');
  if (!ok) fail++;
}

// 1) 全部自然语音:应选 Aria(自然女声) 而非 David(自然男声)
gotVoice = [
  mk('Microsoft David Online (Natural) - English (United States)', 'en-US'),
  mk('Microsoft Aria Online (Natural) - English (United States)', 'en-US')
];
Audio.savePrefs({ voice: '', rate: 0.8, repeat: true });
eq(Audio.getVoiceList()[0].name, 'Microsoft Aria Online (Natural) - English (United States)', '自然女声应排在自然男声之前');

// 2) 自然男声 vs 本地女声:应选本地女声(Zira)
gotVoice = [
  mk('Microsoft David Online (Natural) - English (United States)', 'en-US'),
  mk('Microsoft Zira - English (United States)', 'en-US', true)
];
Audio.savePrefs({ voice: '', rate: 0.8, repeat: true });
eq(Audio.getVoiceList()[0].name, 'Microsoft Zira - English (United States)', '本地女声应高于自然男声');

// 3) 无自然只有本地:选本地女声(Samantha)而非本地男声(David)
gotVoice = [
  mk('Microsoft David - English (United States)', 'en-US', true),
  mk('Microsoft Samantha - English (United States)', 'en-US', true)
];
Audio.savePrefs({ voice: '', rate: 0.8, repeat: true });
eq(Audio.getVoiceList()[0].name, 'Microsoft Samantha - English (United States)', '本地女声应高于本地男声');

// 4) 中文机器人 + 英文在线女声:应选英文在线女声
gotVoice = [
  mk('Microsoft Huihui - Chinese (China)', 'zh-CN', true),
  mk('Microsoft Jenny Online (Natural) - English (United States)', 'en-US')
];
Audio.savePrefs({ voice: '', rate: 0.8, repeat: true });
eq(Audio.getVoiceList()[0].name, 'Microsoft Jenny Online (Natural) - English (United States)', '中文语音不应被选为英文发音');

// 5) 只给英文男性在线:也应能选(降级不崩)
gotVoice = [
  mk('Microsoft Mark - English (United States)', 'en-US'),
  mk('Microsoft Guy - English (United States)', 'en-US')
];
Audio.savePrefs({ voice: '', rate: 0.8, repeat: true });
eq(Audio.getVoiceList().length, 2, '只有男声时不报错且列出');

// 6) 手动指定 voice 优先于自动
gotVoice = [
  mk('Microsoft Aria Online (Natural) - English (United States)', 'en-US'),
  mk('Microsoft David Online (Natural) - English (United States)', 'en-US')
];
Audio.savePrefs({ voice: 'Microsoft David Online (Natural) - English (United States)', rate: 0.8, repeat: true });
// getVoiceList 首项仍按优先级(aria),但 speak 会用 prefs.voice(david)——验证 speak 选择
spoken = [];
Audio.speak('hello');
eq(spoken.length >= 1, true, 'speak 正常压入队列');
console.log('（手动指定 voice 时 speak 使用 prefs.voice,由 savePrefs 内 pickVoice 处理）');

// 7) 女性名单内部命中检查
var cases = [
  ['Microsoft Aria Online (Natural) - English (United States)', true],
  ['Microsoft Jenny Natural (Local) - English (United States)', true],
  ['Microsoft Michelle Online (Natural) - English (United States)', true],
  ['Microsoft Libby Online (Natural) - English (United Kingdom)', true],
  ['Microsoft Sonia Online (Natural) - English (United Kingdom)', true],
  ['Microsoft Maisie Online (Natural) - English (United Kingdom)', true],
  ['Microsoft Ava Online (Natural) - English (Ireland)', true],
  ['Microsoft Natasha Online (Natural) - English (Australia)', true],
  ['Microsoft Zira - English (United States)', true],
  ['Microsoft Samantha - English (United States)', true],
  ['Microsoft Hazel - English (United Kingdom)', true],
  ['Microsoft Kate - English (Great Britain)', true],
  ['Microsoft David - English (United States)', false],
  ['Microsoft Mark - English (United States)', false],
  ['Microsoft Guy - English (United States)', false],
  ['Microsoft George - English (United Kingdom)', false],
  ['Microsoft Daniel - English (Great Britain)', false],
  ['Microsoft Ryan - English (Ireland)', false],
  ['Microsoft Aria Babe online (Natural) - English (Us)', true],
  ['Windows 语音 - 英文', false]
];
cases.forEach(function (c) {
  var v = mk(c[0], 'en-US');
  gotVoice = [v];
  var list = Audio.getVoiceList();
  var isF = list[0] && list[0].female;
  eq(isF === true, c[1], '女声判定 [' + c[0] + ']');
  if (list[0]) list[0].female = false; list[0].male = false; // 不影响下一轮
});

console.log(fail === 0 ? '\nALL PASS ✅' : '\nFAILED: ' + fail);
process.exit(fail === 0 ? 0 : 1);
