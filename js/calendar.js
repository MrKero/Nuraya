/* Nuraya – Islamischer Kalender & besondere Tage */
'use strict';
const HM = {
  de: ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Achir', 'Dschumada al-Ula', 'Dschumada al-Achira', 'Radschab', 'Schaban', 'Ramadan', 'Schawwal', 'Dhul-Qada', 'Dhul-Hiddscha'],
  tr: ['Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'],
  ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
};
const hfmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
const hCache = new Map();
function hijri(d) {
  const x = addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12), S.hijriAdj || 0), k = keyOf(x);
  if (hCache.has(k)) return hCache.get(k);
  let r;
  try { const p = hfmt.formatToParts(x).reduce((o, q) => (o[q.type] = q.value, o), {}); r = { y: parseInt(p.year), m: +p.month, d: +p.day }; }
  catch (e) { r = kuwaiti(x); }
  hCache.set(k, r); return r;
}
/* Ersatzrechnung (tabellarisch), falls der Browser keinen islamischen Kalender kennt */
function kuwaiti(date) {
  const jd = Math.floor(date / 86400000) + 2440588, l0 = jd - 1948440 + 10632, n = Math.floor((l0 - 1) / 10631), l1 = l0 - 10631 * n + 354;
  const j = Math.floor((10985 - l1) / 5316) * Math.floor(50 * l1 / 17719) + Math.floor(l1 / 5670) * Math.floor(43 * l1 / 15238);
  const l2 = l1 - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const m = Math.floor(24 * l2 / 709), d = l2 - Math.floor(709 * m / 24), y = 30 * n + j - 30;
  return { y, m, d };
}
function hijriParts(d) { const h = hijri(d); return { day: h.d, month: h.m, year: h.y, monthName: (HM[S.lang] || HM.de)[h.m - 1] }; }
const hijriStr = d => { const p = hijriParts(d); return `${p.day}${S.lang === 'de' ? '.' : ''} ${p.monthName} ${p.year}`; };

/* Besondere Tage: [Monat, Tag, Schlüssel, Art]; Art: 'eid' = Feiertag, 'kandil' = Nacht (Vorabend), 'day' = Gedenktag */
const SPECIAL = [
  [1, 1, 'evNewYear', 'day'], [1, 10, 'evAshura', 'day'], [3, 12, 'evMawlid', 'kandil'], [7, 1, 'evThreeMonths', 'day'],
  [7, 0, 'evRaghaib', 'kandil'], [7, 27, 'evMiraj', 'kandil'], [8, 15, 'evBaraat', 'kandil'], [9, 1, 'evRamadan', 'day'],
  [9, 27, 'evQadr', 'kandil'], [10, 1, 'evFitr', 'eid'], [10, 2, 'evFitr2', 'eid'], [10, 3, 'evFitr3', 'eid'],
  [12, 9, 'evArafa', 'day'], [12, 10, 'evAdha', 'eid'], [12, 11, 'evAdha2', 'eid'], [12, 12, 'evAdha3', 'eid'], [12, 13, 'evAdha4', 'eid'],
];
let evCache = null, evCacheKey = '';
function specialDays() {
  const ck = S.hijriAdj + '|' + S.kandil + '|' + todayKey();
  if (evCache && evCacheKey === ck) return evCache;
  const out = [], start = addDays(new Date(), -380), end = addDays(new Date(), 760);
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const h = hijri(d);
    for (const [m, day, key, kind] of SPECIAL) {
      if (m !== h.m) continue;
      if (kind === 'kandil' && !S.kandil) continue;
      if (key === 'evRaghaib') {
        // Nacht vor dem ersten Freitag im Radschab -> Donnerstag
        if (d.getDay() === 4) { const f = addDays(d, 1), hf = hijri(f); if (hf.m === 7 && hf.d <= 7) out.push({ date: new Date(d), key, kind, h: hf }); }
        continue;
      }
      if (kind === 'kandil') { const nx = hijri(addDays(d, 1)); if (nx.m === m && nx.d === day) out.push({ date: new Date(d), key, kind, h: nx }); }
      else if (h.d === day) out.push({ date: new Date(d), key, kind, h });
    }
  }
  out.sort((a, b) => a.date - b.date);
  evCache = out; evCacheKey = ck; return out;
}
const evOn = k => specialDays().filter(e => keyOf(e.date) === k);
const daysUntil = d => Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(new Date().toDateString())) / 864e5);
const inDays = n => n === 0 ? t('todayL') : n === 1 ? t('tomorrow') : n < 0 ? t('agoDays', { n: -n }) : t('inDays', { n });
const evName = e => t(e.key) + (e.kind === 'kandil' ? ` (${t('night')})` : '');
const MOON = `<svg class="moon" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="var(--card2)"/><path d="M38 14a17 17 0 1 0 9 26 14 14 0 1 1-9-26Z" fill="var(--accent)"/><path d="m44 18 1.5 3.5 3.5 1.5-3.5 1.5L44 28l-1.5-3.5-3.5-1.5 3.5-1.5z" fill="var(--accent)"/></svg>`;

