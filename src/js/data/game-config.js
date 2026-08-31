/* ============================================================================
 * data/game-config.js — 消消乐小游戏关卡配置
 * ----------------------------------------------------------------------------
 * ★ ZyCode 迭代入口：想增加关卡/调难度，在这里改 levels 数组即可，
 *   features/game.js 自动适配（不限制关卡数量）。
 * 字段说明：
 *   pairs   卡片对数（词数加倍即总卡片数）
 *   cols    每行卡片数（手机端可 4 列，桌面可 5 列）
 *   stars   通关奖励星星
 *   source  出题学段：'l1'=七年级词库 'l2'=八/九年级词库 'l3'=高中词库
 *           （不写则从全库随机取词）
 * ============================================================================ */
(function (GameConfig) {
  'use strict';

  GameConfig.levels = [
    { id: 1, name: '七年级起步', desc: '6对单词 · 初中入门', pairs: 6,  cols: 4, stars: 3, source: 'l1' },
    { id: 2, name: '初升高进阶', desc: '8对单词 · 八九年词库', pairs: 8,  cols: 4, stars: 4, source: 'l2' },
    { id: 3, name: '高中冲刺',   desc: '10对单词 · 高中词库', pairs: 10, cols: 5, stars: 6, source: 'l3' }
  ];

  GameConfig.byId = function (id) {
    return GameConfig.levels.find(function (l) { return l.id === Number(id); });
  };
})((window.App.Data = window.App.Data || {}).GameConfig ||= {});
