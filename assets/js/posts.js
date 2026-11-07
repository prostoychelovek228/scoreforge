// "Разборы": the list page (posts.html) and a single post (post.html?p=file-name).
(function () {
  const list = document.getElementById('post-list');
  const article = document.getElementById('post-body');

  function byNewest(a, b) {
    return (b['дата'] || '').localeCompare(a['дата'] || '');
  }

  // A post with a future date stays out of the list until that day comes.
  function isPublished(row) {
    return (row['дата'] || '') <= SF.todayISO();
  }

  function showList(rows) {
    const items = rows.filter(isPublished).sort(byNewest).map((row) => {
      const link = SF.el('a', 'post-link', row['заголовок']);
      link.href = 'post.html?p=' + encodeURIComponent(row['файл']);
      return SF.el('article', 'post-row',
        SF.el('p', 'lbl post-meta', row['тема'] + ' / ' + SF.formatDate(row['дата'])),
        SF.el('h2', 'post-title', link),
        SF.el('p', 'post-desc', row['описание']));
    });
    list.replaceChildren(...items);
  }

  function notFound() {
    article.replaceChildren(SF.el('p', 'empty', 'Такого разбора на полке нет. Возможно, он ещё пишется, а возможно, ссылка с опечаткой.'));
  }

  function showPost(rows) {
    const slug = new URLSearchParams(location.search).get('p') || '';
    const row = rows.find((r) => r['файл'] === slug);
    // File names are plain latin words, so a link can never reach outside posts/.
    if (!row || !/^[a-z0-9-]+$/.test(slug)) { notFound(); return; }
    if (!isPublished(row)) {
      article.replaceChildren(SF.el('p', 'empty', 'Этот разбор выйдет ' + SF.formatDate(row['дата']) + '. Загляни попозже.'));
      return;
    }

    document.title = row['заголовок'] + ' · scoreforge.lab';
    document.getElementById('post-heading').textContent = row['заголовок'];
    document.getElementById('post-kicker').textContent = row['тема'] + ' / ' + SF.formatDate(row['дата']);

    fetch('posts/' + slug + '.md')
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      })
      .then((text) => { article.innerHTML = SF.markdown(text); })
      .catch(notFound);
  }

  const target = list || article;
  SF.loadCSV('data/posts.csv')
    .then((rows) => (list ? showList(rows) : showPost(rows)))
    .catch(() => SF.loadError(target, 'разборы'));
})();
