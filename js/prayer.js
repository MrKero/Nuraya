/* Nuraya – Gebetszeiten, Abhaken, Statistik, Qibla */
'use strict';
const PKEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const FARD = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PNAMES = {
  tr: { fajr: 'Sabah', sunrise: 'Güneş', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı' },
  ar: { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' },
  latin: { fajr: 'Fajr', sunrise: 'Shuruq', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
  de: { fajr: 'Morgengebet', sunrise: 'Sonnenaufgang', dhuhr: 'Mittagsgebet', asr: 'Nachmittagsgebet', maghrib: 'Abendgebet', isha: 'Nachtgebet' },
};
const SUNSET_SVG = '<svg class="pe" viewBox="0 0 28 24" aria-hidden="true"><defs><linearGradient id="sunG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd36b"/><stop offset="1" stop-color="#ff7a3d"/></linearGradient><linearGradient id="mtG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b8f6f"/><stop offset="1" stop-color="#2c5443"/></linearGradient></defs><g stroke="#ffb54d" stroke-width="1.6" stroke-linecap="round"><path d="M14 2.2v2.4M6.6 5.3l1.6 1.7M21.4 5.3l-1.6 1.7M3.2 11.6h2.3M22.5 11.6h2.3"/></g><circle cx="14" cy="13" r="6.2" fill="url(#sunG)"/><path d="M0 22.5 8.2 11.8l4.2 4.6 4.4-6.4L28 22.5z" fill="url(#mtG)"/><path d="M8.2 11.8 10.3 14.5 9.1 14.3 8.2 15.4 7.4 14.2 6.4 14.4z" fill="#e9f3ee"/><path d="M16.8 10l2.6 3.9-1.4-.2-1.2 1.3-1-1.4-1.3.3z" fill="#e9f3ee"/></svg>';
const PEMOJI = { fajr: '✨', sunrise: '🌅', dhuhr: '☀️', asr: '🌤️', maghrib: SUNSET_SVG, isha: '🌙' };
const pname = k => (PNAMES[S.pnames] || PNAMES.tr)[k];

const METHODS = {
  diyanet_eu: { label: 'Diyanet (Europa)', make: () => { const p = adhan.CalculationMethod.Other(); p.fajrAngle = 18; p.ishaAngle = 17; p.methodAdjustments = { fajr: 0, sunrise: -3, dhuhr: 0, asr: 1, maghrib: 3, isha: -3 }; return p; } },
  turkey: { label: 'Diyanet (Türkiye)', make: () => adhan.CalculationMethod.Turkey() },
  mwl: { label: 'Muslim World League', make: () => adhan.CalculationMethod.MuslimWorldLeague() },
  isna: { label: 'ISNA (Nordamerika)', make: () => adhan.CalculationMethod.NorthAmerica() },
  egypt: { label: 'Egyptian Authority', make: () => adhan.CalculationMethod.Egyptian() },
  makkah: { label: 'Umm al-Qura (Mekka)', make: () => adhan.CalculationMethod.UmmAlQura() },
  msc: { label: 'Moonsighting Committee', make: () => adhan.CalculationMethod.MoonsightingCommittee() },
};

/* Datum + Uhrzeit (in Zeitzone tz) -> echter Zeitpunkt */
function zoned(y, m, d, hh, mm, tz) {
  let ts = Date.UTC(y, m - 1, d, hh, mm);
  for (let i = 0; i < 2; i++) {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
      .formatToParts(new Date(ts)).reduce((o, x) => (o[x.type] = +x.value, o), {});
    const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute);
    ts -= asUTC - Date.UTC(y, m - 1, d, hh, mm);
  }
  return new Date(ts);
}
const timesCache = new Map();
/* Ort für einen Tag: geplante Reise hat Vorrang vor dem Standard-Standort */
function locFor(key) {
  const tr = (S.trips || []).find(x => x.from <= key && key <= x.to);
  return tr ? tr.place : S.loc;
}
function kmBetween(a, b) {
  const r = Math.PI / 180, dφ = (b.lat - a.lat) * r, dλ = (b.lon - a.lon) * r;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dλ / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}
function calcTimes(key, L) {
  const [y, m, d] = key.split('-').map(Number);
  const c = new adhan.Coordinates(L.lat, L.lon);
  const p = (METHODS[S.method] || METHODS.diyanet_eu).make();
  p.madhab = S.asr === 'hanafi' ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  p.highLatitudeRule = adhan.HighLatitudeRule.recommended(c);
  p.adjustments = { ...S.adj };
  const pt = new adhan.PrayerTimes(c, new Date(y, m - 1, d), p);
  const o = {}; PKEYS.forEach(k => o[k] = pt[k]); return o;
}
/* Liefert die Zeiten eines Tages – aus Download (falls gewählt & vorhanden) oder berechnet */
function getTimes(key) {
  const L = locFor(key);
  const ck = key + '|' + S.timeSource + S.method + S.asr + JSON.stringify(S.adj) + L.lat + L.lon;
  if (timesCache.has(ck)) return timesCache.get(ck);
  let o = null;
  const dlOk = S.timeSource === 'dl' && S.dl && S.dl.days && S.dl.days[key] && (!S.dl.loc || kmBetween(S.dl.loc, L) < 30);
  if (dlOk) {
    const r = S.dl.days[key], [y, m, d] = key.split('-').map(Number), tz = L.tz || S.dl.tz;
    o = { src: 'dl' };
    PKEYS.forEach((k, i) => { const [hh, mm] = r[i].split(':').map(Number); o[k] = zoned(y, m, d, hh, mm, tz); });
  } else { o = calcTimes(key, L); o.src = 'calc'; }
  o.tz = L.tz; o.place = L.name;
  if (timesCache.size > 400) timesCache.clear();
  timesCache.set(ck, o); return o;
}
function clearTimes() { timesCache.clear(); }
/* Aktuelles / nächstes Gebet */
function prayerState(now = new Date()) {
  const tk = keyOf(now), T = getTimes(tk), Y = getTimes(keyOf(addDays(now, -1))), N = getTimes(keyOf(addDays(now, 1)));
  let cur = null, curStart, curEnd, curDay = tk;
  if (now < T.fajr) { cur = 'isha'; curStart = Y.isha; curEnd = T.fajr; curDay = keyOf(addDays(now, -1)); }
  else if (now < T.sunrise) { cur = 'fajr'; curStart = T.fajr; curEnd = T.sunrise; }
  else if (now < T.dhuhr) { cur = null; }
  else if (now < T.asr) { cur = 'dhuhr'; curStart = T.dhuhr; curEnd = T.asr; }
  else if (now < T.maghrib) { cur = 'asr'; curStart = T.asr; curEnd = T.maghrib; }
  else if (now < T.isha) { cur = 'maghrib'; curStart = T.maghrib; curEnd = T.isha; }
  else { cur = 'isha'; curStart = T.isha; curEnd = N.fajr; }
  let next, nextAt;
  for (const k of PKEYS) if (T[k] > now) { next = k; nextAt = T[k]; break; }
  if (!next) { next = 'fajr'; nextAt = N.fajr; }
  return { cur, curStart, curEnd, curDay, next, nextAt, T };
}
/* Aktueller Gebetstag: vor Sabah gehört die Nacht noch zum Vortag */
function prayerDayKey(now = new Date()) { const st = prayerState(now); return st.cur === 'isha' && st.curDay !== keyOf(now) ? st.curDay : keyOf(now); }
/* Ende eines Gebetszeitraums (für Kaza-Erkennung) */
function prayerEnd(key, k) {
  const T = getTimes(key);
  return { fajr: T.sunrise, dhuhr: T.asr, asr: T.maghrib, maghrib: T.isha, isha: getTimes(keyOf(addDays(fromKey(key), 1))).fajr }[k];
}
const pstat = (key, k) => (S.prayers[key] || {})[k] || 0; // 0 = offen, 1 = gebetet, 2 = Kaza
function setP(key, k, v) {
  const d = S.prayers[key] ||= {};
  if (v) d[k] = v; else delete d[k];
  if (!Object.keys(d).length) delete S.prayers[key];
  save();
}
function togglePrayer(key, k) {
  const now = new Date(), start = getTimes(key)[k];
  if (start > now) return toast(t('notYet'));
  const v = pstat(key, k);
  if (!v) {
    // nach Ablauf der Zeit nachfragen: rechtzeitig gebetet (nur später eingetragen) oder Kaza?
    if (prayerEnd(key, k) < now) return prayerMenu(key, k, true);
    setP(key, k, 1); haptic();
  } else setP(key, k, 0);
  renderPage('prayer'); renderPage('start');
}
/* Gebete, deren Zeit abgelaufen ist und die noch nicht eingetragen wurden (letzte 3 Tage) */
function missedPrayers() {
  const now = new Date(), out = [];
  for (let i = 2; i >= 0; i--) {
    const key = keyOf(addDays(now, -i)); if (key < S.since) continue;
    FARD.forEach(k => { if (!pstat(key, k) && !S.dismissed[key + '|' + k] && prayerEnd(key, k) < now) out.push([key, k]); });
  }
  return out;
}
function cleanDismissed() { const cut = keyOf(addDays(new Date(), -5)); Object.keys(S.dismissed).forEach(x => { if (x < cut) delete S.dismissed[x]; }); }
let lastRemind = 0;
function remindMissed() {
  if (!S.remind || Date.now() - lastRemind < 30 * 60e3) return; const n = missedPrayers().length;
  if (n) lastRemind = Date.now();
  if (n) toast(t(n === 1 ? 'missedOne' : 'missedMany', { n }), 3500);
}
registerSection('start', {
  id: 'missed', title: () => t('secMissed'),
  render() {
    if (!S.remind) return EDIT ? `<div class="card muted small">${t('remindOff')}</div>` : '';
    const M = missedPrayers();
    if (!M.length) return EDIT ? `<div class="card muted small">${t('missedNone')}</div>` : '';
    const days = {}; M.forEach(([key, k]) => (days[key] ||= []).push(k));
    return `<div class="card" style="border-color:var(--warn)"><div class="row" style="margin-bottom:6px"><span style="font-size:22px">🔔</span><div class="grow"><b style="font-size:17px">${t('missedTitle')}</b><div class="muted small">${t('missedSub')}</div></div></div>
      ${Object.entries(days).map(([key, ks]) => `<div style="padding:10px 0;border-top:1px solid var(--line)"><div class="row"><b class="grow">${key === todayKey() ? t('today') : fmtDate(fromKey(key), { weekday: 'long', day: 'numeric', month: 'short' })}</b>
        <button class="btn sm pri" data-md="${key}|all">${icon('check')} ${ks.length > 1 ? t('allOnTime') : t('onTime')}</button><button class="btn sm" data-md="${key}|x" aria-label="ignore">${icon('close')}</button></div>
        <div class="chip-row" style="margin-top:8px">${ks.map(k => `<button class="pill" data-mp="${key}|${k}"><span>${pname(k)} · ${fmtTime(getTimes(key)[k], getTimes(key).tz)}</span></button>`).join('')}</div></div>`).join('')}
      <div class="tiny" style="margin-top:4px">${t('missedHint')}</div></div>`;
  },
  after(el) {
    const M = missedPrayers();
    $$('[data-md]', el).forEach(b => b.onclick = () => {
      const [key, v] = b.dataset.md.split('|');
      M.filter(m => m[0] === key).forEach(([d, k]) => { if (v === 'x') S.dismissed[d + '|' + k] = 1; else setP(d, k, 1); });
      if (v === 'x') cleanDismissed(); else haptic(); save(); renderPage('start'); renderPage('prayer');
    });
    $$('[data-mp]', el).forEach(b => b.onclick = () => { const [key, k] = b.dataset.mp.split('|'); prayerMenu(key, k, true); });
  },
});
let lpTimer = null;
function bindChecks(root) {
  $$('.chk[data-p]', root).forEach(b => {
    const [key, k] = b.dataset.p.split('|');
    let longDone = false;
    b.addEventListener('touchstart', () => { longDone = false; lpTimer = setTimeout(() => { longDone = true; prayerMenu(key, k); }, 520); }, { passive: true });
    ['touchend', 'touchmove', 'touchcancel'].forEach(ev => b.addEventListener(ev, () => clearTimeout(lpTimer), { passive: true }));
    b.addEventListener('contextmenu', e => { e.preventDefault(); prayerMenu(key, k); });
    b.addEventListener('click', () => { if (!longDone) togglePrayer(key, k); });
  });
}
function prayerMenu(key, k, late) {
  haptic();
  const d = fromKey(key);
  const sh = openSheet(`${pname(k)} · ${fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })}`, `${late ? `<p class="muted" style="margin:0 4px 12px">${t('lateAsk')}</p>` : ''}
    <div class="set-box">
      <button class="set-row" style="width:100%" data-v="1"><span class="chk ok"><i>${icon('check')}</i></span><span class="grow" style="text-align:start"><b>${t('prayedOnTime')}</b>${late ? `<span>${t('prayedOnTimeSub')}</span>` : ''}</span></button>
      <button class="set-row" style="width:100%" data-v="2"><span class="chk kaza"><i>${icon('repeat')}</i></span><span class="grow" style="text-align:start"><b>${t('prayedKaza')}</b></span></button>
      <button class="set-row" style="width:100%" data-v="0"><span class="chk"><i></i></span><span class="grow" style="text-align:start"><b>${t('notPrayed')}</b></span></button>
    </div>`);
  $$('[data-v]', sh.body).forEach(b => b.onclick = () => { setP(key, k, +b.dataset.v); sh.close(); renderPage('prayer'); renderPage('start'); });
}
const chkHtml = (key, k, disabled) => {
  const v = pstat(key, k);
  return `<button class="chk ${v === 1 ? 'ok' : v === 2 ? 'kaza' : ''}" data-p="${key}|${k}" ${disabled ? 'disabled' : ''} aria-label="${pname(k)}"><i>${v === 1 ? icon('check') : v === 2 ? icon('repeat') : ''}</i></button>`;
};
function ringSvg(frac, size = 42, stroke = 4, kaza = 0) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--card2)" stroke-width="${stroke}"/>
    ${frac > 0 ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c * frac} ${c}"/>` : ''}
    ${kaza > 0 ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--warn)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c * kaza} ${c}" stroke-dashoffset="${-c * frac}"/>` : ''}</svg>`;
}
function dayCounts(key) { let ok = 0, kz = 0; FARD.forEach(k => { const v = pstat(key, k); if (v === 1) ok++; if (v === 2) kz++; }); return { ok, kz }; }

