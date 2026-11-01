/* Surge Day Counter v1.5 — offline generic panel script.
 * Module parameters arrive as $argument: YYYY-MM-DD|title. UTC+08:00.
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
    if (typeof $argument === 'undefined' || !String($argument).trim()) {
      throw new Error('未收到模块参数，请更新模块、保存参数后重新载入配置');
    }
    if (String($argument).trim()) {
      var argument = String($argument);
      var separator = argument.indexOf('|');
      if (separator < 0) throw new Error('模块参数格式错误，请更新模块与脚本');
      s.date = argument.slice(0, separator).trim();
      s.title = argument.slice(separator + 1).trim();
      if (!s.title) throw new Error('题目不能为空');
      if (/\{\{\{/.test(s.date + s.title)) throw new Error('模块参数未替换，请检查客户端参数表支持');
    }
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
      title: message,
      content: s.title
    };
  } catch (error) {
    result = {title: 'Day Counter · 配置错误', content: String(error.message || error), style: 'error'};
  }
  $done(result);
}());
