/* Nuraya – Kern: Zustand, Hilfsfunktionen, Navigation, Bearbeitungsmodus */
'use strict';
const APP = { name: 'Nuraya', version: '1.8.2', date: '2026-11-12' };

/* ---------------- Zustand ---------------- */
const DEFAULTS = {
  name: 'Kerem', lang: 'de', theme: 'gruen', appIcon: 'gruen', beads: 'onyx', compass: 'kalli', tasbihBg: 'black',
  loc: { name: 'Aachen', cc: 'DE', lat: 50.7753, lon: 6.0839, tz: 'Europe/Berlin' }, places: [], trips: [], autoLoc: false,
  remind: true, since: null, dismissed: {},
  method: 'diyanet_eu', asr: 'standard', pnames: 'tr', adj: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  timeSource: 'calc', dl: null, prayers: {},
  tasbih: { counters: [{ name: '', count: 0, target: 33, dhikr: 'subhanallah', seq: null, seqI: 0, rounds: 0 }], active: 0, sound: true, haptic: true, days: {} },
  quran: { script: 'uthmani', tajweed: false, last: null, bookmarks: [], showTr: true, showDe: true, arSize: 30, reciter: 'alafasy', kbps: 128, speed: 1, follow: true, theme: 'app', bism: true,
    stopAfter: 'surah', repeat: 1, repeatSurah: false, scrollSpeed: 24 },
  zakat: { cur: '€', basis: 'gold85', goldPrice: '', silverPrice: '', vals: { cash: '', goldG: '', silverG: '', invest: '', receivables: '', trade: '', realestate: '', rentSaved: '', other: '', debts: '' }, agri: { kg: '', water: 'rain' }, live: { camel: '', cow: '', sheep: '' } },
  seenAudioHelp: false,
  layout: {}, hijriAdj: 0, kandil: true, weekStart: 1, autoUpdate: true,
};
let S;
function deepMerge(base, over) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return over === undefined ? base : over;
  const out = { ...base };
  if (over && typeof over === 'object') for (const k of Object.keys(over)) out[k] = (k in base) ? deepMerge(base[k], over[k]) : over[k];
  return out;
}
function loadState() {
  try { S = deepMerge(structuredClone(DEFAULTS), JSON.parse(localStorage.getItem('nur_state') || '{}')); }
  catch (e) { S = structuredClone(DEFAULTS); }
  if (!S.since) S.since = todayKey();
  if (S.quran.paper) { S.quran.theme = 'paper'; delete S.quran.paper; }
}
let saveT;
function save(now) {
  clearTimeout(saveT);
  const w = () => { try { localStorage.setItem('nur_state', JSON.stringify(S)); } catch (e) { toast(t('storageFull')); } };
  now ? w() : (saveT = setTimeout(w, 250));
}
window.addEventListener('pagehide', () => save(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });

/* ---------------- Hilfen ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function t(key, vars) {
  const L = I18N[S.lang] || I18N.de;
  let s = L[key] ?? I18N.de[key] ?? key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}
const locale = () => ({ de: 'de-DE', tr: 'tr-TR', ar: 'ar' }[S.lang] || 'de-DE');
const pad = n => String(n).padStart(2, '0');
const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const todayKey = () => keyOf(new Date());
function fmtTime(d, tz) {
  if (!d) return '--:--';
  try { return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: tz || S.loc.tz || undefined }); }
  catch (e) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
}
function fmtDur(ms, withSec = true) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return withSec ? (h ? h + ':' + pad(m) + ':' + pad(sec) : m + ':' + pad(sec)) : (h ? h + ' h ' + m + ' min' : m + ' min');
}
const fmtNum = n => Number(n).toLocaleString(locale());
const fmtDate = (d, o) => d.toLocaleDateString(locale(), o);
function arNum(n) { return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]); }

/* Icons (eigene, schlichte Linien-Icons) */
const IC = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
  prayer: '<g fill="currentColor" stroke="none"><circle cx="5.1" cy="17.7" r="2.4"/><path d="M6.9 15.2C9.3 11.9 12.4 9.2 15.8 7.9c1.8-.7 3.7.4 3.8 2.3l-.5 9.6h3v1.9h-7.6l.6-7.1c-2.6 1.5-4.8 3.5-6.3 5.7z"/></g><path d="M8.7 17.1 9.9 20.6h2.6"/><path d="M1.4 22.6h21.2" stroke-width="1.4"/>',
  moonstar: '<path d="M19 14.8A8.2 8.2 0 1 1 9.2 4.3a6.6 6.6 0 0 0 9.8 10.5Z"/><path d="m17.6 3 .9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z" fill="currentColor" stroke-width="1"/>',
  book: '<path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6Z"/><path d="M12 6v14.5"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  pen: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  up: '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>',
  down: '<path d="M12 5v14M5.5 12.5 12 19l6.5-6.5"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  back: '<path d="M15 5 8 12l7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  reset: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
  sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',
  pause: '<path d="M7.5 5v14M16.5 5v14" stroke-width="3.4"/>',
  prev: '<path d="M6 5v14"/><path d="M19 5 9 12l10 7z" fill="currentColor"/>',
  next: '<path d="M18 5v14"/><path d="M5 5l10 7-10 7z" fill="currentColor"/>',
  bookmark: '<path d="M6.5 3.5h11v17L12 16l-5.5 4.5z"/>',
  bookmarkf: '<path d="M6.5 3.5h11v17L12 16l-5.5 4.5z" fill="currentColor"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  gps: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M4.5 19.5h15"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  chev: '<path d="m9 5 7 7-7 7"/>',
  chevl: '<path d="m15 5-7 7 7 7"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  bead: '<circle cx="6" cy="15" r="2.6"/><circle cx="12" cy="12" r="2.6"/><circle cx="18" cy="9" r="2.6"/><path d="M3 17c4-2 13-7 18-9.5"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  repeat: '<path d="M17 3l3 3-3 3"/><path d="M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3"/><path d="M20 13v2a3 3 0 0 1-3 3H4"/>',
  upload: '<path d="M12 20V9M7 13.5l5-5 5 5"/><path d="M4.5 4.5h15"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit2: '<path d="M14 5l5 5M4 20l1-5L15.5 4.5a2.1 2.1 0 0 1 3 3L8 18z"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  star: '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4l-5.3 3 1.2-6L3.4 9.3l6-.7z"/>',
  scroll: '<path d="M2.5 6.2c2.6-1.3 5.6-1.3 8.5.4v13c-2.9-1.6-5.9-1.6-8.5-.3z"/><path d="M11 6.6c1.3-2.2 3.6-3.6 6.4-3.9-.4 2.5 0 5.6 1.3 8.2-2.8.3-5.6 1.7-7.7 4"/><path d="M21.5 8.3v11.2c-3.4-1.4-7-1.1-10.5.6"/>',
  flame: '<path d="M12 21c4 0 6.5-2.7 6.5-6.3 0-4-3.3-6.3-4.2-10.2-2 1.5-3.3 4-3.3 6.3-1-.6-1.7-1.8-2-3-1.5 1.7-2.5 3.8-2.5 6.9C6.5 18.3 8 21 12 21Z"/>',
};
const icon = (n, cls = 'ic') => `<svg class="${cls}${['back', 'chev', 'chevl', 'prev', 'next'].includes(n) ? ' dirx' : ''}" viewBox="0 0 24 24">${IC[n] || ''}</svg>`;