/* ---------------- Abschnitte im Reiter „Gebet“ ---------------- */
let prayerDay = null, pView = 'day', monthOff = 0;
registerSection('prayer', {
  id: 'times', title: () => t('secTimes'),
  render() {
    if (!prayerDay) prayerDay = prayerDayKey();
    const now = new Date(), tk = todayKey(), sel = fromKey(prayerDay);
    const hd = hijriParts(sel);
    let strip = '';
    for (let i = -3; i <= 7; i++) {
      const d = addDays(now, i), k = keyOf(d), c = dayCounts(k);
      strip += `<button data-day="${k}" class="${k === prayerDay ? 'sel' : ''} ${k === tk ? 'today' : ''}">
        <span class="dring">${ringSvg(c.ok / 5, 42, 4, c.kz / 5)}${d.getDate()}</span><span class="wd">${fmtDate(d, { weekday: 'narrow' })}</span></button>`;
    }
    const T = getTimes(prayerDay), st = prayerState(now);
    const rows = PKEYS.map(k => {
      if (k === 'sunrise') return `<div class="pr sun"><span class="pn">${pname(k)}</span><span class="pt">${fmtTime(T[k], T.tz)}</span></div>`;
      const isNow = prayerDay === st.curDay && st.cur === k, past = T[k] < now;
      return `<div class="pr ${isNow ? 'now' : ''} ${past ? 'past' : ''}">${chkHtml(prayerDay, k, T[k] > now)}
        <span class="pn">${pname(k)} <em>${PEMOJI[k]}</em></span>${isNow ? `<span class="badge">${t('now')}</span>` : ''}<span class="pt">${fmtTime(T[k], T.tz)}</span></div>`;
    }).join('');
    const src = T.src === 'dl' ? t('srcDl') : (METHODS[S.method] || METHODS.diyanet_eu).label;
    return `<div class="sec-h"><div><h2>${prayerDay === tk ? t('today') : fmtDate(sel, { weekday: 'long' })}, ${fmtDate(sel, { day: 'numeric', month: 'long' })}</h2>
        <div class="muted small" style="margin-top:3px">${hijriStr(sel)} ${t('ah')}</div></div></div>
      <div class="dstrip" id="dstrip">${strip}</div>
      <div class="chip-row" style="margin:8px 0 14px"><button class="pill" data-loc>${icon(T.place !== S.loc.name ? 'cal' : 'pin')}<span>${esc(T.place)}${T.place !== S.loc.name ? ' · ' + t('trip') : ''}</span></button><span class="pill"><span>${esc(src)}</span></span></div>
      <div class="plist">${rows}</div>`;
  },
  after(el) {
    $$('[data-day]', el).forEach(b => b.onclick = () => { prayerDay = b.dataset.day; renderPage('prayer'); });
    $('[data-loc]', el).onclick = openLocation;
    bindChecks(el);
    const sel = $('.sel', el); if (sel) sel.scrollIntoView({ inline: 'center', block: 'nearest' });
  },
});
registerSection('prayer', {
  id: 'timer', title: () => t('secTimer'),
  render() {
    const now = new Date(), st = prayerState(now);
    let main = '', frac = 0;
    if (st.cur) {
      frac = (now - st.curStart) / (st.curEnd - st.curStart);
      main = `<div class="grow"><div class="muted small">${t('timeLeftFor', { p: pname(st.cur) })}</div>
        <div class="clock" data-countdown="${+st.curEnd}">${fmtDur(st.curEnd - now)}</div>
        <div class="muted small">${t('nextAt', { p: pname(st.next), t: fmtTime(st.nextAt, st.T.tz) })}</div></div>`;
    } else {
      main = `<div class="grow"><div class="muted small">${t('untilNext', { p: pname(st.next) })}</div>
        <div class="clock" data-countdown="${+st.nextAt}">${fmtDur(st.nextAt - now)}</div>
        <div class="muted small">${t('noPrayerNow')}</div></div>`;
    }
    return `<div class="card timer"><div class="ring-wrap">${ringSvg(Math.max(0, Math.min(1, frac)), 64, 6)}</div>${main}</div>`;
  },
});
registerSection('prayer', {
  id: 'overview', title: () => t('secOverview'),
  render() {
    const seg = `<div class="seg" style="margin-bottom:12px">${['week', 'month'].map(v => `<button data-pv="${v}" class="${(pView === v || (pView === 'day' && v === 'week')) ? 'on' : ''}">${t(v)}</button>`).join('')}</div>`;
    return `<div class="sec-h"><h2>${t('secOverview')}</h2></div><div class="card">${seg}${pView === 'month' ? monthView() : weekView()}</div>`;
  },
  after(el) {
    $$('[data-pv]', el).forEach(b => b.onclick = () => { pView = b.dataset.pv; renderPage('prayer'); });
    $$('[data-mo]', el).forEach(b => b.onclick = () => { monthOff += +b.dataset.mo; renderPage('prayer'); });
    $$('[data-goday]', el).forEach(b => b.onclick = () => { prayerDay = b.dataset.goday; renderPage('prayer'); scrollTo({ top: 0, behavior: 'smooth' }); });
    bindChecks(el);
  },
});
function weekView() {
  const now = new Date(), start = addDays(now, -((now.getDay() - S.weekStart + 7) % 7));
  let rows = '';
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i), k = keyOf(d), T = getTimes(k);
    rows += `<tr><td>${fmtDate(d, { weekday: 'short', day: 'numeric' })}</td>${FARD.map(p => {
      const v = pstat(k, p), fut = T[p] > now;
      return `<td>${fut ? `<span class="dot fut"></span>` : chkHtml(k, p).replace('class="chk', 'style="width:30px;height:30px;background:none" class="chk')}</td>`;
    }).join('')}</tr>`;
  }
  return `<table class="week"><tr><th></th>${FARD.map(p => `<th>${pname(p).slice(0, 6)}</th>`).join('')}</tr>${rows}</table>
    <div class="legend"><span><i style="background:var(--accent)"></i>${t('onTime')}</span><span><i style="background:var(--warn)"></i>${t('kaza')}</span></div>`;
}
function monthView() {
  const now = new Date(), m0 = new Date(now.getFullYear(), now.getMonth() + monthOff, 1);
  const first = addDays(m0, -((m0.getDay() - S.weekStart + 7) % 7));
  let cells = '';
  for (let i = 0; i < 7; i++) cells += `<div class="wh">${fmtDate(addDays(first, i), { weekday: 'narrow' })}</div>`;
  for (let i = 0; i < 42; i++) {
    const d = addDays(first, i), k = keyOf(d), c = dayCounts(k);
    if (i >= 35 && d.getMonth() !== m0.getMonth()) break;
    cells += `<button class="md ${d.getMonth() !== m0.getMonth() ? 'out' : ''} ${k === todayKey() ? 'today' : ''}" data-goday="${k}">${ringSvg(c.ok / 5, 40, 3.5, c.kz / 5)}<span style="position:relative">${d.getDate()}</span></button>`;
  }
  return `<div class="cal-h"><button class="rbtn" data-mo="-1">${icon('chevl')}</button><div class="t"><b>${fmtDate(m0, { month: 'long', year: 'numeric' })}</b></div><button class="rbtn" data-mo="1">${icon('chev')}</button></div>
    <div class="mgrid">${cells}</div>`;
}
registerSection('prayer', {
  id: 'stats', title: () => t('secStats'),
  render() {
    let ok = 0, kz = 0, streak = 0, best = 0, run = 0;
    const keys = Object.keys(S.prayers).sort();
    keys.forEach(k => { const c = dayCounts(k); ok += c.ok; kz += c.kz; });
    // Serie: aufeinanderfolgende Tage mit allen 5 Gebeten pünktlich (heute zählt, falls schon komplett)
    const first = keys.length ? fromKey(keys[0]) : new Date();
    for (let d = new Date(first); keyOf(d) <= todayKey(); d = addDays(d, 1)) {
      const c = dayCounts(keyOf(d));
      if (c.ok + c.kz === 5) { run++; best = Math.max(best, run); } else if (keyOf(d) !== todayKey()) run = 0;
    }
    streak = run;
    let bars = '';
    for (let i = 29; i >= 0; i--) {
      const k = keyOf(addDays(new Date(), -i)), c = dayCounts(k);
      bars += `<div title="${k}"><i class="a" style="height:${c.ok * 20}%"></i><i class="k" style="height:${c.kz * 20}%"></i></div>`;
    }
    return `<div class="sec-h"><h2>${t('secStats')}</h2></div><div class="card">
      <div class="stats"><div><b>${fmtNum(ok)}</b><span>${t('onTime')}</span></div><div><b>${fmtNum(kz)}</b><span>${t('kaza')}</span></div><div><b>${streak}🔥</b><span>${t('streak')}</span></div></div>
      <div class="bars">${bars}</div>
      <div class="legend"><span><i style="background:var(--accent)"></i>${t('onTime')}</span><span><i style="background:var(--warn)"></i>${t('kaza')}</span><span style="margin-inline-start:auto">${t('last30')}</span></div>
      <div class="tiny" style="margin-top:8px">${t('bestStreak', { n: best })}</div></div>`;
  },
});
registerSection('prayer', {
  id: 'qibla', title: () => t('qibla'),
  render() {
    const q = qiblaBearing();
    return `<div class="sec-h"><h2>${t('qibla')}</h2></div><button class="card qcard" style="width:100%;text-align:start" data-qibla>
      <div class="mini">${compassSvg(S.compass, 64)}</div>
      <div class="grow"><b style="font-size:17px">${t('qiblaDir', { d: Math.round(q) })} (${cardinal(q)})</b>
      <div class="muted small" style="margin-top:3px">${t('qiblaDist', { km: fmtNum(Math.round(distMecca())) })}</div></div>${icon('chev')}</button>`;
  },
  after(el) { $('[data-qibla]', el).onclick = openQibla; },
});

