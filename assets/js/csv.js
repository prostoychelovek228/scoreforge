// Small CSV reader shared by the catalog, calendar and posts pages.
// Accepts comma or semicolon separated files (Russian Excel saves with semicolons).
window.SF = window.SF || {};

SF.parseCSV = function (text) {
  text = text.replace(/^﻿/, '');
  const firstLine = text.slice(0, text.indexOf('\n') + 1 || text.length);
  const sep = firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';

  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === sep) {
      row.push(cell); cell = '';
    } else if (ch === '\n') {
      row.push(cell); rows.push(row); row = []; cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }

  const head = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.some((c) => c.trim() !== ''))
    .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
};

SF.loadCSV = function (path) {
  return fetch(path).then((res) => {
    if (!res.ok) throw new Error(path + ': ' + res.status);
    return res.text();
  }).then(SF.parseCSV);
};

// Tiny DOM helper: el('p', 'class-name', 'text', child, child...)
SF.el = function (tag, cls, ...children) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  children.forEach((c) => { if (c !== null && c !== undefined) node.append(c); });
  return node;
};

// Only plain web links may become clickable.
SF.safeUrl = function (url) {
  return /^https?:\/\//i.test(url) ? url : '';
};

SF.externalLink = function (url, cls, ...children) {
  const safe = SF.safeUrl(url);
  if (!safe) return SF.el('span', cls, ...children);
  const a = SF.el('a', cls, ...children);
  a.href = safe;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
};

SF.MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

// Today in the visitor's own time zone, as 2026-11-01. Text dates compare correctly.
SF.todayISO = function (now) {
  const d = now || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

// 2026-11-01 -> 01.11.2026
SF.formatDate = function (iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? m[3] + '.' + m[2] + '.' + m[1] : iso;
};

SF.loadError = function (target, what) {
  target.replaceChildren(SF.el('p', 'empty',
    'Не получилось загрузить ' + what + '. Если страница открыта двойным щелчком по файлу, запусти start.bat: браузер не читает CSV без сервера.'));
};