/* ---------------- Toast / Haptik / Klang ---------------- */
let toastT;
function toast(msg, ms = 2600) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), ms);
}
function haptic() {
  // iOS 18+: Klick auf ein "switch"-Kontrollkästchen löst eine kurze Vibration aus
  try { if (navigator.vibrate) navigator.vibrate(12); else $('#haptLbl').click(); } catch (e) {}
}
let AC, NOISE;
/* Klick-Klang je nach Material: Stein/Marmor = hell & klar, Holz = warm & dumpf, Perle = weich */
function clickSound(kind = 'bead', mat = 'stone') {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const now = AC.currentTime, out = AC.createGain(); out.gain.value = .9; out.connect(AC.destination);
    if (kind === 'done') {
      [880, 1320, 1760].forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, now + i * .09); g.gain.exponentialRampToValueAtTime(.22, now + i * .09 + .01); g.gain.exponentialRampToValueAtTime(.0001, now + i * .09 + .5);
        o.connect(g); g.connect(out); o.start(now + i * .09); o.stop(now + i * .09 + .55); });
      return;
    }
    const P = { stone: { f: [3150, 4780, 6900], dec: .045, nf: 3800, ng: .55 }, wood: { f: [820, 1390, 2100], dec: .07, nf: 1300, ng: .45 }, pearl: { f: [2050, 3100], dec: .05, nf: 2600, ng: .35 } }[mat] || {};
    P.f.forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f * (1 + (Math.random() - .5) * .02);
      g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.32 / (i + 1), now + .002); g.gain.exponentialRampToValueAtTime(.0001, now + P.dec * (1.4 - i * .25));
      o.connect(g); g.connect(out); o.start(now); o.stop(now + .15); });
    if (!NOISE) { NOISE = AC.createBuffer(1, AC.sampleRate * .05, AC.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const n = AC.createBufferSource(), bf = AC.createBiquadFilter(), ng = AC.createGain();
    n.buffer = NOISE; bf.type = 'bandpass'; bf.frequency.value = P.nf; bf.Q.value = 1.4;
    ng.gain.setValueAtTime(P.ng, now); ng.gain.exponentialRampToValueAtTime(.0001, now + .018);
    n.connect(bf); bf.connect(ng); ng.connect(out); n.start(now); n.stop(now + .03);
  } catch (e) {}
}

/* ---------------- Sheets & Vollbild-Ansichten ---------------- */
const stack = [];
let lockY = 0, locked = false;
function syncScrollLock() {
  const b = document.body;
  if (stack.length && !locked) { lockY = scrollY; locked = true; Object.assign(b.style, { position: 'fixed', top: -lockY + 'px', left: '0', right: '0', width: '100%' }); }
  else if (!stack.length && locked) { locked = false; Object.assign(b.style, { position: '', top: '', left: '', right: '', width: '' }); scrollTo(0, lockY); }
}
function openSheet(title, body, { onClose, cls = '' } = {}) {
  const bd = document.createElement('div'); bd.className = 'backdrop';
  const sh = document.createElement('div'); sh.className = 'sheet ' + cls;
  sh.innerHTML = `<div class="grab"></div><div class="sh-h"><h3>${title}</h3><button class="rbtn" data-x>${icon('close')}</button></div><div class="sh-b">${body}</div>`;
  document.body.append(bd, sh);
  requestAnimationFrame(() => { bd.classList.add('show'); sh.classList.add('show'); });
  const close = () => {
    bd.classList.remove('show'); sh.classList.remove('show');
    setTimeout(() => { bd.remove(); sh.remove(); }, 330);
    const i = stack.indexOf(entry); if (i >= 0) stack.splice(i, 1);
    syncScrollLock(); onClose && onClose();
  };
  const entry = { el: sh, close };
  bd.onclick = close; sh.querySelector('[data-x]').onclick = close;
  // nach unten wischen schließt
  let y0 = null, dy = 0; const grab = sh.querySelector('.grab'), head = sh.querySelector('.sh-h');
  [grab, head].forEach(z => {
    z.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; sh.style.transition = 'none'; }, { passive: true });
    z.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = `translateY(${dy}px)`; }, { passive: true });
    z.addEventListener('touchend', () => { sh.style.transition = ''; sh.style.transform = ''; if (dy > 110) close(); y0 = null; dy = 0; });
  });
  stack.push(entry); syncScrollLock();
  bd.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  return { el: sh, body: sh.querySelector('.sh-b'), close };
}
function openView(html, { cls = '', onClose } = {}) {
  const v = document.createElement('div'); v.className = 'view ' + cls; v.innerHTML = html;
  document.body.append(v); document.body.classList.add('in-view');
  requestAnimationFrame(() => requestAnimationFrame(() => v.classList.add('show')));
  const close = () => {
    v.classList.remove('show'); setTimeout(() => v.remove(), 340);
    const i = stack.indexOf(entry); if (i >= 0) stack.splice(i, 1);
    if (!$$('.view.show').length) document.body.classList.remove('in-view');
    syncScrollLock(); onClose && onClose();
  };
  const entry = { el: v, close }; stack.push(entry); syncScrollLock();
  v.querySelectorAll('[data-back]').forEach(b => b.onclick = close);
  // vom linken Rand wischen = zurück (wie iOS)
  let x0 = null;
  v.addEventListener('touchstart', e => { const x = e.touches[0].clientX; x0 = x < 24 ? x : null; }, { passive: true });
  v.addEventListener('touchend', e => { if (x0 != null && e.changedTouches[0].clientX - x0 > 90) close(); x0 = null; });
  return { el: v, close };
}

