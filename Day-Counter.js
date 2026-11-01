/**
 * Surge Day Counter v1.7 — based on the supplied v1.0.0.
 * v1.0 event keys: un1/ud1 ... un3/ud3; dn1/dd1 ... dn3/dd3.
 * Count-up includes the start day. Calendar boundary: fixed UTC+08:00.
 * Default companion module creates only the count-up panel.
 */
(function () {
  'use strict';

  var MS_PER_DAY = 86400000;

  function argumentsToObject(raw) {
    var map = Object.create(null);
    String(raw || '').split('&').forEach(function (part) {
      var index = part.indexOf('=');
      if (index > 0) {
        var key = part.slice(0, index).trim().toLowerCase();
        map[key] = part.slice(index + 1).trim();
      }
    });
    return map;
  }

  // Strict ISO date check. Date.UTC is used ONLY after extracting the local
  // calendar date; this avoids daylight-saving-time off-by-one errors.
  function calendarDay(dateString) {
    var match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(dateString);
    if (!match) return null;
    var year = Number(match[1]);
    var month = Number(match[2]);
    var day = Number(match[3]);
    if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    var epoch = Date.UTC(year, month - 1, day);
    var check = new Date(epoch);
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
      return null;
    }
    return Math.round(epoch / MS_PER_DAY);
  }

  function getEvents(cfg, mode) {
    var prefix = mode === 'up' ? 'u' : 'd';
    var results = [];
    for (var i = 1; i <= 3; i++) {
      var title = (cfg[prefix + 'n' + i] || '').trim();
      var dateString = (cfg[prefix + 'd' + i] || '').trim();
      if (!dateString || dateString === '-' || dateString.toLowerCase() === 'off') continue;
      var numericDay = calendarDay(dateString);
      results.push({
        name: title || (mode === 'up' ? '起始日' : '目标日') + i,
        date: dateString,
        day: numericDay
      });
    }
    return results;
  }

  function dayLabel(event, mode, todayDay) {
    if (event.day === null) return '请检查日期';
    var difference = event.day - todayDay;
    if (mode === 'down') {
      if (difference > 0) return '还剩 ' + difference + ' 天';
      return difference === 0 ? '就是今天' : '已过去 ' + (-difference) + ' 天';
    }
    return difference <= 0 ? '第 ' + (1 - difference) + ' 天' : '还有 ' + difference + ' 天开始';
  }

  function formatLine(event, mode, todayDay) {
    return event.name + ' · ' + dayLabel(event, mode, todayDay);
  }

  function run() {
    var rawArgument = typeof $argument === 'string' ? $argument : '';
    var cfg = argumentsToObject(rawArgument);
    var panelName = (typeof $input !== 'undefined' && $input && $input.panelName) || '';
    if (!rawArgument.trim()) throw new Error('未收到事件参数，请更新配套模块并重新载入配置');
    if (/\{\{\{/.test(rawArgument)) throw new Error('模块参数未替换，请检查参数保存和客户端版本');
    var mode = cfg.mode || (panelName === 'DayCounter-Countdown' ? 'down' : 'up');
    if (mode !== 'up' && mode !== 'down') throw new Error('mode 须为 up 或 down');
    var todayDay = Math.floor((Date.now() + 480 * 60000) / MS_PER_DAY);
    console.log('[DayCounter v1.7] mode=' + mode + ', panel=' + panelName);
    // Log only dates, not user event names, to verify the effective arguments.
    console.log('[DayCounter v1.7] dates=' + [cfg.ud1 || '-', cfg.ud2 || '-', cfg.ud3 || '-'].join(','));
    var events = getEvents(cfg, mode);
    var lines = events.map(function (event) { return formatLine(event, mode, todayDay); });

    var title = mode === 'up' ? '相伴的日子' : '期待的日子';
    var content = lines.join('\n');
    var hasError = events.some(function (event) { return event.day === null; });
    if (events.length === 1 && !hasError) {
      title = dayLabel(events[0], mode, todayDay);
      content = events[0].name;
    } else if (events.length === 0) {
      content = '添加一个值得记住的日子';
    }
    $done({
      title: title,
      content: content,
      icon: hasError ? 'exclamationmark.triangle' : 'heart.fill',
      'icon-color': hasError ? '#D06537' : '#D68C95'
    });
  }

  try {
    run();
  } catch (error) {
    $done({
      title: '日期计时器 · 运行错误',
      content: String(error && error.message ? error.message : error),
      icon: 'exclamationmark.triangle',
      'icon-color': '#D06537'
    });
  }
})();
