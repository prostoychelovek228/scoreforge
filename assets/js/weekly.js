// Task of the week: the browser picks one task from data/weekly.csv by today's date.
// No server is involved, so a new task appears every Monday on its own.
window.SF = window.SF || {};

(function () {
  const START = new Date(2026, 9, 26); // A Monday: week 0 of the rotation.
  const DAY = 86400000;

  SF.weekNumber = function (now) {
    const d = now || new Date();
    const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor(Math.round((midnight - START) / DAY) / 7);
  };

  SF.taskForWeek = function (tasks, week) {
    return tasks[((week % tasks.length) + tasks.length) % tasks.length];
  };

  SF.weekRange = function (week) {
    const from = new Date(START.getFullYear(), START.getMonth(), START.getDate() + week * 7);
    const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 6);
    const end = to.getDate() + ' ' + SF.MONTHS[to.getMonth()];
    if (from.getMonth() === to.getMonth()) return from.getDate() + '–' + end;
    return from.getDate() + ' ' + SF.MONTHS[from.getMonth()] + ' – ' + end;
  };

  function taskCard(task, opts) {
    const answerBox = SF.el('div', 'task-answer');
    answerBox.setAttribute('aria-live', 'polite');
    answerBox.hidden = true;

    const buttons = ['A', 'B', 'C', 'D'].map((letter) => {
      const btn = SF.el('button', 'task-opt', SF.el('span', 'lbl task-letter', letter), SF.el('span', '', task[letter]));
      btn.type = 'button';
      btn.addEventListener('click', () => reveal(letter));
      return btn;
    });

    function reveal(picked) {
      const right = task['ответ'];
      buttons.forEach((btn, i) => {
        const letter = 'ABCD'[i];
        btn.classList.toggle('task-right', letter === right);
        btn.classList.toggle('task-wrong', letter === picked && picked !== right);
      });
      let verdict = 'Правильный ответ: ' + right + '.';
      if (picked === right) verdict = 'Верно! Ответ ' + right + '.';
      else if (picked) verdict = 'Ловушка сработала. Правильный ответ: ' + right + '.';
      answerBox.replaceChildren(
        SF.el('p', 'task-verdict', verdict),
        SF.el('p', '', task['разбор']),
        SF.el('p', 'task-rule', SF.el('span', 'lbl task-rule-label', 'Правило для журнала'), task['правило']));
      answerBox.hidden = false;
      showBtn.hidden = true;
    }

    const showBtn = SF.el('button', 'lbl link-btn task-show', 'Сразу показать ответ');
    showBtn.type = 'button';
    showBtn.addEventListener('click', () => reveal(''));

    return SF.el('article', 'task',
      SF.el('p', 'lbl task-kicker', task['тема'] + ' / ' + opts.range),
      opts.showTitle ? SF.el('h2', 'task-title', task['название']) : null,
      SF.el('p', 'task-text', task['условие']),
      SF.el('div', 'task-opts', ...buttons),
      showBtn,
      answerBox);
  }

  function renderPage(tasks, target) {
    const week = SF.weekNumber();
    target.replaceChildren(taskCard(SF.taskForWeek(tasks, week), { range: 'неделя ' + SF.weekRange(week), showTitle: true }));

    // Past weeks form a growing archive; once every task has been shown, the list simply cycles.
    const pastCount = Math.min(week, tasks.length - 1);
    const pastEl = document.getElementById('week-past');
    const items = [];
    for (let i = 1; i <= pastCount; i++) {
      const task = SF.taskForWeek(tasks, week - i);
      const range = SF.weekRange(week - i);
      const summary = SF.el('summary', '', task['название']);
      items.push(SF.el('details', 'task-past', summary, taskCard(task, { range: range, showTitle: false })));
    }
    pastEl.replaceChildren(...items);
    document.getElementById('week-past-wrap').hidden = !items.length;
  }

  const homeLink = document.getElementById('week-link');
  const page = document.getElementById('week-task');
  if (!homeLink && !page) return;

  SF.loadCSV('data/weekly.csv')
    .then((tasks) => {
      if (homeLink) homeLink.textContent = 'Задача недели: ' + SF.taskForWeek(tasks, SF.weekNumber())['название'] + ' →';
      if (page) renderPage(tasks, page);
    })
    .catch(() => { if (page) SF.loadError(page, 'задачу недели'); });
})();