/* ---------------- Navigation & Seiten ---------------- */
let TAB = 'start', EDIT = false;
const SECTIONS = {}; // tab -> [{id, title(), render(), after()}]
function registerSection(tab, def) { (SECTIONS[tab] ||= []).push(def); }
function orderFor(tab) {
  const ids = SECTIONS[tab].map(s => s.id), L = S.layout[tab];
  if (!L) return ids;
  const o = L.order.filter(id => ids.includes(id));
  ids.forEach(id => { if (!o.includes(id)) o.push(id); });
  return o;
}
const isHidden = (tab, id) => !!(S.layout[tab] && S.layout[tab].hidden && S.layout[tab].hidden.includes(id));
function renderPage(tab = TAB) {
  const page = $(`.page[data-tab="${tab}"]`); if (!page) return;
  const order = orderFor(tab);
  let html = '';
  if (EDIT && tab === TAB) html += `<div class="edit-banner"><b>${t('editTitle')}</b><p>${t('editHelp')}</p>
    <div class="row"><button class="btn" data-ed="reset">${t('reset')}</button><button class="btn pri" data-ed="done">${t('done')}</button></div></div>`;
  order.forEach((id, i) => {
    const def = SECTIONS[tab].find(s => s.id === id), hid = isHidden(tab, id);
    if (hid && !(EDIT && tab === TAB)) return;
    let body = ''; try { body = def.render(); } catch (e) { console.error(e); body = `<div class="card muted">${esc(e.message)}</div>`; }
    html += `<div class="sec${hid ? ' off' : ''}" data-sec="${id}">
      <div class="ed-bar"><b>${def.title()}${hid ? ` <small>· ${t('hidden')}</small>` : ''}</b>
        <button data-mv="eye">${icon(hid ? 'eyeoff' : 'eye')}</button>
        <button data-mv="up" ${i === 0 ? 'disabled' : ''}>${icon('up')}</button>
        <button data-mv="down" ${i === order.length - 1 ? 'disabled' : ''}>${icon('down')}</button></div>
      <div class="sec-body">${body}</div></div>`;
  });
  page.innerHTML = html;
  page.classList.toggle('editing', EDIT && tab === TAB);
  if (!(EDIT && tab === TAB)) SECTIONS[tab].forEach(d => { if (d.after && !isHidden(tab, d.id)) try { d.after(page.querySelector(`[data-sec="${d.id}"]`)); } catch (e) { console.error(e); } });
}
function renderAll() { Object.keys(SECTIONS).forEach(renderPage); renderTop(); }
function moveSection(id, how) {
  const L = S.layout[TAB] ||= { order: orderFor(TAB), hidden: [] };
  L.order = orderFor(TAB); L.hidden ||= [];
  const i = L.order.indexOf(id);
  if (how === 'eye') { const h = L.hidden.indexOf(id); h >= 0 ? L.hidden.splice(h, 1) : L.hidden.push(id); }
  if (how === 'up' && i > 0) [L.order[i - 1], L.order[i]] = [L.order[i], L.order[i - 1]];
  if (how === 'down' && i < L.order.length - 1) [L.order[i + 1], L.order[i]] = [L.order[i], L.order[i + 1]];
  save(); renderPage();
}
document.addEventListener('click', e => {
  const mv = e.target.closest('[data-mv]');
  if (mv) { moveSection(mv.closest('.sec').dataset.sec, mv.dataset.mv); return; }
  const ed = e.target.closest('[data-ed]');
  if (ed) {
    if (ed.dataset.ed === 'reset') { delete S.layout[TAB]; save(); renderPage(); toast(t('layoutReset')); }
    else setEdit(false);
  }
});
function setEdit(on) { EDIT = on; $('#editBtn').classList.toggle('on', on); renderPage(); if (on) scrollTo({ top: 0, behavior: 'smooth' }); }
function setTab(tab) {
  if (EDIT) setEdit(false);
  TAB = tab;
  $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $$('.page').forEach(p => p.classList.toggle('active', p.dataset.tab === tab));
  $('#infoBtn').classList.toggle('hidden', tab !== 'quran');
  renderPage(tab); scrollTo({ top: 0 });
  if (tab === 'quran' && !S.seenAudioHelp) setTimeout(() => openAudioHelp(), 350);
}
function greeting() {
  const h = new Date().getHours();
  const k = h < 5 ? 'gNight' : h < 11 ? 'gMorning' : h < 17 ? 'gDay' : h < 22 ? 'gEvening' : 'gNight';
  return t(k) + (S.name ? ', ' + S.name : '');
}
function renderTop() {
  $('#greet').textContent = greeting() + ' 👋';
  $$('#tabbar button').forEach(b => b.querySelector('span').textContent = t('tab_' + b.dataset.tab));
}
function applyTheme() {
  const r = document.documentElement;
  r.dataset.theme = S.theme; r.lang = S.lang; r.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  const c = getComputedStyle(r).getPropertyValue('--bg1').trim();
  $('meta[name="theme-color"]').setAttribute('content', c || '#002b27');
  applyIcon();
}
const APP_ICONS = ['gruen', 'kaaba_gruen', 'moschee_gruen'];
function applyIcon() {
  const k = APP_ICONS.includes(S.appIcon) ? S.appIcon : 'gruen';
  $('link[rel="apple-touch-icon"]').href = `icons/alt/${k}-180.png`;
  $('link[rel="icon"]').href = `icons/alt/${k}-180.png`;
  $$('img.logo, img.about-icon').forEach(i => i.src = `icons/alt/${k}-512.png`);
}