/* ---------------- Start-Karte „Aktuelles Gebet“ ---------------- */
function prayerNowCard() {
  const now = new Date(), st = prayerState(now), tk = todayKey(), T = st.T;
  const head = st.cur
    ? `<div class="row"><div class="grow"><div class="muted small">${t('currentPrayer')}</div><div style="font-size:26px;font-weight:800;margin-top:2px">${pname(st.cur)} ${PEMOJI[st.cur]} <span class="badge" style="vertical-align:4px">${t('now')}</span></div></div>
       <div style="text-align:end"><div class="muted small">${t('endsIn')}</div><div style="font-size:22px;font-weight:800;font-variant-numeric:tabular-nums" data-countdown="${+st.curEnd}">${fmtDur(st.curEnd - now)}</div></div></div>`
    : `<div class="row"><div class="grow"><div class="muted small">${t('nextPrayer')}</div><div style="font-size:26px;font-weight:800;margin-top:2px">${pname(st.next)} ${PEMOJI[st.next]}</div></div>
       <div style="text-align:end"><div class="muted small">${t('startsIn')}</div><div style="font-size:22px;font-weight:800;font-variant-numeric:tabular-nums" data-countdown="${+st.nextAt}">${fmtDur(st.nextAt - now)}</div></div></div>`;
  // Ein Gebetstag reicht von Sabah bis zum nächsten Sabah: nach Mitternacht gehört Yatsı noch zum Vortag
  const dk = prayerDayKey(now), D = getTimes(dk), prev = dk !== tk;
  const mini = FARD.map(k => `<div style="flex:1;text-align:center">${chkHtml(dk, k, D[k] > now)}
      <div class="tiny" style="margin-top:4px;color:${st.cur === k ? 'var(--fg)' : ''}">${pname(k)}</div><div class="tiny">${fmtTime(D[k], D.tz)}</div></div>`).join('');
  return `<div class="card">${head}${prev ? `<div class="tiny" style="margin-top:12px">${t('prayerDayPrev', { d: fmtDate(fromKey(dk), { weekday: 'long', day: 'numeric', month: 'short' }) })}</div>` : ''}<div class="row" style="margin-top:${prev ? 8 : 16}px;gap:4px">${mini}</div></div>`;
}