function nextDayCard() {
  const nx = specialDays().find(e => daysUntil(e.date) >= 0), now = new Date();
  return `<div class="sec-h"><h2>${t('secNextDay')}</h2><a href="#" data-go>${t('tab_calendar')}</a></div>
    <div class="card"><div class="muted small" style="margin-bottom:10px">${t('todayIs')} <b style="color:var(--fg)">${hijriStr(now)} ${t('ah')}</b></div>
    ${nx ? `<div class="hero-next">${MOON}<div class="grow"><b style="font-size:18px">${evName(nx)}</b><div class="muted small">${fmtDate(nx.date, { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
      <div style="text-align:end"><div style="font-size:26px;font-weight:800;color:var(--accent)">${daysUntil(nx.date)}</div><div class="tiny">${t('daysWord')}</div></div></div>` : ''}</div>`;
}

let calOff = 0;
registerSection('calendar', {
  id: 'today', title: () => t('secHijriToday'),
  render() {
    const now = new Date(), p = hijriParts(now);
    return `<div class="card" style="text-align:center;padding:22px 16px">${MOON.replace('class="moon"', 'class="moon" style="width:64px;height:64px;margin:0 auto 10px"')}
      <div class="muted small">${fmtDate(now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div style="font-size:28px;font-weight:800;margin-top:6px">${p.day}${S.lang === 'de' ? '.' : ''} ${p.monthName}</div><div class="muted">${p.year} ${t('ah')}</div>
      <div class="ar" style="font-size:24px;margin-top:6px;direction:rtl">${arNum(p.day)} ${HM.ar[p.month - 1]} ${arNum(p.year)}</div>
      ${evOn(keyOf(now)).map(e => `<div class="pill" style="margin-top:12px;background:var(--accent);color:var(--onaccent)"><span>${evName(e)}</span></div>`).join('')}</div>`;
  },
});
registerSection('calendar', {
  id: 'month', title: () => t('secMonth'),
  render() {
    const now = new Date(), m0 = new Date(now.getFullYear(), now.getMonth() + calOff, 1), m1 = new Date(m0.getFullYear(), m0.getMonth() + 1, 0);
    const first = addDays(m0, -((m0.getDay() - S.weekStart + 7) % 7));
    const hA = hijriParts(m0), hB = hijriParts(m1);
    const hTitle = hA.month === hB.month ? `${hA.monthName} ${hA.year}` : `${hA.monthName}${hA.year !== hB.year ? ' ' + hA.year : ''} – ${hB.monthName} ${hB.year}`;
    let cells = '';
    for (let i = 0; i < 7; i++) cells += `<div class="wh">${fmtDate(addDays(first, i), { weekday: 'narrow' })}</div>`;
    for (let i = 0; i < 42; i++) {
      const d = addDays(first, i); if (i >= 35 && d.getMonth() !== m0.getMonth()) break;
      const k = keyOf(d), h = hijri(d), ev = evOn(k);
      cells += `<button class="cd ${d.getMonth() !== m0.getMonth() ? 'out' : ''} ${k === todayKey() ? 'today' : ''} ${ev.length ? 'sp' : ''} ${d.getDay() === 5 ? 'fri' : ''}" data-cday="${k}"><b>${d.getDate()}</b><span>${h.d === 1 ? (HM[S.lang] || HM.de)[h.m - 1].slice(0, 5) : h.d}</span></button>`;
    }
    return `<div class="sec-h"><h2>${t('secMonth')}</h2>${calOff ? `<a href="#" data-cal-today>${t('todayL')}</a>` : ''}</div><div class="card">
      <div class="cal-h"><button class="rbtn" data-cm="-1">${icon('chevl')}</button><div class="t"><b>${fmtDate(m0, { month: 'long', year: 'numeric' })}</b><span>${hTitle} ${t('ah')}</span></div><button class="rbtn" data-cm="1">${icon('chev')}</button></div>
      <div class="cgrid">${cells}</div></div>`;
  },
  after(el) {
    $$('[data-cm]', el).forEach(b => b.onclick = () => { calOff += +b.dataset.cm; renderPage('calendar'); });
    const tb = $('[data-cal-today]', el); if (tb) tb.onclick = e => { e.preventDefault(); calOff = 0; renderPage('calendar'); };
    $$('[data-cday]', el).forEach(b => b.onclick = () => {
      const d = fromKey(b.dataset.cday), ev = evOn(b.dataset.cday);
      openSheet(fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), `<div class="card"><div class="muted small">${t('hijriDate')}</div><div style="font-size:20px;font-weight:700;margin:4px 0 2px">${hijriStr(d)} ${t('ah')}</div>
        <div class="ar" style="font-size:20px;text-align:start">${arNum(hijri(d).d)} ${HM.ar[hijri(d).m - 1]} ${arNum(hijri(d).y)}</div></div>
        ${ev.length ? `<div class="card" style="margin-top:10px">${ev.map(e => `<b style="font-size:17px">${evName(e)}</b><p class="muted small" style="margin:4px 0 0">${t(e.key + 'D')}</p>`).join('<hr style="border:0;border-top:1px solid var(--line);margin:12px 0">')}</div>` : ''}`);
    });
  },
});
registerSection('calendar', {
  id: 'upcoming', title: () => t('secUpcoming'),
  render() {
    const up = specialDays().filter(e => daysUntil(e.date) >= 0).slice(0, 6);
    return `<div class="sec-h"><h2>${t('secUpcoming')}</h2></div><div class="card" style="padding:4px 14px">${up.map(evRow).join('') || `<div class="empty">–</div>`}</div>`;
  },
});
registerSection('calendar', {
  id: 'holidays', title: () => t('secHolidays'),
  render() {
    const hy = hijri(new Date()).y;
    const list = specialDays().filter(e => e.h.y === hy || e.h.y === hy + 1);
    const byYear = {}; list.forEach(e => (byYear[e.h.y] ||= []).push(e));
    return `<div class="sec-h"><h2>${t('secHolidays')}</h2></div>` + Object.entries(byYear).map(([y, evs]) =>
      `<div class="card" style="padding:4px 14px;margin-bottom:10px"><div class="muted small" style="padding:12px 2px 2px;font-weight:700">${y} ${t('ah')}</div>${evs.map(evRow).join('')}</div>`).join('') +
      `<p class="tiny" style="margin:4px 6px">${t('calNote')}</p>`;
  },
});
function evRow(e) {
  const n = daysUntil(e.date);
  return `<div class="ev ${n < 0 ? 'past' : ''}"><div class="dbox"><b>${e.date.getDate()}</b><span>${fmtDate(e.date, { month: 'short' })}</span></div>
    <div class="grow"><b>${evName(e)}</b><span>${fmtDate(e.date, { weekday: 'long' })} · ${e.h.d}${S.lang === 'de' ? '.' : ''} ${(HM[S.lang] || HM.de)[e.h.m - 1]}</span></div><span class="in">${inDays(n)}</span></div>`;
}