/* ---------------- Start ---------------- */
function boot() {
  loadState(); applyTheme();
  $('#tabbar').innerHTML = [['start', 'moonstar'], ['prayer', 'prayer'], ['quran', 'book'], ['calendar', 'cal']]
    .map(([k, i]) => `<button data-tab="${k}">${icon(i)}<span></span></button>`).join('');
  $('#tabbar').onclick = e => { const b = e.target.closest('button'); if (b) setTab(b.dataset.tab); };
  $('#editBtn').innerHTML = icon('pen'); $('#setBtn').innerHTML = icon('gear');
  $('#editBtn').onclick = () => setEdit(!EDIT);
  $('#infoBtn').innerHTML = icon('info'); $('#infoBtn').onclick = () => openTajweed();
  $('#setBtn').onclick = () => openSettings();
  $('#totop').innerHTML = icon('up');
  $('#totop').onclick = () => { const v = $$('.view.show').pop(); (v ? v.querySelector('.v-b') : window).scrollTo({ top: 0, behavior: 'smooth' }); };
  addEventListener('scroll', () => $('#totop').classList.toggle('show', scrollY > 320 && !document.body.classList.contains('in-view')), { passive: true });
  // Zoom verhindern (iOS ignoriert user-scalable teilweise)
  ['gesturestart', 'gesturechange'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
  renderAll(); setTab('start');
  setInterval(tick, 1000);
  initSW();
  setTimeout(() => { remindMissed(); autoLocate(); }, 800);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderPage('start'); setTimeout(remindMissed, 500); } });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