/* ---------------- Standort, gespeicherte Orte, Reisen ---------------- */
let CITYDB = null;
async function cityDB() { if (!CITYDB) { try { CITYDB = await (await fetch('data/cities.json')).json(); } catch (e) { CITYDB = CITIES.map(c => [c[0], '', c[2], c[3]]); } } return CITYDB; }
let regionNames = null;
function countryName(cc) {
  if (!cc) return '';
  try { regionNames = regionNames && regionNames.lang === S.lang ? regionNames : Object.assign(new Intl.DisplayNames([locale()], { type: 'region' }), { lang: S.lang }); return regionNames.of(cc); } catch (e) { return cc; }
}
function tzOf(lat, lon) { try { return tzlookup(lat, lon); } catch (e) { return Intl.DateTimeFormat().resolvedOptions().timeZone; } }
function mkPlace(name, cc, lat, lon) { return { name, cc: cc || '', lat: +(+lat).toFixed(4), lon: +(+lon).toFixed(4), tz: tzOf(+lat, +lon) }; }
async function nearestCity(lat, lon) {
  const db = await cityDB(); let best = null, bd = 1e9;
  for (const c of db) { const d = Math.abs(c[2] - lat) + Math.abs(c[3] - lon) * Math.cos(lat * Math.PI / 180); if (d < bd) { bd = d; best = c; } }
  return best && kmBetween({ lat, lon }, { lat: best[2], lon: best[3] }) < 25 ? best : null;
}
function setHome(P, quiet) {
  S.loc = P; clearTimes(); save(); renderAll();
  if (!quiet) toast(t('locSet', { n: P.name }));
}
const placeLabel = P => `${esc(P.name)}${P.cc ? ', ' + esc(countryName(P.cc)) : ''}`;
function gpsPlace() {
  return new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(new Error('no'));
    navigator.geolocation.getCurrentPosition(async p => {
      const { latitude: la, longitude: lo } = p.coords, c = await nearestCity(la, lo);
      res(c ? mkPlace(c[0], c[1], la, lo) : mkPlace(`${la.toFixed(3)}, ${lo.toFixed(3)}`, '', la, lo));
    }, rej, { enableHighAccuracy: false, timeout: 15000, maximumAge: 1800e3 });
  });
}
/* Beim Öffnen prüfen, ob man woanders ist (nur auf dem Gerät, ohne Internet) */
async function autoLocate() {
  if (!S.autoLoc) return;
  try {
    const P = await gpsPlace();
    if (kmBetween(P, S.loc) > 15) { setHome(P, true); toast(t('autoLocMoved', { n: P.name }), 3500); }
  } catch (e) {}
}
function openLocation() {
  const sh = openSheet(t('location'), '');
  const draw = () => {
    const trips = (S.trips || []).slice().sort((a, b) => a.from < b.from ? -1 : 1);
    sh.body.innerHTML = `
    <div class="card row" style="margin-bottom:12px">${icon('pin')}<div class="grow"><div class="muted small">${t('currentLoc')}</div><b style="font-size:17px">${placeLabel(S.loc)}</b><div class="tiny">${S.loc.tz} · ${S.loc.lat}, ${S.loc.lon}</div></div></div>
    <button class="btn pri full" data-gps>${icon('gps')} ${t('useGps')}</button>
    <div class="set-box" style="margin:10px 0 6px"><div class="set-row"><span class="grow"><b>${t('autoLoc')}</b><span>${t('autoLocSub')}</span></span><label class="switch"><input type="checkbox" data-autoloc ${S.autoLoc ? 'checked' : ''}><i></i></label></div></div>
    <p class="tiny" style="margin:0 4px 14px">${t('gpsNote')}</p>
    <div class="search">${icon('search')}<input id="cityQ" placeholder="${t('searchCityWorld')}" autocomplete="off"></div>
    <div id="cityL"></div>
    ${S.places.length ? `<div class="set-sec" style="margin-top:16px"><h4>${t('savedPlaces')}</h4><div class="set-box">${S.places.map((P, i) => `<div class="set-row"><button class="grow" style="text-align:start" data-usep="${i}"><b>${placeLabel(P)}</b><span>${P.tz}</span></button><button class="rbtn" data-tripp="${i}">${icon('cal')}</button><button class="rbtn" data-delp="${i}">${icon('trash')}</button></div>`).join('')}</div></div>` : ''}
    <div class="set-sec" style="margin-top:16px"><h4>${t('trips')}</h4><div class="set-box">${trips.length ? trips.map(tr => `<div class="set-row"><span class="grow"><b>${placeLabel(tr.place)}</b><span>${fmtDate(fromKey(tr.from), { day: 'numeric', month: 'short' })} – ${fmtDate(fromKey(tr.to), { day: 'numeric', month: 'short', year: 'numeric' })}${tr.from <= todayKey() && todayKey() <= tr.to ? ' · ' + t('activeNow') : ''}</span></span><button class="rbtn" data-delt="${tr.id}">${icon('trash')}</button></div>`).join('') : `<div class="set-row"><span class="grow"><span>${t('tripsNone')}</span></span></div>`}</div></div>
    <details class="help card" style="margin-top:14px;padding:0"><summary>${t('manualCoords')}</summary><div>
      <input id="mName" placeholder="${t('name')}" style="width:100%;margin-bottom:8px;background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:10px">
      <div class="row"><input id="mLat" inputmode="decimal" placeholder="Lat 50.77" style="width:50%;background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:10px">
      <input id="mLon" inputmode="decimal" placeholder="Lon 6.08" style="width:50%;background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:10px"></div>
      <button class="btn full" style="margin-top:10px" data-man>${t('next')}</button></div></details>`;
    bind();
  };
  const results = async q => {
    const L = $('#cityL', sh.body); if (!L) return;
    q = q.trim().toLocaleLowerCase(); if (q.length < 2) { L.innerHTML = ''; return; }
    const db = await cityDB(), norm = x => x.toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), nq = norm(q);
    const hits = []; for (const c of db) { const n = norm(c[0]); if (n.startsWith(nq) || (nq.length > 3 && n.includes(nq))) { hits.push(c); if (hits.length >= 40) break; } }
    L.innerHTML = hits.map(c => `<button class="city" style="width:100%" data-c='${esc(JSON.stringify(c))}'><b>${esc(c[0])}</b><span>${esc(countryName(c[1]))}</span></button>`).join('') || `<div class="empty">${t('noResults')}</div>`;
  };
  // Aktion für einen gewählten Ort: als Standort, speichern oder Reise planen
  const choose = P => {
    const a = openSheet(placeLabel(P), `<div class="set-box">
      <button class="set-row" style="width:100%" data-a="use">${icon('pin')}<span class="grow" style="text-align:start"><b>${t('useAsLoc')}</b></span></button>
      <button class="set-row" style="width:100%" data-a="save">${icon('star')}<span class="grow" style="text-align:start"><b>${t('savePlace')}</b></span></button>
      <button class="set-row" style="width:100%" data-a="trip">${icon('cal')}<span class="grow" style="text-align:start"><b>${t('planTrip')}</b><span>${t('planTripSub')}</span></span></button></div>`);
    a.body.onclick = e => {
      const x = e.target.closest('[data-a]'); if (!x) return; a.close();
      if (x.dataset.a === 'use') { setHome(P); sh.close(); }
      if (x.dataset.a === 'save') { if (!S.places.some(q => q.name === P.name && q.cc === P.cc)) S.places.push(P); save(); toast(t('placeSaved')); draw(); }
      if (x.dataset.a === 'trip') planTrip(P, draw);
    };
  };
  const bind = () => {
    const b = sh.body;
    $('#cityQ', b).oninput = e => results(e.target.value);
    $('[data-autoloc]', b).onchange = e => { S.autoLoc = e.target.checked; save(); if (S.autoLoc) autoLocate(); };
    $('[data-gps]', b).onclick = async () => {
      toast(t('gpsWait'));
      try { const P = await gpsPlace(); setHome(P); draw(); } catch (e) { toast(navigator.geolocation ? t('gpsDenied') : t('gpsNo')); }
    };
    b.onclick = e => {
      const c = e.target.closest('[data-c]'); if (c) { const x = JSON.parse(c.dataset.c); choose(mkPlace(x[0], x[1], x[2], x[3])); }
      const u = e.target.closest('[data-usep]'); if (u) { setHome(S.places[+u.dataset.usep]); draw(); }
      const tp = e.target.closest('[data-tripp]'); if (tp) planTrip(S.places[+tp.dataset.tripp], draw);
      const dp = e.target.closest('[data-delp]'); if (dp) { S.places.splice(+dp.dataset.delp, 1); save(); draw(); }
      const dt = e.target.closest('[data-delt]'); if (dt) { S.trips = S.trips.filter(x => String(x.id) !== dt.dataset.delt); clearTimes(); save(); renderAll(); draw(); }
    };
    $('[data-man]', b).onclick = () => {
      const la = parseFloat($('#mLat', b).value.replace(',', '.')), lo = parseFloat($('#mLon', b).value.replace(',', '.'));
      if (!(Math.abs(la) <= 90 && Math.abs(lo) <= 180) || isNaN(la) || isNaN(lo)) return toast(t('badCoords'));
      choose(mkPlace($('#mName', b).value.trim() || `${la.toFixed(3)}, ${lo.toFixed(3)}`, '', la, lo));
    };
  };
  draw();
}
function planTrip(P, done) {
  const today = todayKey(), wk = keyOf(addDays(new Date(), 7));
  const inp = 'style="width:100%;background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:10px;margin-top:4px"';
  const sh = openSheet(t('planTrip'), `<p class="muted" style="margin:0 4px 12px">${t('tripExplain', { n: placeLabel(P) })}</p>
    <div class="row"><label class="grow small">${t('from')}<input type="date" id="tF" value="${today}" ${inp}></label><label class="grow small">${t('to')}<input type="date" id="tT" value="${wk}" ${inp}></label></div>
    <button class="btn pri full" style="margin-top:14px" data-ok>${t('save')}</button>`);
  $('[data-ok]', sh.body).onclick = () => {
    const f = $('#tF', sh.body).value, to = $('#tT', sh.body).value;
    if (!f || !to || to < f) return toast(t('badDates'));
    (S.trips ||= []).push({ id: Date.now(), place: P, from: f, to });
    if (!S.places.some(q => q.name === P.name && q.cc === P.cc)) S.places.push(P);
    clearTimes(); save(); sh.close(); renderAll(); toast(t('tripSaved')); done && done();
  };
}

