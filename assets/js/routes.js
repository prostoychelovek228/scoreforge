// Route page: weekly check marks, kept only in this browser and never sent anywhere.
(function () {
  const KEY = 'scoreforge-sat-12';
  const boxes = [...document.querySelectorAll('.week-check input')];
  const countEl = document.getElementById('progress-count');
  const cells = [...document.querySelectorAll('.progress-cell')];

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function write(done) {
    try {
      localStorage.setItem(KEY, JSON.stringify(done));
    } catch (e) {
      // Private mode or blocked storage: the marks simply won't survive a reload.
    }
  }

  function refresh() {
    const done = boxes.filter((b) => b.checked);
    countEl.textContent = 'Отмечено: ' + done.length + ' из ' + boxes.length;
    cells.forEach((cell, i) => cell.classList.toggle('on', boxes[i].checked));
  }

  const saved = read();
  boxes.forEach((box) => {
    box.checked = saved.includes(box.dataset.week);
    box.addEventListener('change', () => {
      write(boxes.filter((b) => b.checked).map((b) => b.dataset.week));
      refresh();
    });
  });
  refresh();
})();