let lastMinute = -1, lastDay = null;
function tick() {
  const now = new Date();
  $$('[data-countdown]').forEach(el => { el.textContent = fmtDur(+el.dataset.countdown - now); });
  if (now.getMinutes() !== lastMinute) {
    lastMinute = now.getMinutes();
    const pd = prayerDayKey(); if (pd !== lastDay) { if (lastDay) prayerDay = pd; lastDay = pd; }
    if (!EDIT && !document.body.classList.contains('in-view')) { renderPage('start'); if (TAB === 'prayer') renderPage('prayer'); }
    renderTop();
  }
}

/* ---------------- Service Worker / Aktualisierung ---------------- */
let SWREG = null, UPDATE_READY = false;
function initSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    if (navigator.onLine) navigator.serviceWorker.ready.then(r => r.active && r.active.postMessage('fillExtra'));
    SWREG = reg;
    const watch = w => w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) onUpdateFound(); });
    if (reg.waiting && navigator.serviceWorker.controller) onUpdateFound();
    reg.addEventListener('updatefound', () => watch(reg.installing));
    if (S.autoUpdate && navigator.onLine) reg.update().catch(() => {});
  }).catch(() => {});
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading) return; reloading = true; save(true); location.reload(); });
}
function onUpdateFound() {
  UPDATE_READY = true;
  if (S.autoUpdate) applyUpdate();
  else toast(t('updAvail'));
}
function applyUpdate() { if (SWREG && SWREG.waiting) SWREG.waiting.postMessage('skipWaiting'); }
/* Version direkt vom Server lesen – am Browser- und CDN-Cache vorbei */
async function serverVersion() {
  const r = await fetch('sw.js?v=' + Date.now(), { cache: 'no-store' });
  const m = (await r.text()).match(/VERSION = 'nur-v([\d.]+)'/);
  return m ? m[1] : null;
}
/* wartet, bis der neue Service Worker fertig installiert ist (oder scheitert) */
function waitInstalled(reg, max = 120000) {
  const t0 = Date.now();
  return new Promise(ok => {
    const tick = () => {
      if (reg.waiting) return ok(true);
      if (!reg.installing && Date.now() - t0 > 4000) return ok(false);
      if (Date.now() - t0 > max) return ok(false);
      setTimeout(tick, 400);
    };
    tick();
  });
}
function hardReload() {
  const keep = k => k.startsWith('nur-extra');
  caches.keys().then(ks => Promise.all(ks.filter(k => !keep(k)).map(k => caches.delete(k))))
    .then(() => navigator.serviceWorker ? navigator.serviceWorker.getRegistrations() : [])
    .then(rs => Promise.all(rs.map(r => r.unregister())))
    .finally(() => { save(true); location.replace(location.pathname + '?r=' + Date.now()); });
}
async function checkUpdate() {
  if (!navigator.onLine) return toast(t('offline'));
  toast(t('updChecking'));
  let sv;
  try { sv = await serverVersion(); } catch (e) { return toast(t('updFail')); }
  if (!sv || sv === APP.version) return toast(t('updNone') + ' (' + APP.version + ')', 3500);
  if (!SWREG) return hardReload();
  toast(t('updLoading', { v: sv }), 60000);
  if (!SWREG.waiting) { try { await SWREG.update(); } catch (e) {} }
  if (await waitInstalled(SWREG)) { UPDATE_READY = true; applyUpdate(); return; }
  if (confirm(t('updHard', { v: sv, c: APP.version }))) hardReload(); else toast(t('updFail'));
}