/* ---------------- Qibla ---------------- */
const KAABA = { lat: 21.422487, lon: 39.826206 };
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
function qiblaBearing(lat = locFor(todayKey()).lat, lon = locFor(todayKey()).lon) {
  const φ = rad(lat), φk = rad(KAABA.lat), Δ = rad(KAABA.lon - lon);
  return (deg(Math.atan2(Math.sin(Δ), Math.cos(φ) * Math.tan(φk) - Math.sin(φ) * Math.cos(Δ))) + 360) % 360;
}
function distMecca(lat = locFor(todayKey()).lat, lon = locFor(todayKey()).lon) {
  const φ1 = rad(lat), φ2 = rad(KAABA.lat), dφ = φ2 - φ1, dλ = rad(KAABA.lon - lon);
  const a = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function cardinal(b) { return t('dirs').split(',')[Math.round(b / 45) % 8]; }
const KAABA_SVG = `<svg viewBox="0 0 40 40" width="26" height="26"><path d="M8 13 20 8l12 5v15l-12 5-12-5z" fill="#111"/><path d="M8 13l12 5 12-5" fill="none" stroke="#333" stroke-width="1"/><path d="M20 18v15" stroke="#333"/><path d="M8 17l12 5 12-5v3l-12 5-12-5z" fill="#d4af37"/></svg>`;
const COMPASS_DESIGNS = ['kalli', 'klassik', 'gold', 'nacht', 'blau', 'minimal'];
function compassSvg(design, size = 340, q = null) {
  const D = {
    kalli: { face: '#6b7077', ring: '#dcdcd8', tick: '#3b3f45', txt: '#e9e9e9', needleN: '#e9a1ab', needleS: '#d65f72', callig: '#44484e' },
    klassik: { face: '#f3ead6', ring: '#8a5a32', tick: '#7a5a3a', txt: '#5a3b1e', needleN: '#c62828', needleS: '#5a3b1e', callig: '#e2d3b4' },
    gold: { face: '#14171a', ring: '#e2c35a', tick: '#e2c35a', txt: '#e2c35a', needleN: '#e2c35a', needleS: '#6b5a2a', callig: '#2a2c2f' },
    nacht: { face: '#05070d', ring: '#2a2f3a', tick: '#cfd6e6', txt: '#ffffff', needleN: '#ff4d4d', needleS: '#cfd6e6', callig: '#121726' },
    blau: { face: '#1f5fbf', ring: '#c9d5e6', tick: '#e6eefb', txt: '#ffffff', needleN: '#ff3b30', needleS: '#e6eefb', callig: '#2a6bd0' },
    minimal: { face: '#ffffff', ring: '#d9dde3', tick: '#9aa3ad', txt: '#1b1f24', needleN: '#d12f2f', needleS: '#1b1f24', callig: '#f1f3f5' },
  }[design] || {};
  const c = 100, ticks = [];
  for (let a = 0; a < 360; a += 5) {
    const long = a % 30 === 0, r1 = long ? 80 : 84, x1 = c + r1 * Math.sin(rad(a)), y1 = c - r1 * Math.cos(rad(a)), x2 = c + 89 * Math.sin(rad(a)), y2 = c - 89 * Math.cos(rad(a));
    ticks.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${D.tick}" stroke-width="${long ? 1.6 : .8}" opacity="${long ? .9 : .55}"/>`);
  }
  const letters = [['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([l, a]) => `<text x="${c + 66 * Math.sin(rad(a))}" y="${c - 66 * Math.cos(rad(a)) + 7}" text-anchor="middle" font-size="${size < 100 ? 0 : 20}" font-weight="800" fill="${D.txt}" font-family="system-ui">${l}</text>`).join('');
  const callig = (design === 'kalli' || design === 'gold' || design === 'klassik')
    ? `<text x="100" y="${design === 'kalli' ? 118 : 116}" text-anchor="middle" font-family="ArefRuqaa,'Geeza Pro',serif" font-size="${design === 'kalli' ? 46 : 38}" textLength="${design === 'kalli' ? 140 : 110}" lengthAdjust="spacingAndGlyphs" fill="${D.callig}" opacity=".95">${design === 'klassik' ? 'الله أكبر' : 'لا إله إلا الله'}</text>
       <text x="100" y="${design === 'kalli' ? 152 : 146}" text-anchor="middle" font-family="ArefRuqaa,'Geeza Pro',serif" font-size="${design === 'kalli' ? 26 : 20}" textLength="${design === 'kalli' ? 96 : 70}" lengthAdjust="spacingAndGlyphs" fill="${D.callig}">${design === 'klassik' ? 'بسم الله' : 'محمد رسول الله'}</text>` : '';
  const stars = design === 'nacht' ? Array.from({ length: 26 }, (_, i) => { const a = i * 137.5, r = 18 + (i * 23) % 52; return `<circle cx="${c + r * Math.sin(rad(a))}" cy="${c - r * Math.cos(rad(a))}" r="${.5 + (i % 3) * .4}" fill="#fff" opacity=".6"/>`; }).join('') : '';
  const kaabaMark = q != null ? `<g transform="rotate(${q} 100 100)"><line x1="100" y1="100" x2="100" y2="24" stroke="#25d366" stroke-width="2.4" stroke-dasharray="4 3"/><g transform="translate(88 2)"><circle cx="12" cy="12" r="12" fill="#fff"/><g transform="translate(0 0) scale(.6)">${KAABA_SVG.replace('<svg viewBox="0 0 40 40" width="26" height="26">', '').replace('</svg>', '')}</g></g></g>` : '';
  return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" style="width:100%;height:100%">
    <circle cx="100" cy="100" r="98" fill="${D.ring}"/><circle cx="100" cy="100" r="91" fill="${D.face}"/>${stars}${callig}${ticks.join('')}${letters}${kaabaMark}</svg>`;
}
function needleSvg(design) {
  const D = { kalli: ['#e9a1ab', '#d65f72'], klassik: ['#c62828', '#5a3b1e'], gold: ['#e2c35a', '#6b5a2a'], nacht: ['#ff4d4d', '#cfd6e6'], blau: ['#ff3b30', '#e6eefb'], minimal: ['#d12f2f', '#1b1f24'] }[design] || ['#e9a1ab', '#d65f72'];
  return `<svg viewBox="0 0 200 200" style="width:100%;height:100%"><path d="M100 14 109 100H91z" fill="${D[0]}"/><path d="M91 100h18l-9 86z" fill="${D[1]}"/><circle cx="100" cy="100" r="6" fill="#fff" stroke="#0003"/></svg>`;
}
let qHandler = null;
function openQibla() {
  const q = qiblaBearing();
  const v = openView(`<div class="v-h"><button class="rbtn" data-back>${icon('back')}</button><h3>${t('qibla')}</h3><div style="width:44px"></div></div>
    <div class="v-b"><div class="qibla-wrap">
      <div class="qinfo"><span class="pill">${icon('pin')}<span>${esc(locFor(todayKey()).name)}</span></span><span class="pill" id="qAcc"><span>${t('compassOff')}</span></span><span class="pill"><span id="qHead">–</span></span></div>
      <div class="compass" id="qComp"><div class="kaaba-top">${KAABA_SVG}</div>
        <div class="dial" id="qDial">${compassSvg(S.compass, 340, q)}</div><div class="needle" id="qNeedle">${needleSvg(S.compass)}</div></div>
      <div class="qstatus" id="qStat">${t('qiblaDir', { d: Math.round(q) })}</div>
      <div class="muted" style="text-align:center;margin-bottom:16px">${cardinal(q)} · ${t('qiblaDist', { km: fmtNum(Math.round(distMecca())) })}</div>
      <button class="btn pri" id="qStart">${icon('compass')} ${t('compassStart')}</button>
      <p class="tiny" style="text-align:center;max-width:320px;margin:10px auto 18px">${t('compassNote')}</p>
      <div style="width:100%"><div class="muted small" style="margin:0 4px 4px">${t('design')}</div>
      <div class="design-row" id="qDesigns">${COMPASS_DESIGNS.map(d => `<button data-cd="${d}" class="${d === S.compass ? 'on' : ''}">${compassSvg(d, 62)}</button>`).join('')}</div></div>
    </div></div>`, { onClose: () => { if (qHandler) { removeEventListener('deviceorientation', qHandler, true); removeEventListener('deviceorientationabsolute', qHandler, true); qHandler = null; } } });
  const el = v.el, dial = $('#qDial', el), needle = $('#qNeedle', el), comp = $('#qComp', el);
  // ohne Sensor: Nadel zeigt Norden, Kaaba-Linie zeigt Qibla relativ zu Norden
  $$('[data-cd]', el).forEach(b => b.onclick = () => {
    S.compass = b.dataset.cd; save();
    $$('[data-cd]', el).forEach(x => x.classList.toggle('on', x === b));
    dial.innerHTML = compassSvg(S.compass, 340, q); needle.innerHTML = needleSvg(S.compass);
    if (TAB === 'prayer') renderPage('prayer');
  });
  let smooth = null, wasAligned = false;
  qHandler = e => {
    let h = null;
    if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
    else if (e.absolute && e.alpha != null) h = 360 - e.alpha;
    if (h == null) return;
    const so = screen.orientation ? screen.orientation.angle : (window.orientation || 0); h = (h + so + 360) % 360;
    if (smooth == null) smooth = h; else { let d = ((h - smooth + 540) % 360) - 180; smooth = (smooth + d * .25 + 360) % 360; }
    dial.style.transform = `rotate(${-smooth}deg)`;
    needle.style.transform = `rotate(${-smooth}deg)`;
    const off = ((q - smooth + 540) % 360) - 180, aligned = Math.abs(off) < 4;
    comp.classList.toggle('aligned', aligned);
    if (aligned && !wasAligned) haptic(); wasAligned = aligned;
    $('#qHead', el).textContent = Math.round(smooth) + '°';
    $('#qStat', el).textContent = aligned ? t('facingQibla') : (off > 0 ? t('turnRight', { d: Math.round(Math.abs(off)) }) : t('turnLeft', { d: Math.round(Math.abs(off)) }));
    const acc = e.webkitCompassAccuracy;
    $('#qAcc', el).innerHTML = `<span>${acc != null && acc >= 0 ? t('accuracy', { d: Math.round(acc) }) : t('compassOn')}</span>`;
  };
  $('#qStart', el).onclick = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return toast(t('compassDenied'));
      }
      addEventListener('deviceorientationabsolute', qHandler, true); addEventListener('deviceorientation', qHandler, true);
      $('#qStart', el).classList.add('hidden');
      setTimeout(() => { if (smooth == null) toast(t('compassNone')); }, 2500);
    } catch (e) { toast(t('compassNone')); }
  };
}
