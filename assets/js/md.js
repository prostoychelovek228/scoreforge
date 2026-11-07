// A small Markdown reader for the posts: headings, lists, quotes, code, bold, italic, links.
window.SF = window.SF || {};

SF.markdown = function (text) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, label, url) => {
        // Only web links and links inside the site; anything else stays plain text.
        if (/^https?:\/\//i.test(url)) return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
        if (/^[\w./?=&%#-]+$/.test(url)) return '<a href="' + url + '">' + label + '</a>';
        return label;
      });
  }

  const lines = text.replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = Math.min(heading[1].length + 1, 4);
      out.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
      i++;
    } else if (/^```/.test(line)) {
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
    } else if (/^---+\s*$/.test(line)) {
      out.push('<hr>');
      i++;
    } else if (/^>/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      const paragraphs = quote.join('\n').split(/\n\s*\n/).map((p) => '<p>' + inline(p.replace(/\n/g, ' ')) + '</p>');
      out.push('<blockquote>' + paragraphs.join('') + '</blockquote>');
    } else if (/^(\s*[-*]\s+|\s*\d+\.\s+)/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const pattern = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
      const items = [];
      while (i < lines.length && pattern.test(lines[i])) items.push('<li>' + inline(lines[i++].replace(pattern, '')) + '</li>');
      out.push((ordered ? '<ol>' : '<ul>') + items.join('') + (ordered ? '</ol>' : '</ul>'));
    } else {
      const para = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|>|```|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) para.push(lines[i++]);
      out.push('<p>' + inline(para.join(' ')) + '</p>');
    }
  }
  return out.join('\n');
};
