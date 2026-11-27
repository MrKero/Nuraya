/* Tableiste im „Liquid Glass“-Stil: Auswahl-Kapsel, die man mit dem Finger verschieben kann.
   Beim Ziehen wird eine Glaslinse sichtbar, die die Symbole darunter vergrößert. */
const GT = (() => {
  let bar, pill, lens, inner, idx = 0, drag = null, hideT = 0;
  const btns = () => [...bar.querySelectorAll(':scope > button')];
  const geo = i => { const b = btns()[i]; return { x: b.offsetLeft, w: b.offsetWidth, y: b.offsetTop, h: b.offsetHeight }; };
  const idxOf = tab => Math.max(0, btns().findIndex(b => b.dataset.tab === tab));
  function place(el, x, w, s = 1) { el.style.width = w + 'px'; el.style.transform = `translate3d(${x}px,0,0) scale(${s})`; }
  function fillLens() {
    // Kopie der Knöpfe in die Linse – deckungsgleich mit der echten Leiste, dadurch wirkt die Linse wie eine Lupe
    inner.innerHTML = btns().map(b => `<div class="gt-b ${b.classList.contains('on') ? 'on' : ''}">${b.innerHTML}</div>`).join('');
    inner.style.width = bar.clientWidth + 'px'; inner.style.height = bar.clientHeight + 'px';
  }
  function lensAt(x, w, s) { place(lens, x, w, s); inner.style.transform = `translate3d(${-x}px,0,0)`; }
  function showLens(x, w, s) {
    clearTimeout(hideT); fillLens(); lens.classList.add('on'); lensAt(x, w, s);
  }
  function hideLens(delay = 260) { clearTimeout(hideT); hideT = setTimeout(() => lens.classList.remove('on'), delay); }
  function sync(anim = true) {
    if (!bar) return;
    const i = idxOf(TAB), g = geo(i);
    pill.style.top = g.y + 'px'; pill.style.height = g.h + 'px'; lens.style.top = g.y + 'px'; lens.style.height = g.h + 'px';
    pill.classList.toggle('noanim', !anim); place(pill, g.x, g.w);
    idx = i;
  }
  /* Tippen: Linse gleitet von der alten zur neuen Position */
  function glide(from, to) {
    const a = geo(from), b = geo(to);
    lens.classList.add('noanim'); showLens(a.x, a.w, 1.12);
    requestAnimationFrame(() => requestAnimationFrame(() => { lens.classList.remove('noanim'); lensAt(b.x, b.w, 1.12); setTimeout(() => lensAt(b.x, b.w, 1), 260); hideLens(520); }));
  }
  function nearest(cx) {
    let best = 0, d = 1e9; btns().forEach((b, i) => { const m = Math.abs(b.offsetLeft + b.offsetWidth / 2 - cx); if (m < d) { d = m; best = i; } });
    return best;
  }
  function init() {
    bar = $('#tabbar');
    bar.insertAdjacentHTML('afterbegin', '<div class="gt-pill"></div>');
    bar.insertAdjacentHTML('beforeend', '<div class="gt-lens" aria-hidden="true"><div class="gt-in"></div></div>');
    pill = $('.gt-pill', bar); lens = $('.gt-lens', bar); inner = $('.gt-in', bar);
    bar.addEventListener('pointerdown', e => {
      if (e.button) return;
      const r = bar.getBoundingClientRect(), g = geo(idx);
      const onPill = e.clientX - r.left >= g.x - 6 && e.clientX - r.left <= g.x + g.w + 6;
      drag = { id: e.pointerId, sx: e.clientX, r, on: false, grab: onPill ? e.clientX - r.left - g.x : g.w / 2, cur: idx, w: g.w };
    });
    bar.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.on && Math.abs(e.clientX - drag.sx) < 7) return;
      if (!drag.on) { drag.on = true; bar.setPointerCapture(e.pointerId); lens.classList.add('noanim'); pill.classList.add('dim'); }
      const min = geo(0).x, max = geo(btns().length - 1).x;
      const lo = Math.min(min, max), hi = Math.max(min, max);
      let x = e.clientX - drag.r.left - drag.grab; x = Math.max(lo - 6, Math.min(hi + 6, x));
      showLens(x, drag.w, 1.22);
      const n = nearest(x + drag.w / 2);
      if (n !== drag.cur) { drag.cur = n; haptic(); btns().forEach((b, i) => b.classList.toggle('hov', i === n)); }
    });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.on) return; // normaler Tipp → click-Handler
      btns().forEach(b => b.classList.remove('hov'));
      lens.classList.remove('noanim'); pill.classList.remove('dim');
      const g = geo(d.cur); lensAt(g.x, g.w, 1.08); setTimeout(() => lensAt(g.x, g.w, 1), 200); hideLens(420);
      bar.dataset.dragged = '1'; setTimeout(() => delete bar.dataset.dragged, 50);
      const tab = btns()[d.cur].dataset.tab;
      if (tab !== TAB) setTab(tab); else sync();
    };
    bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
    bar.addEventListener('click', e => {
      if (bar.dataset.dragged) return;
      const b = e.target.closest('button'); if (!b) return;
      const to = idxOf(b.dataset.tab);
      if (to !== idx) glide(idx, to);
      setTab(b.dataset.tab);
    });
    addEventListener('resize', () => sync(false));
    sync(false);
  }
  return { init, sync };
})();
