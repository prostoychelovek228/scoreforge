// Catalog page: reads data/resources.csv, builds filters and cards.
(function () {
  const COL = {
    title: 'название', url: 'ссылка', exam: 'экзамен/предмет', inside: 'что внутри',
    lang: 'язык', level: 'уровень', free: 'бесплатно', license: 'лицензия',
    note: 'заметка', checked: 'дата проверки',
  };
  const FREE_LABEL = { 'да': 'Бесплатно', 'частично': 'Частично', 'нет': 'Платно' };
  const GROUPS = [
    { key: 'exam', legend: 'Экзамен', values: (r) => list(r[COL.exam]) },
    { key: 'lang', legend: 'Язык', values: (r) => list(r[COL.lang]) },
    { key: 'free', legend: 'Цена', values: (r) => [r[COL.free]], label: (v) => FREE_LABEL[v] || v },
  ];

  const filtersEl = document.getElementById('filters');
  const cardsEl = document.getElementById('cards');
  const countEl = document.getElementById('count');
  const resetEl = document.getElementById('reset');
  const state = { exam: new Set(), lang: new Set(), free: new Set() };
  let resources = [];
  let brokenByUrl = new Map();

  function list(value) {
    return value.split('/').map((s) => s.trim()).filter(Boolean);
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    GROUPS.forEach((g) => {
      (params.get(g.key) || '').split(',').map((s) => s.trim()).filter(Boolean)
        .forEach((v) => state[g.key].add(v));
    });
  }

  function writeUrl() {
    const params = new URLSearchParams();
    GROUPS.forEach((g) => { if (state[g.key].size) params.set(g.key, [...state[g.key]].join(',')); });
    const query = params.toString();
    history.replaceState(null, '', query ? '?' + query : location.pathname);
  }

  function matches(resource) {
    return GROUPS.every((g) => {
      const picked = state[g.key];
      return !picked.size || g.values(resource).some((v) => picked.has(v));
    });
  }

  function buildFilters() {
    const nodes = GROUPS.map((g) => {
      const seen = [];
      resources.forEach((r) => g.values(r).forEach((v) => { if (v && !seen.includes(v)) seen.push(v); }));
      if (g.key === 'free') seen.sort((a, b) => Object.keys(FREE_LABEL).indexOf(a) - Object.keys(FREE_LABEL).indexOf(b));

      const chips = seen.map((value) => {
        const btn = SF.el('button', 'chip lbl', g.label ? g.label(value) : value);
        btn.type = 'button';
        btn.setAttribute('aria-pressed', state[g.key].has(value));
        btn.addEventListener('click', () => {
          const picked = state[g.key];
          if (picked.has(value)) picked.delete(value); else picked.add(value);
          btn.setAttribute('aria-pressed', picked.has(value));
          render();
        });
        return btn;
      });
      const box = SF.el('fieldset', 'filter', SF.el('legend', 'lbl', g.legend), SF.el('div', 'chips', ...chips));
      return box;
    });
    filtersEl.replaceChildren(...nodes);
  }

  function card(r) {
    const free = r[COL.free];
    const stampClass = { 'да': 'stamp-yes', 'частично': 'stamp-part', 'нет': 'stamp-no' }[free] || 'stamp-part';
    const checked = r[COL.checked];

    const top = SF.el('div', 'card-top',
      SF.el('span', 'lbl', r[COL.exam] + ' / ' + r[COL.level]),
      SF.el('span', 'stamp lbl ' + stampClass, FREE_LABEL[free] || free));

    const title = SF.el('h2', 'card-title', SF.externalLink(r[COL.url], '', r[COL.title]));

    const inside = SF.el('p', 'card-inside', r[COL.inside]);
    const note = r[COL.note]
      ? SF.el('p', 'card-note', SF.el('span', 'lbl card-note-label', 'Заметка'), r[COL.note])
      : null;

    const meta = SF.el('dl', 'card-meta',
      SF.el('div', '', SF.el('dt', 'lbl', 'Язык'), SF.el('dd', '', r[COL.lang])),
      SF.el('div', '', SF.el('dt', 'lbl', 'Лицензия'), SF.el('dd', '', r[COL.license])),
      SF.el('div', '', SF.el('dt', 'lbl', 'Проверено'),
        SF.el('dd', checked ? '' : 'unchecked', checked ? SF.formatDate(checked) : 'пока не проверено')));

    // One failed check may be a hiccup, so the warning appears from the second week on.
    const broken = brokenByUrl.get(r[COL.url]);
    const flag = broken && broken.weeks >= 2
      ? SF.el('p', 'robot-flag', 'Сайт не открывается уже несколько недель подряд, ссылка могла устареть.')
      : null;

    return SF.el('article', 'card', top, title, inside, flag, note, meta);
  }

  // The weekly robot only says whether a link opens; it does not judge what is inside.
  function showRobotStatus(status) {
    (status.broken || []).forEach((b) => brokenByUrl.set(b.url, b));
    if (!status.checked) return;
    const note = document.getElementById('robot-note');
    note.textContent = 'Робот проверил, что ссылки открываются: ' + SF.formatDate(status.checked) +
      '. Содержимое он не читает, поэтому дату на карточках ставит человек.';
    note.hidden = false;
  }

  function render() {
    writeUrl();
    const shown = resources.filter(matches);
    countEl.textContent = 'Показано ' + shown.length + ' из ' + resources.length;
    resetEl.hidden = !GROUPS.some((g) => state[g.key].size);
    if (shown.length) {
      cardsEl.replaceChildren(...shown.map(card));
    } else {
      cardsEl.replaceChildren(SF.el('p', 'empty', 'Такого зверя на полке пока нет. Сними один из фильтров, и станет веселее.'));
    }
  }

  resetEl.addEventListener('click', () => {
    GROUPS.forEach((g) => state[g.key].clear());
    filtersEl.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    render();
  });

  const robotStatus = fetch('data/link-status.json')
    .then((res) => (res.ok ? res.json() : {}))
    .catch(() => ({}));

  Promise.all([SF.loadCSV('data/resources.csv'), robotStatus])
    .then(([rows, status]) => {
      resources = rows;
      showRobotStatus(status);
      readUrl();
      buildFilters();
      render();
    })
    .catch(() => SF.loadError(cardsEl, 'каталог'));
})();
