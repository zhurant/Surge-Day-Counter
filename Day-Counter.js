/* Surge Day Counter v1.3 — offline generic panel script.
 * Edit SETTINGS below. Dates use YYYY-MM-DD; timezone is fixed UTC+08:00.
 * countup includes the start day. countdown is calendar days until target.
 */
(function () {
  'use strict';
  var SETTINGS = {
    title: '每一天都算数',
    mode: 'countup', // countup | countdown
    date: '2026-07-24',
    utcOffsetMinutes: 480
  };
  var DAY = 86400000;
  function dateDay(text) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!m || +m[1] < 100) throw new Error('日期须为 YYYY-MM-DD，年份至少为0100');
    var t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    var d = new Date(t);
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) {
      throw new Error('日期不存在：' + text);
    }
    return t / DAY;
  }
  var result;
  try {
    var s = SETTINGS;
    if (s.mode !== 'countup' && s.mode !== 'countdown') throw new Error('mode 须为 countup 或 countdown');
    if (typeof s.utcOffsetMinutes !== 'number' || !isFinite(s.utcOffsetMinutes) || Math.abs(s.utcOffsetMinutes) > 840) {
      throw new Error('utcOffsetMinutes 无效');
    }
    var today = Math.floor((Date.now() + s.utcOffsetMinutes * 60000) / DAY);
    var target = dateDay(s.date);
    var delta = today - target;
    var message;
    if (s.mode === 'countup') {
      message = delta < 0 ? '尚未开始 · 还有 ' + (-delta) + ' 天' : '第 ' + (delta + 1) + ' 天';
    } else {
      message = delta < 0 ? '还有 ' + (-delta) + ' 天' : delta === 0 ? '就是今天 · 0 天' : '已过去 ' + delta + ' 天';
    }
    // Text-only panel: topic above, day count below. No dates or status icon.
    result = {
      title: s.title,
      content: message
    };
  } catch (error) {
    result = {title: 'Day Counter · 配置错误', content: String(error.message || error), style: 'error'};
  }
  $done(result);
}());
