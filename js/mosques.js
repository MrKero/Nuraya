/* Moscheen in der Nähe – Daten aus OpenStreetMap (Overpass API).
   Abfrage nur auf Knopfdruck; das Ergebnis wird auf dem Gerät gespeichert und ist danach offline lesbar. */
/* Quelle 1: Overpass API (OpenStreetMap) – vollständig, aber 2026 oft überlastet und streng begrenzt.
   Quelle 2: Nominatim (OpenStreetMap-Suche) – sofort verfügbar, findet vor allem Moscheen mit Namen. */
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
let MQ_POS = null; // genauer GPS-Standort nur für diese Sitzung (wird nicht gespeichert)
let MQ_CTL = null, MQ_BLOCK = 0, MQ_STOP = false; // nach 429/406 mindestens 60 s Overpass nicht erneut fragen
function mqQuery(lat, lon, r) {
  const f = `["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat.toFixed(4)},${lon.toFixed(4)})`;
  return `[out:json][timeout:20];(node${f};way${f};relation${f};);out center tags qt;`;
}
function mqParse(j) {
  return j.elements.map(e => {
    const g = e.tags || {}, la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon;
    const street = [g['addr:street'], g['addr:housenumber']].filter(Boolean).join(' ');
    const city = [g['addr:postcode'], g['addr:city']].filter(Boolean).join(' ');
    return {
      n: g['name:' + S.lang] || g.name || '', la, lo,
      a: [street, city].filter(Boolean).join(', '),
      o: g.operator || g.denomination && g.denomination !== 'sunni' && g.denomination || '',
      k: g.building === 'mosque' || /moschee|mosque|cami|masjid|mescit|مسجد|جامع/i.test(g.name || '') ? 'mosque' : 'room',
      w: g.website || g['contact:website'] || '',
    };
  }).filter(x => x.la != null);
}
function timeoutFetch(url, opt, ms, ctl) {
  const tm = setTimeout(() => ctl.abort(), ms);
  return fetch(url, { ...opt, signal: ctl.signal }).finally(() => clearTimeout(tm));
}
async function mqOverpass(lat, lon, r, ctl) {
  // POST mit dem Abfragetext im Body – GET-Anfragen lehnt der Server seit 2026 teils mit 406 ab
  const res = await timeoutFetch(OVERPASS, { method: 'POST', body: 'data=' + encodeURIComponent(mqQuery(lat, lon, r)), headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' } }, 15000, ctl);
  if (res.status === 429 || res.status === 406) MQ_BLOCK = Date.now() + 60000;
  if (!res.ok) throw new Error('Overpass ' + res.status);
  const j = await res.json();
  if (!j || !Array.isArray(j.elements) || (j.remark && /runtime error|timed out|rate_limited/i.test(j.remark))) throw new Error('Overpass remark');
  return mqParse(j);
}
async function mqNominatim(lat, lon, r, ctl) {
  const dLa = r / 111320, dLo = r / (111320 * Math.cos(lat * Math.PI / 180));
  const vb = [lon - dLo, lat + dLa, lon + dLo, lat - dLa].map(x => x.toFixed(4)).join(',');
  const seen = new Set(), out = [];
  for (const q of ['mosque', 'moschee', 'cami']) {
    const u = `${NOMINATIM}?format=jsonv2&q=${q}&viewbox=${vb}&bounded=1&limit=50&addressdetails=1&extratags=1&accept-language=${S.lang}`;
    const res = await timeoutFetch(u, { headers: { 'Accept': 'application/json' } }, 12000, ctl);
    if (!res.ok) throw new Error('Nominatim ' + res.status);
    for (const e of await res.json()) {
      const x = e.extratags || {}, a = e.address || {};
      const isMq = (e.category === 'amenity' && e.type === 'place_of_worship' && (x.religion === 'muslim' || /moschee|mosque|cami|masjid|mescit|مسجد|جامع/i.test(e.name || ''))) || e.type === 'mosque';
      if (!isMq || seen.has(e.osm_type + e.osm_id)) continue;
      seen.add(e.osm_type + e.osm_id);
      const street = [a.road, a.house_number].filter(Boolean).join(' '), city = [a.postcode, a.city || a.town || a.village].filter(Boolean).join(' ');
      out.push({ n: e.name || '', la: +e.lat, lo: +e.lon, a: [street, city].filter(Boolean).join(', '), o: x.operator || '', k: 'mosque', w: x.website || '' });
    }
    await new Promise(ok => setTimeout(ok, 1100)); // Nominatim erlaubt höchstens 1 Anfrage pro Sekunde
  }
  return out;
}
async function mqFetch(lat, lon, r) {
  MQ_CTL = new AbortController();
  const ctl = MQ_CTL; let err = [];
  try {
    if (Date.now() > MQ_BLOCK) {
      try { return { list: await mqOverpass(lat, lon, r, ctl), src: 'overpass' }; } catch (e) { if (MQ_STOP) throw e; err.push(e.name === 'AbortError' ? 'Overpass Zeitüberschreitung' : e.message); }
    }
    const c2 = new AbortController(); MQ_CTL = c2;
    try { return { list: await mqNominatim(lat, lon, r, c2), src: 'nominatim' }; } catch (e) { err.push(e.message); }
    throw new Error(err.join(' · ') || 'fail');
  } finally { MQ_CTL = null; }
}
function mqDist(m, from) { return kmBetween(from, { lat: m.la, lon: m.lo }); }
function fmtKm(km) { return km < 1 ? fmtNum(Math.round(km * 1000 / 10) * 10) + ' m' : (km < 10 ? km.toFixed(1).replace('.', S.lang === 'de' || S.lang === 'tr' ? ',' : '.') : fmtNum(Math.round(km))) + ' km'; }
const mqFrom = () => MQ_POS || { lat: S.loc.lat, lon: S.loc.lon, name: S.loc.name };

registerSection('prayer', {
  id: 'mosques', title: () => t('mqTitle'),
  render() {
    const c = S.mosq, from = mqFrom();
    let sub = t('mqTapToSearch');
    if (c && c.list && c.list.length) {
      const near = c.list.map(m => [m, mqDist(m, from)]).sort((a, b) => a[1] - b[1])[0];
      sub = t('mqNearest', { n: esc(near[0].n || t(near[0].k === 'mosque' ? 'mqUnnamed' : 'mqRoom')), d: fmtKm(near[1]) });
    } else if (c) sub = t('mqNone');
    return `<div class="sec-h"><h2>${t('mqTitle')}</h2></div><button class="card qcard" style="width:100%;text-align:start" data-mq>
      <div class="mq-ic">${icon('mosque')}</div><div class="grow"><b style="font-size:17px">${t('mqFind')}</b><div class="muted small" style="margin-top:3px">${sub}</div></div>${icon('chev')}</button>`;
  },
  after(el) { $('[data-mq]', el).onclick = openMosques; },
});

function openMosques() {
  const R_OPTS = [2000, 5000, 10000, 25000];
  let r = (S.mosq && S.mosq.r) || 5000, busy = false, stopped = false, tick = 0, lastErr = '';
  const v = openView(`<div class="v-h"><button class="rbtn" data-back>${icon('back')}</button><h3>${t('mqTitle')}</h3><div style="width:44px"></div></div>
    <div class="v-b" style="padding:0 16px 60px"><div id="mqTop"></div><div id="mqList"></div>
    <p class="tiny" style="margin:18px 6px 0">${t('mqPrivacy')}</p><p class="tiny" style="margin:6px 6px 0">© OpenStreetMap-Mitwirkende (ODbL)</p></div>`, { onClose: () => renderPage('prayer') });
  const top = $('#mqTop', v.el), list = $('#mqList', v.el);
  const drawTop = () => {
    const f = mqFrom();
    top.innerHTML = `<div class="card">
      <div class="row" style="gap:8px;flex-wrap:wrap"><span class="pill">${icon('pin')}<span>${esc(MQ_POS ? t('mqGpsHere') : f.name)}</span></span>
        ${MQ_POS ? '' : `<button class="pill" data-gps>${icon('compass')}<span>${t('mqUseGps')}</span></button>`}</div>
      <div class="seg" style="margin-top:12px">${R_OPTS.map(x => `<button data-r="${x}" class="${x === r ? 'on' : ''}">${x / 1000} km</button>`).join('')}</div>
      ${busy ? `<div class="mq-busy"><span class="mq-spin"></span><span class="grow" id="mqSec">${t('mqSearching')}</span><button class="btn sm" data-stop>${t('cancel')}</button></div>` : `<button class="btn full pri" style="margin-top:12px" data-go>${icon('search')} ${t('mqSearch')}</button>`}
      ${lastErr && !busy ? `<div class="tiny mq-err">${t('mqFailWhy')}<br><code>${esc(lastErr)}</code></div>` : ''}
      ${S.mosq && S.mosq.src === 'nominatim' && !busy ? `<div class="tiny" style="margin-top:8px;text-align:center">${t('mqSrcNom')}</div>` : ''}
      ${S.mosq && S.mosq.at ? `<div class="tiny" style="margin-top:8px;text-align:center">${t('mqStand', { d: fmtDate(new Date(S.mosq.at), { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + fmtTime(new Date(S.mosq.at)) })}</div>` : ''}</div>`;
    $$('[data-r]', top).forEach(b => b.onclick = () => { r = +b.dataset.r; drawTop(); });
    const g = $('[data-gps]', top); if (g) g.onclick = () => {
      if (!navigator.geolocation) return toast(t('gpsFail'));
      toast(t('locating'));
      navigator.geolocation.getCurrentPosition(p => { MQ_POS = { lat: p.coords.latitude, lon: p.coords.longitude, name: t('mqGpsHere') }; drawTop(); drawList(); search(); }, () => toast(t('gpsFail')), { enableHighAccuracy: true, timeout: 15000, maximumAge: 120000 });
    };
    const go = $('[data-go]', top); if (go) go.onclick = search;
    const st = $('[data-stop]', top); if (st) st.onclick = () => { stopped = true; MQ_STOP = true; MQ_CTL && MQ_CTL.abort(); };
  };
  const drawList = () => {
    const c = S.mosq, f = mqFrom();
    if (!c) { list.innerHTML = `<div class="empty" style="margin-top:22px">${icon('mosque')}<p>${t('mqIntro')}</p></div>`; return; }
    const items = (c.list || []).map(m => [m, mqDist(m, f)]).sort((a, b) => a[1] - b[1]);
    if (!items.length) { list.innerHTML = `<div class="empty" style="margin-top:22px"><p>${t('mqNone')}</p></div>`; return; }
    list.innerHTML = `<div class="tiny" style="margin:16px 6px 8px">${t('mqCount', { n: items.length })}</div>` + items.map(([m, d]) => {
      const nm = m.n || t(m.k === 'mosque' ? 'mqUnnamed' : 'mqRoom');
      const apple = `https://maps.apple.com/?daddr=${m.la},${m.lo}&q=${encodeURIComponent(nm)}`;
      const gmap = `https://www.google.com/maps/dir/?api=1&destination=${m.la},${m.lo}`;
      return `<div class="card mq-item"><div class="row" style="align-items:flex-start;gap:12px">
        <div class="mq-ic sm">${icon(m.k === 'mosque' ? 'mosque' : 'prayer')}</div>
        <div class="grow" style="min-width:0"><b>${esc(nm)}</b>
          ${(() => { const sub = [m.a, m.o].filter(Boolean).map(esc).join(' · ') || (m.n ? t(m.k === 'mosque' ? 'mqMosque' : 'mqRoom') : ''); return sub ? `<div class="muted small">${sub}</div>` : ''; })()}</div>
        <div class="mq-d">${fmtKm(d)}</div></div>
        <div class="row" style="gap:8px;margin-top:10px"><a class="btn sm pri" href="${apple}" target="_blank" rel="noopener">${icon('pin')} ${t('mqRoute')}</a>
          <a class="btn sm" href="${gmap}" target="_blank" rel="noopener">Google Maps</a>
          ${m.w ? `<a class="btn sm" href="${esc(m.w)}" target="_blank" rel="noopener">${t('mqWeb')}</a>` : ''}</div></div>`;
    }).join('');
  };
  async function search() {
    if (busy) return;
    if (!navigator.onLine) return toast(t('offline'));
    busy = true; stopped = false; MQ_STOP = false; drawTop();
    const t0 = Date.now();
    tick = setInterval(() => { const el = document.getElementById('mqSec'); if (el) { const s = Math.round((Date.now() - t0) / 1000); el.textContent = t('mqSearching') + ' ' + s + ' s' + (s >= 8 ? ' · ' + t('mqSlow') : ''); } }, 1000);
    const f = mqFrom();
    try {
      let res = await mqFetch(f.lat, f.lon, r);
      // nichts gefunden? Einmal automatisch weiter suchen
      if (!res.list.length && r < 25000 && !stopped) { r = 25000; drawTop(); res = await mqFetch(f.lat, f.lon, r); }
      S.mosq = { at: Date.now(), r, src: res.src, list: res.list.slice(0, 150) }; save();
    } catch (e) { if (!stopped) { lastErr = e.message; toast(t('mqFail'), 4000); } }
    clearInterval(tick); busy = false; drawTop(); drawList(); lastErr = '';
  }
  drawTop(); drawList();
  $('[data-back]', v.el).onclick = v.close;
}
