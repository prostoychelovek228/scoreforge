// Home page: an endless 3D shelf of textbooks. One requestAnimationFrame loop
// plus the Web Animations API; no CSS keyframes and no opacity fades.
(function () {
  const BOOKS = SF.BOOKS;
  const N = BOOKS.length;
  const COPIES = 3;
  const TOTAL = N * COPIES;
  const OPEN_TILT = -4.5;
  const PULL = 0.42; // how far the open book comes towards the viewer, in tape heights
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const EASE_TEXT = 'cubic-bezier(.2,.8,.2,1)';
  const EASE_SHEET = 'cubic-bezier(.76,0,.18,1)';

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const shelf = $('shelf');
  const stage = $('stage');
  const ring = $('ring');
  const cursor = $('cursor');
  const detail = $('detail');
  const tabsEl = $('tabs');
  const tabInd = $('tab-ind');
  const capTitle = $('cap-title');
  const capSub = $('cap-sub');
  const capNote = $('cap-note');
  const closeBtn = $('detail-close');

  // Geometry, measured from --H
  let W = 0, H = 0, ws = 0, d = 0, gap = 0, persp = 0, shelfCy = 0;

  // State
  const startIndex = Math.max(0, BOOKS.findIndex((b) => '#' + b.id === location.hash));
  let s = startIndex + N;
  let T = s;
  let hoverV = -1;
  let active = -1;
  let mx = -999, my = -999, cx = -999, cy = -999;
  let tiltX = 0, tiltY = 0;
  let onCover = false;
  let isOpen = false;
  let overButton = false;
  let dragging = false, dragMoved = false, dragStartX = 0, dragStartT = 0;
  let wheelTimer = 0;
  let last = performance.now();
  let sheetAnim = null;
  let inkFrame = 0;
  let cursorState = '';

  const tapes = [];

  function smoothstep(x) { return x * x * (3 - 2 * x); }
  function bump(r) { return Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * 0.5; }
  function place(r) { return r * (ws + gap) + (d - ws + 1.6 * gap) * bump(r); }
  function relative(v) {
    const half = TOTAL / 2;
    return ((((v - s + half) % TOTAL) + TOTAL) % TOTAL) - half;
  }

  function measure() {
    W = innerWidth;
    H = $('probe').getBoundingClientRect().height;
    ws = H * 0.14;
    d = H * 0.7;
    gap = H * 0.03;
    persp = H * 5.3;
    const box = shelf.getBoundingClientRect();
    shelfCy = box.top + box.height / 2;
    stage.style.setProperty('--ws', ws + 'px');
    stage.style.setProperty('--d', d + 'px');
  }

  function buildTapes() {
    document.body.insertAdjacentHTML('afterbegin', SF.bookSprite());
    for (let v = 0; v < TOTAL; v++) {
      const book = BOOKS[v % N];
      const tape = document.createElement('div');
      tape.className = 'tape';
      tape.innerHTML =
        '<div class="face back"></div>' +
        '<div class="face edge"></div><div class="face topside"></div>' +
        '<div class="face sp"><svg viewBox="0 0 140 1000" preserveAspectRatio="none"><use href="#sp-' + book.id + '"/></svg></div>' +
        '<div class="face cv"><svg viewBox="0 0 700 1000" preserveAspectRatio="none"><use href="#cv-' + book.id + '"/></svg></div>';
      tape.querySelector('.back').style.background = book.bg;
      tape.addEventListener('pointerenter', () => { hoverV = v; });
      tape.addEventListener('pointerleave', () => { if (hoverV === v) hoverV = -1; });
      tape.addEventListener('click', () => {
        if (dragMoved) return;
        const r = relative(v);
        if (Math.abs(r) < 0.5) openDetail();
        else T = Math.round(T + r);
      });
      stage.appendChild(tape);
      tapes.push({
        el: tape, v, lift: 0, hidden: false, near: false, lastTransform: '', lastZ: -1, lastShade: -1,
        sp: tape.querySelector('.sp'), cv: tape.querySelector('.cv'),
      });
    }
  }

  function buildTabs() {
    SF.TABS.forEach((tab) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab lbl';
      btn.textContent = tab.label;
      btn.dataset.key = tab.key;
      btn.addEventListener('click', () => {
        const target = tab.key === 'all' ? 0 : BOOKS.findIndex((b) => b.tab === tab.key);
        let diff = (((target - Math.round(T)) % N) + N) % N;
        if (diff > N / 2) diff -= N;
        T = Math.round(T) + diff;
      });
      tabsEl.appendChild(btn);
    });
  }

  function updateTabs(book) {
    tabsEl.querySelectorAll('.tab').forEach((btn) => {
      const on = btn.dataset.key === book.tab;
      btn.setAttribute('aria-current', on);
      if (on) {
        tabInd.style.width = btn.offsetWidth + 'px';
        tabInd.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
      }
    });
  }

  // Slide new text up through the mask while older text slides away.
  function swapCaption(mask, text, dir, first) {
    const incoming = document.createElement('span');
    incoming.textContent = text;
    const previous = [...mask.children].filter((c) => !c.dataset.leaving);
    mask.appendChild(incoming);
    if (first || reduce) {
      previous.forEach((c) => c.remove());
      return;
    }
    const opts = { duration: 650, easing: EASE_TEXT, fill: 'both' };
    incoming.animate([{ transform: 'translateY(' + dir * 105 + '%)' }, { transform: 'translateY(0)' }], opts);
    previous.forEach((old) => {
      old.dataset.leaving = '1';
      old.setAttribute('aria-hidden', 'true');
      const from = getComputedStyle(old).transform;
      old.animate(
        [{ transform: from === 'none' ? 'translateY(0)' : from }, { transform: 'translateY(' + -dir * 105 + '%)' }], opts
      ).onfinish = () => old.remove();
    });
  }

  function setActive(index, dir) {
    const first = active === -1;
    active = index;
    const book = BOOKS[index];
    swapCaption(capTitle, book.title, dir, first);
    swapCaption(capSub, book.sub, dir, first);
    swapCaption(capNote, book.note, dir, first);
    updateTabs(book);
  }

  function renderTapes(dt) {
    const reach = W / 2 + 1.5 * d;
    for (const t of tapes) {
      const r = relative(t.v);
      const x = place(r);
      const off = Math.abs(x) > reach;
      if (off !== t.hidden) {
        t.hidden = off;
        t.el.style.visibility = off ? 'hidden' : '';
      }
      if (off) continue;

      const o = smoothstep(Math.max(0, 1 - Math.abs(r)));
      const wantLift = hoverV === t.v && Math.abs(r) > 0.5 ? 1 : 0;
      t.lift = reduce ? wantLift : t.lift + (wantLift - t.lift) * (1 - Math.exp(-12 * dt));

      const rotY = -90 * o + tiltY * o;
      const rotX = tiltX * o;
      const rotZ = OPEN_TILT * o;
      const z = o * PULL * H;
      const y = -o * 0.025 * H - t.lift * 0.045 * H;
      const transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,' + z.toFixed(2) + 'px) rotateZ(' +
        rotZ.toFixed(2) + 'deg) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
      if (transform !== t.lastTransform) {
        t.el.style.transform = transform;
        t.lastTransform = transform;
      }
      const zIndex = Math.round(100 - Math.abs(r) * 4);
      if (zIndex !== t.lastZ) {
        t.el.style.zIndex = zIndex;
        t.lastZ = zIndex;
      }
      const shade = Math.round(o * 100) / 100;
      if (shade !== t.lastShade) {
        t.sp.style.setProperty('--shade', (shade * 0.55).toFixed(3));
        t.cv.style.setProperty('--shade', ((1 - shade) * 0.5).toFixed(3));
        t.lastShade = shade;
      }
      const near = o > 0.001;
      if (near !== t.near) {
        t.el.classList.toggle('near', near);
        t.near = near;
      }
    }
  }

  function updateCursor(dt) {
    if (!fine) return;
    const k = reduce ? 1 : 1 - Math.exp(-16 * dt);
    cx += (mx - cx) * k;
    cy += (my - cy) * k;
    cursor.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';

    let state = '';
    if (overButton) state = 'btn';
    if (!isOpen) {
      if (onCover) state = 'open';
      else if (hoverV >= 0 && Math.abs(relative(hoverV)) > 0.5) state = 'spine';
    }
    if (state !== cursorState) {
      cursor.className = 'cursor ' + state;
      cursorState = state;
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (reduce) {
      s = T;
    } else {
      const k = dragging ? 18 : 5.2;
      s += (T - s) * (1 - Math.exp(-k * dt));
      if (Math.abs(T - s) < 1e-4) s = T;
    }
    if (Math.abs(s) > TOTAL * 4) {
      const shift = Math.sign(s) * TOTAL * 4;
      s -= shift;
      T -= shift;
    }

    const index = ((Math.round(s) % N) + N) % N;
    if (index !== active) setActive(index, T >= s ? 1 : -1);

    if (!isOpen) {
      onCover = fine && Math.abs(mx - W / 2) < 0.55 * d && Math.abs(my - shelfCy) < 0.55 * H && Math.abs(T - s) < 0.3;
      let wantY, wantX;
      if (onCover) {
        wantY = ((mx - W / 2) / (0.55 * d)) * 9;
        wantX = (-(my - shelfCy) / (H / 2)) * 6;
      } else {
        wantY = fine && mx > -900 ? ((mx - W / 2) / W) * 5 : 0;
        wantX = 0;
      }
      const k = reduce ? 1 : 1 - Math.exp(-7 * dt);
      tiltY += (wantY - tiltY) * k;
      tiltX += (wantX - tiltX) * k;
      renderTapes(dt);

      const ringScale = smoothstep(Math.max(0, 1 - Math.abs(T - s) * 3));
      ring.style.transform = 'translate3d(' + (W / 2 - 0.5 * d - 6).toFixed(1) + 'px,' + (shelfCy + 0.36 * H).toFixed(1) + 'px,0) scale(' + ringScale.toFixed(3) + ')';
    }

    updateCursor(dt);
    requestAnimationFrame(frame);
  }

  // ---- Opening a book: a sheet of paper grows out of the cover ----

  function activeTape() {
    return tapes.reduce((best, t) => (Math.abs(relative(t.v)) < Math.abs(relative(best.v)) ? t : best), tapes[0]);
  }

  // The cover's on-screen box before its tilt, so the sheet starts exactly on top of it.
  function coverInset() {
    const rect = activeTape().cv.getBoundingClientRect();
    const scale = persp / (persp - (ws / 2 + PULL * H));
    const w = d * scale;
    const h = H * scale;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const top = centerY - h / 2;
    const left = centerX - w / 2;
    return {
      origin: centerX + 'px ' + centerY + 'px',
      clip: 'inset(' + top + 'px ' + (innerWidth - left - w) + 'px ' + (innerHeight - top - h) + 'px ' + left + 'px round 3px)',
    };
  }

  function fillDetail(book) {
    $('d-sub').textContent = book.sub;
    $('d-title').textContent = book.title;
    $('d-meta').textContent = book.meta;
    $('d-text').textContent = book.text;
    $('d-credit').textContent = book.credit;
    $('d-cover').setAttribute('href', '#cv-' + book.id);
    $('d-catalog').href = 'catalog.html?exam=' + encodeURIComponent(book.exam);
    const route = $('d-route');
    route.hidden = !book.route;
    route.style.display = book.route ? '' : 'none';
  }

  function runInk() {
    const blobs = [...document.querySelectorAll('#ink-blobs circle')];
    const delays = [0, 120, 220, 300, 360, 420, 180];
    const group = $('poster-art');
    group.setAttribute('mask', 'url(#ink-mask)');
    blobs.forEach((b) => b.setAttribute('r', 0));
    cancelAnimationFrame(inkFrame);

    const started = performance.now() + (reduce ? -5000 : 520);
    function step(now) {
      const elapsed = now - started;
      blobs.forEach((b, i) => {
        const p = Math.min(1, Math.max(0, (elapsed - delays[i]) / 1250));
        b.setAttribute('r', (1 - Math.pow(1 - p, 3)) * 1000);
      });
      // Once fully inked, drop the mask so the poster is crisp and costs nothing.
      if (elapsed < 2000) inkFrame = requestAnimationFrame(step);
      else group.removeAttribute('mask');
    }
    inkFrame = requestAnimationFrame(step);
  }

  function setBackgroundInert(value) {
    document.querySelectorAll('[data-behind-sheet]').forEach((node) => { node.inert = value; });
  }

  function openDetail() {
    if (isOpen) return;
    isOpen = true;
    onCover = false;
    T = Math.round(T);
    s = T;
    tiltX = 0;
    tiltY = 0;
    renderTapes(0);
    ring.style.transform += ' scale(0)';

    fillDetail(BOOKS[((T % N) + N) % N]);
    const start = coverInset();
    detail.scrollTop = 0;
    detail.style.visibility = 'visible';
    detail.style.transformOrigin = start.origin;
    detail.inert = false;
    setBackgroundInert(true);
    closeBtn.focus({ preventScroll: true });

    if (sheetAnim) sheetAnim.cancel();
    sheetAnim = detail.animate(
      [
        { clipPath: start.clip, transform: 'rotate(' + OPEN_TILT + 'deg)' },
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' },
      ],
      { duration: reduce ? 1 : 1050, easing: EASE_SHEET, fill: 'both' }
    );

    detail.querySelectorAll('.mline > *').forEach((line, i) => {
      line.animate(
        [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }],
        { duration: reduce ? 1 : 900, delay: reduce ? 0 : 620 + i * 75, easing: EASE_TEXT, fill: 'both' }
      );
    });
    runInk();
  }

  function closeDetail() {
    if (!isOpen || !sheetAnim) return;
    const end = coverInset();
    detail.style.transformOrigin = end.origin;
    const closing = detail.animate(
      [
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' },
        { clipPath: end.clip, transform: 'rotate(' + OPEN_TILT + 'deg)' },
      ],
      { duration: reduce ? 1 : 850, easing: EASE_SHEET, fill: 'both' }
    );
    sheetAnim.cancel();
    sheetAnim = null;
    closing.onfinish = () => {
      detail.style.visibility = 'hidden';
      detail.inert = true;
      detail.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      setBackgroundInert(false);
      isOpen = false;
      ring.focus({ preventScroll: true });
    };
  }

  // ---- Input ----

  function step(delta) {
    if (!isOpen) T = Math.round(T) + delta;
  }

  $('arrow-l').addEventListener('click', () => step(-1));
  $('arrow-r').addEventListener('click', () => step(1));
  ring.addEventListener('click', openDetail);
  closeBtn.addEventListener('click', closeDetail);

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeDetail(); return; }
    if (isOpen) return;
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Enter' && document.activeElement === document.body) openDetail();
  });

  addEventListener('wheel', (e) => {
    if (isOpen) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    T += (delta / (ws + gap)) * 0.5;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { T = Math.round(T); }, 160);
  }, { passive: true });

  shelf.addEventListener('pointerdown', (e) => {
    if (isOpen) return;
    dragging = false;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartT = T;
    addEventListener('pointermove', onDrag);
    addEventListener('pointerup', endDrag);
    addEventListener('pointercancel', endDrag);
  });

  function onDrag(e) {
    const dx = e.clientX - dragStartX;
    if (!dragging && Math.abs(dx) > 5) { dragging = true; dragMoved = true; }
    if (dragging) T = dragStartT - dx / (ws + gap);
  }

  function endDrag() {
    removeEventListener('pointermove', onDrag);
    removeEventListener('pointerup', endDrag);
    removeEventListener('pointercancel', endDrag);
    if (dragging) T = Math.round(T);
    dragging = false;
    // The click that ends a drag must not open anything; clear the flag after it fires.
    setTimeout(() => { dragMoved = false; }, 0);
  }

  if (fine) {
    root.classList.add('has-cursor');
    addEventListener('pointermove', (e) => {
      if (cx < -900) { cx = e.clientX; cy = e.clientY; }
      mx = e.clientX;
      my = e.clientY;
      overButton = !!(e.target.closest && e.target.closest('a,button,summary'));
    });
  }

  addEventListener('resize', () => {
    measure();
    if (active >= 0) updateTabs(BOOKS[active]);
  });

  buildTabs();
  buildTapes();
  measure();
  // Fonts change tab widths, so place the indicator again once they arrive.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (active >= 0) updateTabs(BOOKS[active]); });
  }
  detail.inert = true;
  requestAnimationFrame(frame);
})();
