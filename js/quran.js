/* Nuraya – Koran: Suren, Leser, Lesezeichen, Audio mit Mitlesen */
'use strict';
let META = null;
const surahCache = new Map();
async function loadMeta() { if (!META) META = await (await fetch('data/meta.json')).json(); return META; }
async function loadSurah(n) {
  if (surahCache.has(n)) return surahCache.get(n);
  const v = await (await fetch(`data/quran/${String(n).padStart(3, '0')}.json`)).json();
  surahCache.set(n, v); return v;
}
const sMeta = n => META.surahs[n - 1]; // [id, ar, translit, trName, deName, count, type]
const sName = n => { const m = sMeta(n); return S.lang === 'ar' ? m[1] : m[2]; };
const sSub = n => { const m = sMeta(n); return S.lang === 'tr' ? m[3] : S.lang === 'ar' ? m[2] : m[4]; };
/* Vortragsdauer je Vers: echte Länge (aus gespeicherten MP3s) oder Schätzung aus der Textlänge */
let REALDUR = {}; try { REALDUR = JSON.parse(localStorage.getItem('nur_dur') || '{}'); } catch (e) {}
let durT; function saveDur() { clearTimeout(durT); durT = setTimeout(() => { try { localStorage.setItem('nur_dur', JSON.stringify(REALDUR)); } catch (e) {} }, 800); }
const durOf = (s, a) => REALDUR[fileId(s, a)] ?? META.est[s - 1][a - 1];
function remaining(s, a) {
  let sur = 0, all = 0; const n = sMeta(s)[5];
  for (let i = a; i <= n; i++) sur += durOf(s, i);
  all = sur; for (let x = s + 1; x <= 114; x++) for (let i = 1; i <= sMeta(x)[5]; i++) all += durOf(x, i);
  return { sur: sur / S.quran.speed, all: all / S.quran.speed };
}
function fmtMin(sec) {
  const m = Math.max(1, Math.round(sec / 60));
  return m < 120 ? `≈ ${fmtNum(m)} min` : `≈ ${fmtNum(m)} min (${Math.floor(m / 60)} h ${m % 60} min)`;
}
function remText(s, a) { const r = remaining(s, a); return `⏱ ${t('remSurah')} <bdi>${fmtMin(r.sur)}</bdi> · ${t('remQuran')} <bdi>${fmtMin(r.all)}</bdi>`; }
function globalIndex(s, a) { let g = 0; for (let i = 1; i < s; i++) g += sMeta(i)[5]; return g + a; }
const AYAH_MARK = n => `<span class="amark"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="20" cy="20" r="11.5" fill="none" stroke="currentColor" stroke-width=".9"/><path d="M20 2l3 4h-6zM20 38l-3-4h6zM2 20l4-3v6zM38 20l-4 3v-6z" fill="currentColor"/></svg><b>${arNum(n)}</b></span>`;
/* Ornament-Rahmen über jeder Sure (eigene Zeichnung) */
function surahBanner(name) {
  const flower = (x, y, r) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="${r * .42}" ry="${r}" transform="rotate(${a}) translate(0 ${-r * .9})" fill="#f6d9e6" stroke="#7b3f5c" stroke-width=".8"/>`).join('')}<circle r="${r * .45}" fill="#f2c94c" stroke="#8a6d1a" stroke-width=".6"/></g>`;
  const side = `<path d="M10 42c18-26 44-26 60-6 10 12 26 12 34 0" fill="none" stroke="#d6efd9" stroke-width="2.2"/><path d="M10 42c18 26 44 26 60 6 10-12 26-12 34 0" fill="none" stroke="#d6efd9" stroke-width="2.2"/>
    <path d="M70 36c6-14 22-16 30-8M70 48c6 14 22 16 30 8" fill="none" stroke="#1e3b25" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M34 20c4 6 10 8 16 6M34 64c4-6 10-8 16-6" fill="none" stroke="#1e3b25" stroke-width="2.2" stroke-linecap="round"/>
    ${flower(28, 42, 7)}${flower(56, 22, 4.5)}${flower(56, 62, 4.5)}${flower(92, 42, 4)}`;
  return `<div class="surah-banner2"><svg viewBox="0 0 600 84" preserveAspectRatio="none" aria-hidden="true">
    <rect x="1" y="1" width="598" height="82" fill="#3f7f4c" stroke="#1d3d24" stroke-width="2"/>
    <rect x="5" y="5" width="590" height="74" fill="none" stroke="#a9d7b0" stroke-width="1"/>
    <g>${side}</g><g transform="translate(600 0) scale(-1 1)">${side}</g>
    <path d="M150 42c22-30 56-34 84-34h132c28 0 62 4 84 34-22 30-56 34-84 34H234c-28 0-62-4-84-34z" fill="#d3eed8" stroke="#2c5a35" stroke-width="2"/>
    <path d="M160 42c20-24 50-28 74-28h132c24 0 54 4 74 28-20 24-50 28-74 28H234c-24 0-54-4-74-28z" fill="none" stroke="#7fb98a" stroke-width="1"/>
  </svg><div class="ar">${name}</div></div>`;
}
const SNUM = n => `<span class="snum"><svg viewBox="0 0 40 40"><path d="M20 2l5 6 8 -1-1 8 6 5-6 5 1 8-8-1-5 6-5-6-8 1 1-8-6-5 6-5-1-8 8 1z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>${n}</span>`;

