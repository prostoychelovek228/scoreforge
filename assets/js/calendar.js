// Calendar page: reads data/calendar.csv. Upcoming dates first, past ones tucked away.
(function () {
  const upcomingEl = document.getElementById('cal-upcoming');
  const openEl = document.getElementById('cal-open');
  const pastEl = document.getElementById('cal-past');
  const pastWrap = document.getElementById('cal-past-wrap');

  const MONTHS = SF.MONTHS;

  function parse(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  function range(start, end) {
    if (!end) return start.getDate() + ' ' + MONTHS[start.getMonth()] + ' ' + start.getFullYear();
    if (start.getMonth() === end.getMonth()) {
      return start.getDate() + '–' + end.getDate() + ' ' + MONTHS[end.getMonth()] + ' ' + end.getFullYear();
    }
    return start.getDate() + ' ' + MONTHS[start.getMonth()] + ' – ' + end.getDate() + ' ' + MONTHS[end.getMonth()] + ' ' + end.getFullYear();
  }

  function plural(n, one, few, many) {
    const a = Math.abs(n) % 100;
    const b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b === 1) return one;
    if (b >= 2 && b <= 4) return few;
    return many;
  }

  function countdown(start, today) {
    const days = Math.round((start - today) / 86400000);
    if (days === 0) return 'сегодня';
    if (days === 1) return 'завтра';
    return 'через ' + days + ' ' + plural(days, 'день', 'дня', 'дней');
  }

  function ticket(row, today) {
    const start = parse(row['начало']);
    const end = parse(row['конец']);
    const unconfirmed = row['статус'] === 'не подтверждено';
    const checked = row['проверено'];

    const when = SF.el('div', 'ticket-when',
      SF.el('p', 'ticket-date', start ? range(start, end) : row['событие']),
      start && start >= today ? SF.el('p', 'lbl ticket-count', countdown(start, today)) : null);

    const what = SF.el('div', 'ticket-what',
      SF.el('p', 'lbl ticket-exam', row['экзамен']),
      start ? SF.el('p', 'ticket-event', row['событие']) : null,
      SF.el('p', 'ticket-note', row['заметка']),
      SF.externalLink(row['ссылка'], 'ticket-link', 'Открыть источник'));

    const marks = SF.el('div', 'ticket-marks',
      unconfirmed ? SF.el('span', 'stamp lbl stamp-no', 'Не подтверждено') : null,
      SF.el('span', 'lbl ticket-checked', checked ? 'Проверено: ' + SF.formatDate(checked) : 'Пока не проверено'));

    return SF.el('article', 'ticket' + (unconfirmed ? ' ticket-unconfirmed' : ''), when, what, marks);
  }

  SF.loadCSV('data/calendar.csv')
    .then((rows) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dated = rows.filter((r) => parse(r['начало']))
        .sort((a, b) => parse(a['начало']) - parse(b['начало']));
      const isPast = (r) => (parse(r['конец']) || parse(r['начало'])) < today;

      upcomingEl.replaceChildren(...dated.filter((r) => !isPast(r)).map((r) => ticket(r, today)));
      openEl.replaceChildren(...rows.filter((r) => !parse(r['начало'])).map((r) => ticket(r, today)));

      const past = dated.filter(isPast).reverse();
      pastWrap.hidden = !past.length;
      pastEl.replaceChildren(...past.map((r) => ticket(r, today)));
    })
    .catch(() => SF.loadError(upcomingEl, 'календарь'));
})();