/* ---------------- Reiter „Koran“ ---------------- */
function quranContinueCard(withHead) {
  if (!META) return `<div class="card muted">…</div>`;
  const L = S.quran.last;
  const head = withHead ? `<div class="sec-h"><h2>${t('secContinue')}</h2><a href="#" data-go-q>${t('tab_quran')}</a></div>` : '';
  if (!L) return `${head}<button class="card row" style="width:100%;text-align:start" data-open-s="1|1">${SNUM(1)}<div class="grow"><b style="font-size:17px">${t('startReading')}</b><div class="muted small">${sName(1)} · ${sSub(1)}</div></div>${icon('chev')}</button>`;
  const g = globalIndex(L.s, L.a), pct = g / 6236 * 100;
  return `${head}<button class="card" style="width:100%;text-align:start" data-open-s="${L.s}|${L.a}">
    <div class="row">${SNUM(L.s)}<div class="grow"><b style="font-size:17px">${sName(L.s)}</b><div class="muted small">${sSub(L.s)} · ${t('ayah')} ${L.a}/${sMeta(L.s)[5]}</div></div>
    <span class="ar" style="font-size:26px">${sMeta(L.s)[1]}</span></div>
    <div class="progress" style="margin-top:14px"><i style="width:${pct.toFixed(2)}%"></i></div>
    <div class="row" style="margin-top:6px"><span class="tiny grow">${t('quranProgress', { p: pct.toFixed(1) })}</span><span class="link small">${t('continue')} ›</span></div>
    <div class="tiny" style="margin-top:6px">${remText(L.s, L.a)}</div></button>`;
}
function bindQuranCard(el) {
  const go = $('[data-go-q]', el); if (go) go.onclick = e => { e.preventDefault(); setTab('quran'); };
  $$('[data-open-s]', el).forEach(b => b.onclick = () => { const [s, a] = b.dataset.openS.split('|').map(Number); openReader(s, a); });
}
let qFilter = '', qMode = 'surah';
registerSection('quran', { id: 'continue', title: () => t('secContinue'), render: () => quranContinueCard(false), after: bindQuranCard });
registerSection('quran', {
  id: 'bookmarks', title: () => t('bookmarks'),
  render() {
    if (!META) return '';
    const B = S.quran.bookmarks;
    return `<div class="sec-h"><h2>${t('bookmarks')}</h2>${B.length ? `<span class="muted small">${B.length}</span>` : ''}</div><div class="card" style="padding:4px 14px">${B.length
      ? B.slice().reverse().map(b => `<div class="bm-item"><button class="grow row" style="text-align:start" data-open-s="${b.s}|${b.a}">${icon('bookmarkf')}<span class="grow"><b>${sName(b.s)} ${b.s}:${b.a}</b><span class="tiny" style="display:block">${fmtDate(new Date(b.t), { day: 'numeric', month: 'short', year: 'numeric' })}</span></span></button><button class="rbtn" data-unbm="${b.s}|${b.a}">${icon('trash')}</button></div>`).join('')
      : `<div class="empty">${t('noBookmarks')}</div>`}</div>`;
  },
  after(el) {
    bindQuranCard(el);
    $$('[data-unbm]', el).forEach(b => b.onclick = () => { const [s, a] = b.dataset.unbm.split('|').map(Number); toggleBookmark(s, a); renderPage('quran'); });
  },
});
registerSection('quran', {
  id: 'surahs', title: () => t('surahs'),
  render() {
    if (!META) return `<div class="card empty">${t('loading')}</div>`;
    return `<div class="sec-h"><h2>${t('surahs')}</h2></div>
      <div class="seg" style="margin-bottom:10px"><button data-qm="surah" class="${qMode === 'surah' ? 'on' : ''}">${t('surahs')}</button><button data-qm="juz" class="${qMode === 'juz' ? 'on' : ''}">${t('juz')}</button></div>
      ${qMode === 'surah' ? `<div class="search">${icon('search')}<input id="qSearch" placeholder="${t('searchSurah')}" value="${esc(qFilter)}" autocomplete="off"></div>` : ''}
      <div class="card slist" style="padding:2px 14px" id="sList">${qMode === 'surah' ? surahRows() : juzRows()}</div>`;
  },
  after(el) {
    $$('[data-qm]', el).forEach(b => b.onclick = () => { qMode = b.dataset.qm; renderPage('quran'); });
    const s = $('#qSearch', el); if (s) s.oninput = () => { qFilter = s.value; $('#sList', el).innerHTML = surahRows(); };
    const sl = $('#sList', el); if (sl) sl.onclick = e => { const b = e.target.closest('[data-open-s]'); if (b) { const [x, a] = b.dataset.openS.split('|').map(Number); openReader(x, a); } };
  },
});
function surahRows() {
  const q = qFilter.toLowerCase().trim().replace(/[-'’ ]/g, '');
  const rows = META.surahs.filter(m => !q || String(m[0]) === q || (m[2] + m[3] + m[4]).toLowerCase().replace(/[-'’ ]/g, '').includes(q) || m[1].includes(qFilter.trim()));
  return rows.map(m => `<button class="si" style="width:100%;text-align:start" data-open-s="${m[0]}|1">${SNUM(m[0])}<span class="grow nm"><b>${sName(m[0])}</b><span>${sSub(m[0])} · ${m[5]} ${t('ayat')} · ${m[6] === 'm' ? t('meccan') : t('medinan')}</span></span><span class="ar">${m[1]}</span></button>`).join('') || `<div class="empty">${t('noResults')}</div>`;
}
function juzRows() {
  return META.juz.map(([s, a], i) => `<button class="si" style="width:100%;text-align:start" data-open-s="${s}|${a}">${SNUM(i + 1)}<span class="grow nm"><b>${t('juz')} ${i + 1}</b><span>${sName(s)} ${s}:${a}</span></span></button>`).join('');
}
function toggleBookmark(s, a) {
  const B = S.quran.bookmarks, i = B.findIndex(b => b.s === s && b.a === a);
  if (i >= 0) { B.splice(i, 1); toast(t('bmRemoved')); } else { B.push({ s, a, t: Date.now() }); toast(t('bmAdded')); haptic(); }
  save();
}
const isBm = (s, a) => S.quran.bookmarks.some(b => b.s === s && b.a === a);

/* ---------------- Leser ---------------- */
let R = null; // aktueller Leser
async function openReader(s, a = 1) {
  await loadMeta();
  const v = openView(`<div class="v-h"><button class="rbtn" data-back>${icon('back')}</button><h3><button id="rTitle" style="font-size:20px;font-weight:750"></button></h3>
      <div class="capsule"><button data-r="scroll">${icon('scroll')}</button><button data-r="info">${icon('info')}</button><button data-r="opts">${icon('sliders')}</button></div></div>
    <div class="rsub"><span id="rSub"></span><span class="aypill"><b id="ayPin"></b><span id="rProg"></span></span></div><div class="rrem" id="rRem"></div>
    <div class="ascroll hidden" id="aScroll"><span>${t('autoScroll')}</span><button data-as="-">−</button><b id="asV"></b><button data-as="+">+</button><button data-as="x">${icon('close')}</button></div>
    <div class="v-b" id="rBody"></div>
    <div class="player" id="player"><button class="pp" data-pl="toggle">${icon('play')}</button><div class="pi"><b id="plT"></b><span id="plS">Mishary Rashid al-Afasy</span></div>
      <button class="sp" data-pl="speed">${S.quran.speed}x</button><button class="pb" data-pl="prev">${icon('prev')}</button><button class="pb" data-pl="next">${icon('next')}</button><div class="bar"><i id="plBar"></i></div></div>`,
    { cls: 'reader' + readerThemeCls(), onClose: () => { stopAudio(); stopScroll(); R = null; renderPage('quran'); renderPage('start'); } });
  R = { el: v.el, s: 0 };
  v.el.style.setProperty('--arSize', S.quran.arSize + 'px');
  $('#rTitle', v.el).onclick = pickSurah;
  v.el.addEventListener('click', e => {
    const r = e.target.closest('[data-r]'); if (r) { r.dataset.r === 'opts' ? readerOptions() : r.dataset.r === 'scroll' ? toggleScroll() : surahInfo(); return; }
    const as = e.target.closest('[data-as]'); if (as) { if (as.dataset.as === 'x') stopScroll(); else { S.quran.scrollSpeed = Math.max(4, Math.min(120, S.quran.scrollSpeed + (as.dataset.as === '+' ? 4 : -4))); save(); $('#asV', R.el).textContent = S.quran.scrollSpeed; } return; }
    const p = e.target.closest('[data-pl]'); if (p) return playerAction(p.dataset.pl);
    const ay = e.target.closest('[data-ay]'); if (ay) return ayahAction(ay.dataset.ay, +ay.closest('.ay').dataset.a);
  });
  // Lesefortschritt beim Scrollen merken
  let st; $('#rBody', v.el).addEventListener('scroll', () => {
    $('#totop').classList.toggle('show', $('#rBody', v.el).scrollTop > 500);
    clearTimeout(st); st = setTimeout(markVisible, 300);
  }, { passive: true });
  await showSurah(s, a);
}
async function showSurah(s, a = 1, keepAudio) {
  if (!keepAudio) stopAudio();
  const v = await loadSurah(s), m = sMeta(s), el = R.el; R.s = s;
  const scr = curScript(); let alt = null;
  try { alt = await loadScript(scr); } catch (e) { alt = null; }
  const sc = alt ? scr : 'uthmani', g0 = globalIndex(s, 1) - 1, colors = S.quran.tajweed && tajweedOk(sc);
  const arOf = (ar, i) => { let x = alt ? alt[g0 + i] : ar; if (sc === 'indopak') x = x.replace(/[\uE000-\uF8FF]+$/, '').replace(/\s*\u06DF([\u06D6-\u06DC]?)$/, '$1'); return colors ? tajHtml(x) : x; };
  $('#rTitle', el).innerHTML = `${sName(s)} <span style="font-size:13px">▾</span>`;
  $('#rSub', el).textContent = `${s}. ${sSub(s)} · ${m[5]} ${t('ayat')}`;
  const bism = s !== 1 && s !== 9 ? `<div class="bism ar scr-${sc}">${alt ? arOf('', -g0) : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'}</div>` : '';
  let html = `${surahBanner(m[1])}${bism}`;
  v.forEach(([ar, tr, de], i) => {
    const n = i + 1, sj = META.sajda.some(([x, y]) => x === s && y === n);
    html += `<div class="ay" id="ay${n}" data-a="${n}"><div class="ay-top"><button class="ay-tag" data-ay="menu">${t('ayah')} ${s}:${n}${sj ? ' ۩' : ''}</button>
      <div class="ay-act"><button data-ay="play">${icon('play')}</button><button data-ay="bm" class="${isBm(s, n) ? 'on' : ''}">${icon(isBm(s, n) ? 'bookmarkf' : 'bookmark')}</button></div></div>
      <div class="ar scr-${sc}">${arOf(ar, i)} ${AYAH_MARK(n)}</div>${S.quran.showTr ? `<div class="tr">${esc(tr)}</div>` : ''}${S.quran.showDe && S.lang !== 'ar' ? `<div class="de">${esc(de)}</div>` : ''}</div>`;
  });
  html += `<div style="display:flex;gap:10px;padding:20px 16px 130px">${s > 1 ? `<button class="btn grow" data-goto="${s - 1}">‹ ${sName(s - 1)}</button>` : ''}${s < 114 ? `<button class="btn grow" data-goto="${s + 1}">${sName(s + 1)} ›</button>` : ''}</div>`;
  const body = $('#rBody', el); body.innerHTML = html;
  $$('[data-goto]', body).forEach(b => b.onclick = () => showSurah(+b.dataset.goto, 1));
  $('#plT', el).textContent = `${sName(s)}, ${t('ayah')} ${a}`;
  R.a = a;
  requestAnimationFrame(() => { if (a > 1) { const x = $('#ay' + a, el); x && body.scrollTo({ top: x.offsetTop - 8 }); } else body.scrollTo({ top: 0 }); });
  S.quran.last = { s, a }; save(); updProg();
}
function updProg() {
  if (!R) return; const a = (AU.playing && AU.s === R.s) ? AU.a : (R.a || 1), p = globalIndex(R.s, a) / 6236 * 100;
  $('#rProg', R.el).textContent = p.toFixed(1) + ' %'; $('#rRem', R.el).innerHTML = remText(R.s, a);
  const pin = $('#ayPin', R.el); if (pin) pin.textContent = `${t('ayah')} ${R.s}:${a}`;
}
const readerThemeCls = () => S.quran.theme && S.quran.theme !== 'app' ? ' rt rt-' + S.quran.theme : '';
function applyReaderTheme() { if (!R) return; R.el.classList.remove('rt', 'rt-white', 'rt-black', 'rt-paper'); readerThemeCls().trim().split(' ').filter(Boolean).forEach(c => R.el.classList.add(c)); }

/* ---------------- Schriftarten (Skript-Optionen) ---------------- */
const SCRIPTS = { standard: 'KFGQPC', uthmani: 'AmiriQuran', indopak: 'IndoPak', plain: 'KFGQPC' };
const SCRIPT_PREVIEW = { standard: 'بِسۡمِ ٱللَّهِ', uthmani: 'بِسۡمِ ٱللَّهِ', indopak: 'بِسْمِ اللّٰهِ', plain: 'بسم الله' };
const scriptCache = {};
const curScript = () => SCRIPTS[S.quran.script] ? S.quran.script : 'uthmani';
async function loadScript(k) {
  if (k === 'uthmani') return null;
  if (!scriptCache[k]) scriptCache[k] = fetch(`data/scripts/${k}.json`).then(r => r.json()).catch(e => { delete scriptCache[k]; throw e; });
  return scriptCache[k];
}
const tajweedOk = k => k === 'uthmani' || k === 'standard';
/* Tajwîd-Farben: Erkennung in js/tajtag.js, Farben wie im Tajwîd-Fenster */
function tajColor(r) { if (r === 'silent') return '#97a2ad'; const x = TJ_RULES.find(y => y[0] === r); return x ? x[1] : ''; }
function tajHtml(text) {
  tajCss();
  let h = '', p = 0;
  for (const [a, b, r] of TT.tag(text)) { h += text.slice(p, a) + `<span class="tjc tjc-${r}">${text.slice(a, b)}</span>`; p = b; }
  return h + text.slice(p);
}
let tajCssDone = false;
function tajCss() {
  if (tajCssDone) return; tajCssDone = true;
  const rules = [...TJ_RULES.map(r => r[0]), 'silent'];
  const st = document.createElement('style');
  st.textContent = rules.map(r => `.tjc-${r}{color:${tajColor(r)}}.rt-white .tjc-${r},.rt-paper .tjc-${r}{color:color-mix(in srgb,${tajColor(r)} 72%,#000)}`).join('');
  document.head.appendChild(st);
}
function scriptPicker(id) {
  const k = curScript();
  return `<div class="set-row set-head" style="border-top:0"><span class="grow"><b>${t('script')}</b></span></div>
    <div class="scr-grid" id="${id}">${Object.keys(SCRIPTS).map(x => `<button data-scr="${x}" class="${k === x ? 'on' : ''}"><span class="scr-prev scr-${x}">${SCRIPT_PREVIEW[x]}</span><small>${t('scr_' + x)}</small></button>`).join('')}</div>
    <div class="set-row"><span class="grow"><b>${t('tjColors')}</b><span id="${id}N">${tajweedOk(k) ? t('tjColorsSub') : t('tjColorsNo')}</span></span><label class="switch"><input type="checkbox" data-tjc ${S.quran.tajweed ? 'checked' : ''} ${tajweedOk(k) ? '' : 'disabled'}><i></i></label></div>`;
}
function bindScriptPicker(root, id, after) {
  $$('[data-scr]', root).forEach(x => x.onclick = async () => {
    const k = x.dataset.scr;
    try { await loadScript(k); } catch (e) { toast(t('scrOffline')); return; }
    S.quran.script = k; save();
    $$('[data-scr]', root).forEach(y => y.classList.toggle('on', y === x));
    const tj = $('[data-tjc]', root); tj.disabled = !tajweedOk(k); $('#' + id + 'N', root).textContent = tajweedOk(k) ? t('tjColorsSub') : t('tjColorsNo');
    after && after();
  });
  $('[data-tjc]', root).onchange = e => { S.quran.tajweed = e.target.checked; save(); after && after(); };
}
/* Automatisches Blättern (Scrollen ohne Audio) */
let SC = null;
function toggleScroll() { SC ? stopScroll() : startScroll(); }
function startScroll() {
  if (!R) return; const body = $('#rBody', R.el), bar = $('#aScroll', R.el);
  bar.classList.remove('hidden'); $('#asV', R.el).textContent = S.quran.scrollSpeed;
  let last = performance.now(), paused = 0, acc = 0;
  const hold = () => { paused = Date.now() + 1500; };
  body.addEventListener('touchstart', hold, { passive: true }); body.addEventListener('touchmove', hold, { passive: true });
  const step = now => {
    if (!SC) return; const dt = (now - last) / 1000; last = now;
    if (Date.now() > paused) { acc += S.quran.scrollSpeed * dt; if (acc >= 1) { body.scrollTop += Math.floor(acc); acc -= Math.floor(acc); } }
    if (body.scrollTop + body.clientHeight >= body.scrollHeight - 2) {
      if (R.s < 114 && S.quran.stopAfter === 'never') { showSurah(R.s + 1, 1, true); } else { stopScroll(); return; }
    }
    SC.raf = requestAnimationFrame(step);
  };
  SC = { raf: requestAnimationFrame(step), off: () => { body.removeEventListener('touchstart', hold); body.removeEventListener('touchmove', hold); } };
  toast(t('autoScrollOn'));
}
function stopScroll() { if (!SC) return; cancelAnimationFrame(SC.raf); SC.off(); SC = null; if (R) $('#aScroll', R.el).classList.add('hidden'); }
/* Sure fertig (gehört oder bis zum Ende gelesen) → „Fortsetzen“ springt zur nächsten Sure */
function markSurahDone(s) {
  if (s >= 114) return;
  S.quran.last = { s: s + 1, a: 1 }; save();
  if (R && R.s === s) R.done = s;
}
function markVisible() {
  if (!R) return;
  const body = $('#rBody', R.el), top = body.getBoundingClientRect().top + 40;
  const vis = $$('.ay', body).find(x => x.getBoundingClientRect().bottom > top);
  const atEnd = body.scrollTop > 0 && body.scrollTop + body.clientHeight >= body.scrollHeight - 30;
  if (atEnd) { if (vis) R.a = +vis.dataset.a; markSurahDone(R.s); updProg(); return; }
  if (vis && R.done === R.s && +vis.dataset.a >= sMeta(R.s)[5] - 1) { R.a = +vis.dataset.a; return; }
  if (vis) { R.done = 0; R.a = +vis.dataset.a; S.quran.last = { s: R.s, a: R.a }; save(); updProg(); if (!AU.playing) $('#plT', R.el).textContent = `${sName(R.s)}, ${t('ayah')} ${R.a}`; }
}
function ayahAction(act, n) {
  if (act === 'bm') { toggleBookmark(R.s, n); const b = $(`#ay${n} [data-ay="bm"]`, R.el); b.classList.toggle('on', isBm(R.s, n)); b.innerHTML = icon(isBm(R.s, n) ? 'bookmarkf' : 'bookmark'); }
  if (act === 'play') playFrom(R.s, n);
  if (act === 'menu') {
    const [ar, tr, de] = surahCache.get(R.s)[n - 1];
    const sh = openSheet(`${sName(R.s)} ${R.s}:${n}`, `<div class="set-box">
      <button class="set-row" style="width:100%" data-m="play">${icon('play')}<span class="grow" style="text-align:start"><b>${t('playFromHere')}</b></span></button>
      <button class="set-row" style="width:100%" data-m="bm">${icon(isBm(R.s, n) ? 'bookmarkf' : 'bookmark')}<span class="grow" style="text-align:start"><b>${isBm(R.s, n) ? t('bmRemove') : t('bmAdd')}</b></span></button>
      <button class="set-row" style="width:100%" data-m="copy">${icon('edit2')}<span class="grow" style="text-align:start"><b>${t('copyText')}</b></span></button></div>`);
    sh.body.onclick = async e => {
      const m = e.target.closest('[data-m]'); if (!m) return; sh.close();
      if (m.dataset.m === 'play') playFrom(R.s, n);
      if (m.dataset.m === 'bm') ayahAction('bm', n);
      if (m.dataset.m === 'copy') { try { await navigator.clipboard.writeText(`${ar}\n${tr}\n${de}\n(${sName(R.s)} ${R.s}:${n})`); toast(t('copied')); } catch (x) { toast(t('copyFail')); } }
    };
  }
}
function pickSurah() {
  const sh = openSheet(t('surahs'), `<div class="search">${icon('search')}<input id="psQ" placeholder="${t('searchSurah')}"></div><div class="slist" id="psL"></div>`);
  const draw = q => { const old = qFilter; qFilter = q; $('#psL', sh.body).innerHTML = surahRows(); qFilter = old; };
  draw(''); $('#psQ', sh.body).oninput = e => draw(e.target.value);
  sh.body.onclick = e => { const b = e.target.closest('[data-open-s]'); if (b) { sh.close(); showSurah(+b.dataset.openS.split('|')[0], 1); } };
  const cur = $(`[data-open-s="${R.s}|1"]`, sh.body); cur && setTimeout(() => cur.scrollIntoView({ block: 'center' }), 50);
}
function surahInfo() {
  const m = sMeta(R.s);
  const juzIdx = META.juz.reduce((acc, [s, a], i) => (s < R.s || (s === R.s && a <= 1)) ? i + 1 : acc, 1);
  openSheet(`${sName(R.s)}`, `<div class="card"><div class="ar" style="font-size:40px;text-align:center">${m[1]}</div>
    <div class="set-box" style="margin-top:12px">
      <div class="set-row"><span class="grow"><b>${t('meaning')}</b></span><span>${esc(S.lang === 'tr' ? m[3] : m[4])}</span></div>
      <div class="set-row"><span class="grow"><b>${t('number')}</b></span><span>${m[0]}</span></div>
      <div class="set-row"><span class="grow"><b>${t('ayat')}</b></span><span>${m[5]}</span></div>
      <div class="set-row"><span class="grow"><b>${t('revealed')}</b></span><span>${m[6] === 'm' ? t('meccan') : t('medinan')}</span></div>
      <div class="set-row"><span class="grow"><b>${t('juz')}</b></span><span>${juzIdx}</span></div></div></div>
    <p class="tiny" style="margin:12px 4px">${t('sourcesQuran')}</p>`);
}
const selRow = (k, label, opts) => `<div class="set-row"><span class="grow"><b>${label}</b></span><select data-qs="${k}">${opts.map(([v, n]) => `<option value="${v}" ${String(S.quran[k]) === String(v) ? 'selected' : ''}>${n}</option>`).join('')}</select></div>`;
function readerOptions() {
  const sw = (k, label) => `<div class="set-row"><span class="grow"><b>${label}</b></span><label class="switch"><input type="checkbox" data-o="${k}" ${S.quran[k] ? 'checked' : ''}><i></i></label></div>`;
  const sh = openSheet(t('display'), `<div class="set-sec"><div class="set-box">
      <div class="set-row set-head" style="border-top:0"><span class="grow"><b>${t('readTheme')}</b></span></div>
      <div style="padding:0 12px 12px"><div class="seg">${['app', 'white', 'black', 'paper'].map(k => `<button data-rt="${k}" class="${(S.quran.theme || 'app') === k ? 'on' : ''}">${t('rt_' + k)}</button>`).join('')}</div></div>
      ${scriptPicker('rScr')}
      ${sw('showTr', t('showPron'))}${S.lang !== 'ar' ? sw('showDe', t('showTransl')) : ''}
      <div class="set-row"><span class="grow"><b>${t('arSize')}</b></span><div class="adj"><button data-fs="-2">−</button><b id="fsV">${S.quran.arSize}</b><button data-fs="2">+</button></div></div></div></div>
    <div class="set-sec"><h4>${t('audio')}</h4><div class="set-box">${sw('follow', t('followAlong'))}${sw('bism', t('playBism'))}
      ${selRow('stopAfter', t('stopAfter'), [['ayah', t('stopAyah')], ['surah', t('stopSurah')], ['juz', t('stopJuz')], ['never', t('stopNever')]])}
      ${selRow('repeat', t('repeatAyah'), [[1, t('rep1')], [2, '2×'], [3, '3×'], [5, '5×'], [10, '10×'], [0, '∞']])}
      ${sw('repeatSurah', t('repeatSurah'))}
      ${selRow('kbps', t('quality'), [[128, '128 kbps'], [64, '64 kbps']])}
      <div class="set-row"><span class="grow"><b>${t('reciter')}</b><span>Mishary Rashid al-Afasy</span></span></div>
      <button class="set-row" style="width:100%" data-dl>${icon('download')}<span class="grow" style="text-align:start"><b>${t('dlSurah')}</b><span id="dlState">${t('checking')}</span></span></button></div></div>`);
  const b = sh.body;
  bindScriptPicker(b, 'rScr', () => showSurah(R.s, R.a, true));
  $$('[data-rt]', b).forEach(x => x.onclick = () => { S.quran.theme = x.dataset.rt; save(); $$('[data-rt]', b).forEach(y => y.classList.toggle('on', y === x)); applyReaderTheme(); });
  $$('[data-qs]', b).forEach(x => x.onchange = () => { const v = x.value; S.quran[x.dataset.qs] = isNaN(+v) ? v : +v; save(); updProg(); });
  $$('[data-o]', b).forEach(i => i.onchange = () => {
    S.quran[i.dataset.o] = i.checked; save();
    if (['showTr', 'showDe'].includes(i.dataset.o)) { const a = R.a; showSurah(R.s, a, true); }
  });
  $$('[data-fs]', b).forEach(x => x.onclick = () => { S.quran.arSize = Math.max(20, Math.min(52, S.quran.arSize + +x.dataset.fs)); $('#fsV', b).textContent = S.quran.arSize; R.el.style.setProperty('--arSize', S.quran.arSize + 'px'); save(); });
  surahDownloaded(R.s).then(n => { const m = sMeta(R.s)[5]; $('#dlState', b).textContent = n >= m ? t('dlDone') : n ? t('dlPartial', { n, m }) : t('dlNone'); });
  $('[data-dl]', b).onclick = () => downloadSurah(R.s, x => { const s = $('#dlState', b); if (s) s.textContent = x; });
}

/* ---------------- Audio (IndexedDB + Stream) ---------------- */
const RECITERS = { alafasy: { name: 'Mishary Rashid al-Afasy', remoteBase: 'https://everyayah.com/data/Alafasy_{k}kbps/', local: 'audio/alafasy/' } };
const remoteOf = rec => rec.remoteBase.replace('{k}', S.quran.kbps || 128);
let DBP = null;
function db() {
  return DBP ||= new Promise((res, rej) => {
    const r = indexedDB.open('nur-audio', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('files');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function idb(mode, fn) { const d = await db(); return new Promise((res, rej) => { const tx = d.transaction('files', mode), st = tx.objectStore('files'); const r = fn(st); tx.oncomplete = () => res(r && r.result); tx.onerror = () => rej(tx.error); }); }
const fileId = (s, a) => String(s).padStart(3, '0') + String(a).padStart(3, '0');
const aKey = (s, a, rec = S.quran.reciter) => rec + '/' + fileId(s, a);
async function getBlob(s, a) { try { return await idb('readonly', st => st.get(aKey(s, a))); } catch (e) { return null; } }
async function putBlob(key, blob) { return idb('readwrite', st => st.put(blob, key)); }
async function allKeys() { try { return await idb('readonly', st => st.getAllKeys()); } catch (e) { return []; } }
async function surahDownloaded(s) { const pre = S.quran.reciter + '/' + String(s).padStart(3, '0'); return (await allKeys()).filter(k => k.startsWith(pre)).length; }
async function deleteSurahAudio(s) { const pre = S.quran.reciter + '/' + String(s).padStart(3, '0'); const keys = (await allKeys()).filter(k => k.startsWith(pre)); await idb('readwrite', st => keys.forEach(k => st.delete(k))); }
async function deleteAllAudio() { await idb('readwrite', st => st.clear()); }
let localOK = null;
async function srcFor(s, a) {
  const b = await getBlob(s, a); if (b) return { url: URL.createObjectURL(b), blob: true };
  const rec = RECITERS[S.quran.reciter];
  if (localOK !== false) {
    try { const r = await fetch(rec.local + fileId(s, a) + '.mp3', { method: 'HEAD' }); if (r.ok) { localOK = true; return { url: rec.local + fileId(s, a) + '.mp3' }; } localOK = false; } catch (e) { localOK = false; }
  }
  if (!navigator.onLine) return null;
  return { url: remoteOf(rec) + fileId(s, a) + '.mp3', remote: true };
}
const AU = { el: new Audio(), playing: false, s: 0, a: 0, bism: false, url: null };
AU.el.preload = 'auto';
async function playFrom(s, a, bism) {
  if (bism === undefined) bism = S.quran.bism && a === 1 && s !== 1 && s !== 9;
  const src = await srcFor(bism ? 1 : s, bism ? 1 : a);
  if (!src) { toast(t('audioOffline')); stopAudio(); return; }
  if (AU.url && AU.url.startsWith('blob:')) URL.revokeObjectURL(AU.url);
  AU.url = src.url; AU.s = s; AU.a = a; AU.bism = bism; AU.playing = true;
  AU.el.src = src.url; AU.el.playbackRate = S.quran.speed;
  try { await AU.el.play(); } catch (e) { AU.playing = false; toast(t('audioFail')); }
  AU.el.playbackRate = S.quran.speed;
  uiAudio(); updProg();
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: `${sName(s)} ${s}:${a}`, artist: RECITERS[S.quran.reciter].name, album: 'Nuraya · Koran' });
    navigator.mediaSession.setActionHandler('nexttrack', () => playerAction('next'));
    navigator.mediaSession.setActionHandler('previoustrack', () => playerAction('prev'));
  }
}
function stopAudio() { AU.el.pause(); AU.playing = false; AU.single = false; uiAudio(); }
AU.rep = 0;
const isJuzStart = (s, a) => META.juz.some(([x, y]) => x === s && y === a);
AU.el.addEventListener('ended', async () => {
  if (AU.single) { AU.single = false; AU.playing = false; uiAudio(); return; }
  if (AU.bism) return playFrom(AU.s, AU.a, false);
  const rep = +S.quran.repeat;
  if (rep === 0 || AU.rep + 1 < rep) { AU.rep++; return playFrom(AU.s, AU.a, false); }
  AU.rep = 0;
  const stop = () => { AU.playing = false; uiAudio(); };
  if (AU.a >= sMeta(AU.s)[5] && !S.quran.repeatSurah) markSurahDone(AU.s);
  if (S.quran.stopAfter === 'ayah') return stop();
  const cnt = sMeta(AU.s)[5];
  if (AU.a < cnt) {
    if (S.quran.stopAfter === 'juz' && isJuzStart(AU.s, AU.a + 1)) return stop();
    return playFrom(AU.s, AU.a + 1, false);
  }
  if (S.quran.repeatSurah) return playFrom(AU.s, 1);
  if (S.quran.stopAfter === 'surah' || AU.s >= 114) return stop();
  if (S.quran.stopAfter === 'juz' && isJuzStart(AU.s + 1, 1)) return stop();
  if (R) await showSurah(AU.s + 1, 1, true); // automatisch umblättern
  return playFrom(AU.s + 1, 1);
});
AU.el.addEventListener('timeupdate', () => { const b = R && $('#plBar', R.el); if (b && AU.el.duration) b.style.width = (AU.el.currentTime / AU.el.duration * 100) + '%'; });
AU.el.addEventListener('error', () => { if (AU.playing) { AU.playing = false; uiAudio(); toast(t('audioFail')); } });
AU.el.addEventListener('pause', () => { if (!AU.el.ended) { AU.playing = false; uiAudio(); } });
AU.el.addEventListener('play', () => { AU.playing = true; uiAudio(); });
function uiAudio() {
  if (!R) return;
  const el = R.el;
  $('[data-pl="toggle"]', el).innerHTML = icon(AU.playing ? 'pause' : 'play');
  $$('.ay.cur', el).forEach(x => x.classList.remove('cur'));
  if (AU.s === R.s && (AU.playing || AU.el.currentTime > 0)) {
    $('#plT', el).textContent = `${sName(AU.s)}, ${t('ayah')} ${AU.bism ? '–' : AU.a}`;
    const cur = !AU.bism && $('#ay' + AU.a, el);
    if (cur) { cur.classList.add('cur'); if (S.quran.follow && AU.playing) { const body = $('#rBody', el); body.scrollTo({ top: cur.offsetTop - 70, behavior: 'smooth' }); } }
  }
}
function playerAction(a) {
  if (a === 'toggle') { AU.rep = 0;
    if (AU.playing) AU.el.pause();
    else if (AU.el.src && AU.s === R.s && AU.el.currentTime > 0 && !AU.el.ended) AU.el.play().catch(() => {});
    else playFrom(R.s, R.a || 1);
  }
  if (a === 'next' || a === 'prev') { AU.rep = 0;
    const s = AU.s || R.s, cur = AU.s ? AU.a : (R.a || 1), cnt = sMeta(s)[5];
    const n = a === 'next' ? Math.min(cnt, cur + 1) : Math.max(1, cur - 1);
    playFrom(s, n, false);
  }
  if (a === 'speed') {
    const sp = [0.75, 1, 1.25, 1.5], i = (sp.indexOf(S.quran.speed) + 1) % sp.length;
    S.quran.speed = sp[i]; AU.el.playbackRate = S.quran.speed; save();
    $('[data-pl="speed"]', R.el).textContent = S.quran.speed + 'x';
  }
}
/* Sure herunterladen (nur auf Wunsch) */
let dlBusy = false;
async function downloadSurah(s, report) {
  if (dlBusy) return toast(t('dlBusy'));
  if (!navigator.onLine) return toast(t('offline'));
  dlBusy = true;
  const rec = RECITERS[S.quran.reciter], cnt = sMeta(s)[5];
  const list = []; for (let a = 1; a <= cnt; a++) list.push([s, a]);
  if (!(await getBlob(1, 1))) list.unshift([1, 1]); // Basmala für den Vortrag
  let done = 0, failed = 0, cors = false;
  const one = async ([x, a]) => {
    if (await getBlob(x, a)) { done++; return; }
    try {
      const r = await fetch(remoteOf(rec) + fileId(x, a) + '.mp3', { mode: 'cors' });
      if (!r.ok) throw new Error(r.status);
      const bl = await r.blob(); await putBlob(aKey(x, a), bl); REALDUR[fileId(x, a)] = +(bl.size / ((S.quran.kbps || 128) * 125)).toFixed(1); saveDur(); done++;
    } catch (e) { failed++; if (e instanceof TypeError) cors = true; }
    report && report(t('dlProgress', { n: done, m: list.length }));
  };
  const q = list.slice(); const workers = Array.from({ length: 4 }, async () => { while (q.length) { if (cors && done === 0) return; await one(q.shift()); } });
  await Promise.all(workers);
  dlBusy = false;
  if (cors && done === 0) { report && report(t('dlBlocked')); toast(t('dlBlocked'), 6000); return; }
  report && report(failed ? t('dlSomeFailed', { n: failed }) : t('dlDone'));
  toast(failed ? t('dlSomeFailed', { n: failed }) : t('dlFinished', { s: sName(s) }));
}
/* MP3- oder ZIP-Dateien importieren (z. B. 000_versebyverse.zip von everyayah.com) */
function measureBps(blob) {
  return new Promise(res => {
    const a = new Audio(), u = URL.createObjectURL(blob); let fin = false;
    const done = v => { if (fin) return; fin = true; URL.revokeObjectURL(u); res(v); };
    a.preload = 'metadata'; a.onloadedmetadata = () => done(a.duration > 0 && isFinite(a.duration) ? blob.size / a.duration : null);
    a.onerror = () => done(null); setTimeout(() => done(null), 4000); a.src = u;
  });
}
let IMPORTING = false;
async function importAudio(files, report) {
  if (IMPORTING) return toast(t('dlBusy'));
  IMPORTING = true;
  let n = 0, skipped = 0, bps = S.quran.importBps || null;
  const have = new Set(await allKeys());
  const handle = async (name, blob) => {
    const m = name.match(/(\d{6})\.mp3$/i); if (!m) return;
    const key = S.quran.reciter + '/' + m[1];
    if (!bps) { bps = await measureBps(blob) || 16000; S.quran.importBps = bps; save(); }
    if (!have.has(key)) { await putBlob(key, blob); n++; } else skipped++;
    REALDUR[m[1]] = +(blob.size / bps).toFixed(1);
    if ((n + skipped) % 25 === 0) { report && report(t('importing', { n: n + skipped })); saveDur(); }
  };
  try {
    for (const f of files) {
      if (/\.zip$/i.test(f.name)) {
        await new Promise((res, rej) => {
          let pending = [];
          const uz = new fflate.Unzip(file => {
            if (!/\.mp3$/i.test(file.name)) return; // Bilder & Sonstiges überspringen
            const chunks = [];
            file.ondata = (err, chunk, final) => { if (err) return rej(err); chunks.push(chunk); if (final) pending.push(handle(file.name, new Blob(chunks, { type: 'audio/mpeg' }))); };
            file.start();
          });
          uz.register(fflate.UnzipInflate); uz.register(fflate.UnzipPassThrough);
          const rd = f.stream().getReader();
          (async () => {
            try {
              for (;;) {
                const { done, value } = await rd.read();
                if (done) { uz.push(new Uint8Array(0), true); await Promise.all(pending); return res(); }
                uz.push(value);
                if (pending.length > 8) { await Promise.all(pending); pending = []; } // Speicher schonen
              }
            } catch (e) { rej(e); }
          })();
        });
      } else await handle(f.name, f);
    }
    saveDur();
    report && report(t('imported', { n })); toast(t('imported', { n }) + (skipped ? ' · ' + t('skipped', { n: skipped }) : ''), 4000);
  } catch (e) { console.error(e); toast(t('importFail'), 5000); report && report(t('importFail')); }
  IMPORTING = false;
  return n;
}
/* Anleitung: Audio von everyayah importieren (erscheint beim ersten Öffnen des Reiters Koran) */
const AUDIO_ZIP_URL = 'https://everyayah.com/data/Alafasy_128kbps/000_versebyverse.zip';
async function openAudioHelp() {
  const keys = (await allKeys()).filter(k => k.startsWith(S.quran.reciter + '/'));
  const done = keys.length >= 6000;
  const sh = openSheet(t('audHelpTitle'), `
    <div class="card" style="margin-bottom:12px">${done ? `<b style="color:var(--accent)">✓ ${t('audHelpDone', { n: fmtNum(keys.length) })}</b>` : `<span class="muted small">${t('audHelpIntro')}</span>`}</div>
    <ol class="steps">
      <li><b>${t('audStep1')}</b><span>${t('audStep1T')}</span><a class="btn sm" href="${AUDIO_ZIP_URL}" target="_blank" rel="noopener noreferrer" style="margin-top:8px;text-decoration:none;color:var(--fg)">${icon('download')} 000_versebyverse.zip</a></li>
      <li><b>${t('audStep2')}</b><span>${t('audStep2T')}</span></li>
      <li><b>${t('audStep3')}</b><span>${t('audStep3T')}</span>
        <label class="btn pri sm" style="margin-top:8px">${icon('upload')} ${t('audStep3Btn')}<input type="file" id="ahFile" accept=".zip,.mp3,application/zip,audio/mpeg" multiple hidden></label>
        <span id="ahStat" class="small" style="display:block;margin-top:6px;color:var(--accent)"></span></li>
      <li><b>${t('audStep4')}</b><span>${t('audStep4T')}</span></li>
    </ol>
    <p class="tiny" style="margin:6px 4px 14px">${t('audHelpNote')}</p>
    <button class="btn full" data-ah-close>${t('audHelpLater')}</button>`, { onClose: () => { S.seenAudioHelp = true; save(); } });
  $('[data-ah-close]', sh.body).onclick = sh.close;
  $('#ahFile', sh.body).onchange = async e => {
    const f = [...e.target.files]; if (!f.length) return;
    const st = $('#ahStat', sh.body); st.textContent = t('importing', { n: 0 });
    await importAudio(f, m => { st.textContent = m; });
    refreshSettings && refreshSettings();
  };
}
loadMeta().then(() => { renderPage('quran'); renderPage('start'); });
