/* Nuraya – Einstellungen (Fenster) */
'use strict';
const THEMES = { gruen: ['#002b27', '#0d5a4b'], bordeaux: ['#22050c', '#6b1a2c'], babyblau: ['#eaf5fd', '#b4d8f3'], marine: ['#030f24', '#163a74'], oliv: ['#171b0c', '#4f5c27'], oled: ['#000', '#000'], weiss: ['#ffffff', '#eef2f0'] };
const FLAGS = {
  de: '<svg viewBox="0 0 5 3"><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#D00"/><rect y="2" width="5" height="1" fill="#FFCE00"/></svg>',
  tr: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#E30A17"/><circle cx="10.5" cy="10" r="5" fill="#fff"/><circle cx="11.75" cy="10" r="4" fill="#E30A17"/><path d="m14.6 10 4.5-1.5-2.8 3.8V7.7l2.8 3.8z" fill="#fff"/></svg>',
  ar: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#006C35"/><text x="15" y="10.5" text-anchor="middle" font-size="5.2" fill="#fff" font-family="ArefRuqaa,serif">لا إله إلا الله</text><path d="M8 14h13" stroke="#fff" stroke-width=".9"/><path d="M21 13.3l1.6.7-1.6.7z" fill="#fff"/></svg>',
};
let refreshSettings = null, setSheet = null;
const LICENSES = [
  ['Koran-Text (Uthmani)', 'Tanzil Project, CC BY 3.0', 'tanzil.net – unverändert wiedergegeben, bereitgestellt über quran-json (CC BY 4.0).'],
  ['Deutsche Übersetzung', 'A. S. F. Bubenheim & N. Elyas', 'Über Tanzil/fawazahmed0 quran-api (Unlicense) für den privaten, nicht-kommerziellen Gebrauch.'],
  ['Türkische Aussprache', 'Latin-Umschrift', 'Über fawazahmed0 quran-api (Unlicense).'],
  ['Koran-Metadaten (Cüz, Secde)', 'quran-meta, MIT', ''],
  ['Rezitation', 'Mishary Rashid al-Afasy, everyayah.com', 'Nur für den persönlichen Gebrauch; die Rechte liegen beim Rezitator.'],
  ['Gebetszeiten-Berechnung', 'adhan-js, MIT', 'Batoul Apps.'],
  ['Diyanet-Zeiten (optional)', 'ezanvakti.emushaf.net', 'Daten des Türkiye Diyanet İşleri Başkanlığı; Abruf nur auf Wunsch.'],
  ['Städte-Datenbank', 'GeoNames, CC BY 4.0', 'Über all-the-cities (MIT).'],
  ['Zeitzonen', 'tz-lookup, CC0', ''],
  ['ZIP-Import', 'fflate, MIT', ''],
  ['Koran-Text Mushaf-Standard & ohne Diakritika', 'King Fahd Glorious Quran Printing Complex (KFGQPC), Hafs v18', 'qurancomplex.gov.sa – unverändert, über quran-data-kfgqpc.'],
  ['Schrift KFGQPC Uthmanic Script Hafs', 'King Fahd Glorious Quran Printing Complex', 'Kostenlos zur Wiedergabe des Korans; unverändert eingebunden.'],
  ['Koran-Text & Schrift IndoPak', 'IndoPak Nastaleeq von Ayman Siddiqui & R. Siddiqua (QuranWBW.com / Quran.com)', 'Sadaqa-e-Jaria – nur mit Namensnennung, nicht verkaufen oder verändern.'],
  ['Tajwîd-Farben', 'Eigene Regel-Erkennung', 'Abgeglichen mit dem Datensatz quran-tajweed von Collin Fair (CC BY 4.0).'],
  ['Schriften', 'Amiri Quran, Aref Ruqaa, Reem Kufi – SIL Open Font License 1.1', 'Über Fontsource.'],
];
const selRowS = (k, label, opts) => `<div class="set-row"><span class="grow"><b>${label}</b></span><select data-qs="${k}">${opts.map(([v, n]) => `<option value="${v}" ${String(S.quran[k]) === String(v) ? 'selected' : ''}>${n}</option>`).join('')}</select></div>`;
function openSettings() {
  setSheet = openSheet(t('settings'), '', { onClose: () => { refreshSettings = null; setSheet = null; } });
  refreshSettings = () => { const y = setSheet.body.scrollTop; setSheet.body.innerHTML = settingsHtml(); bindSettings(setSheet.body); setSheet.body.scrollTop = y; };
  refreshSettings();
}
const swRow = (k, label, sub, on) => `<div class="set-row"><span class="grow"><b>${label}</b>${sub ? `<span>${sub}</span>` : ''}</span><label class="switch"><input type="checkbox" data-sw="${k}" ${on ? 'checked' : ''}><i></i></label></div>`;
function settingsHtml() {
  const helps = ['hStart', 'hPrayer', 'hTasbih', 'hQuran', 'hCalendar', 'hEdit', 'hOffline', 'hInstall'];
  const dlInfo = S.dl && S.dl.days ? (() => { const ks = Object.keys(S.dl.days).sort(); return ks.length ? t('dlRange', { a: fmtDate(fromKey(ks[0]), { day: 'numeric', month: 'short' }), b: fmtDate(fromKey(ks[ks.length - 1]), { day: 'numeric', month: 'short', year: 'numeric' }), n: esc(S.dl.name) }) : ''; })() : t('dlNoData');
  return `
  <div class="set-sec"><h4>${t('sHelp')}</h4><div class="set-box">${helps.map(h => `<details class="help"><summary>${t(h)}</summary><div>${t(h + 'T')}</div></details>`).join('')}</div></div>

  <div class="set-sec"><h4>${t('sProfile')}</h4><div class="set-box">
    <div class="set-row"><span class="grow"><b>${t('yourName')}</b><span>${t('yourNameSub')}</span></span><input type="text" id="sName" value="${esc(S.name)}" maxlength="24"></div></div></div>

  <div class="set-sec"><h4>${t('sLang')}</h4><div class="set-box"><div class="flags">${[['de', 'Deutsch'], ['tr', 'Türkçe'], ['ar', 'العربية']].map(([k, n]) => `<button data-lang="${k}" class="${S.lang === k ? 'on' : ''}">${FLAGS[k]}${n}</button>`).join('')}</div></div></div>

  <div class="set-sec"><h4>${t('sDesign')}</h4><div class="set-box">
    <div class="set-row set-head" style="border-top:0"><span class="grow"><b>${t('background')}</b></span></div>
    <div class="swatches">${Object.entries(THEMES).map(([k, [a, b]]) => `<button data-theme="${k}" class="${S.theme === k ? 'on' : ''}"><i style="background:linear-gradient(160deg,${a},${b})${k === 'oled' ? ';border-color:#333' : ''}"></i>${t('th_' + k)}</button>`).join('')}</div>
    <div class="set-row set-head"><span class="grow"><b>${t('appIcon')}</b><span>${t('appIconSub')}</span></span></div>
    <div class="swatches">${APP_ICONS.map(k => `<button data-icon="${k}" class="${S.appIcon === k ? 'on' : ''}"><i style="background:url(icons/alt/${k}-180.png) center/cover"></i>${t('ic_' + k)}</button>`).join('')}</div>
    <div class="set-row set-head"><span class="grow"><b>${t('beadDesign')}</b></span></div>
    <div class="design-row" style="padding:10px 12px">${Object.keys(BEADS).map(d => `<button data-bead="${d}" class="${S.beads === d ? 'on' : ''}"><img src="${beadIcon(d)}" style="width:100%;height:100%"></button>`).join('')}</div>
    <div class="set-row set-head"><span class="grow"><b>${t('compassDesign')}</b></span></div>
    <div class="design-row" style="padding:10px 12px">${COMPASS_DESIGNS.map(d => `<button data-cd="${d}" class="${S.compass === d ? 'on' : ''}">${compassSvg(d, 62)}</button>`).join('')}</div>
    <div class="set-row" style="border-top:1px solid var(--line)"><span class="grow"><b>${t('tasbihBg')}</b></span><select data-sel="tasbihBg"><option value="black" ${S.tasbihBg === 'black' ? 'selected' : ''}>${t('black')}</option><option value="theme" ${S.tasbihBg === 'theme' ? 'selected' : ''}>${t('appDesign')}</option></select></div>
  </div></div>

  <div class="set-sec"><h4>${t('sPrayer')}</h4><div class="set-box">
    <button class="set-row" style="width:100%" data-act="loc">${icon('pin')}<span class="grow" style="text-align:start"><b>${t('location')}</b><span>${placeLabel(S.loc)}${(S.trips || []).length ? ' · ' + t('tripsN', { n: S.trips.length }) : ''}</span></span>${icon('chev')}</button>
    <div class="set-row"><span class="grow"><b>${t('timeSource')}</b></span><div class="seg" style="width:62%"><button data-src="calc" class="${S.timeSource === 'calc' ? 'on' : ''}">${t('srcCalc')}</button><button data-src="dl" class="${S.timeSource === 'dl' ? 'on' : ''}">${t('srcDl')}</button></div></div>
    <div class="set-row"><span class="grow"><b>${t('method')}</b></span><select data-sel="method">${Object.entries(METHODS).map(([k, m]) => `<option value="${k}" ${S.method === k ? 'selected' : ''}>${m.label}</option>`).join('')}</select></div>
    <div class="set-row"><span class="grow"><b>${t('asrCalc')}</b></span><select data-sel="asr"><option value="standard" ${S.asr === 'standard' ? 'selected' : ''}>${t('asrStd')}</option><option value="hanafi" ${S.asr === 'hanafi' ? 'selected' : ''}>${t('asrHan')}</option></select></div>
    <div class="set-row"><span class="grow"><b>${t('prayerNames')}</b></span><select data-sel="pnames">${[['tr', 'Türkçe (Sabah, Öğle…)'], ['latin', 'Fajr, Dhuhr…'], ['ar', 'العربية'], ['de', 'Deutsch']].map(([k, n]) => `<option value="${k}" ${S.pnames === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <details class="help"><summary>${t('adjust')}</summary><div>${t('adjustSub')}${PKEYS.map(k => `<div class="set-row" style="padding:8px 0"><span class="grow"><b>${pname(k)}</b></span><div class="adj"><button data-adj="${k}|-1">−</button><b>${S.adj[k] > 0 ? '+' : ''}${S.adj[k]} min</b><button data-adj="${k}|1">+</button></div></div>`).join('')}</div></details>
    <details class="help" ${S.timeSource === 'dl' ? 'open' : ''}><summary>${t('dlTimes')}</summary><div>
      <p style="margin-top:0">${t('dlTimesSub')}</p><p><b style="color:var(--fg)">${dlInfo}</b></p>
      <select id="dlU" style="width:100%;margin-bottom:8px;background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:10px"><option>${t('country')}</option></select>
      <select id="dlS" style="width:100%;margin-bottom:8px;background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:10px" disabled><option>${t('city')}</option></select>
      <select id="dlI" style="width:100%;margin-bottom:10px;background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:10px" disabled><option>${t('district')}</option></select>
      <div class="row"><button class="btn grow" data-act="dlLoad">${t('loadList')}</button><button class="btn pri grow" data-act="dlGo" ${S.dl && S.dl.id ? '' : 'disabled'}>${icon('download')} ${t('download')}</button></div>
      ${S.dl ? `<button class="btn full sm" style="margin-top:8px" data-act="dlDel">${icon('trash')} ${t('dlDelete')}</button>` : ''}
    </div></details>
  </div></div>

  <div class="set-sec"><h4>${t('sCalendar')}</h4><div class="set-box">
    <div class="set-row"><span class="grow"><b>${t('hijriAdj')}</b><span>${t('hijriAdjSub')}</span></span><div class="adj"><button data-hadj="-1">−</button><b>${S.hijriAdj > 0 ? '+' : ''}${S.hijriAdj}</b><button data-hadj="1">+</button></div></div>
    ${swRow('kandil', t('showKandil'), t('showKandilSub'), S.kandil)}
    <div class="set-row"><span class="grow"><b>${t('weekStart')}</b></span><div class="seg" style="width:52%"><button data-ws="1" class="${S.weekStart === 1 ? 'on' : ''}">${t('monday')}</button><button data-ws="0" class="${S.weekStart === 0 ? 'on' : ''}">${t('sunday')}</button></div></div>
  </div></div>

  <div class="set-sec"><h4>${t('sQuran')}</h4><div class="set-box">
    ${scriptPicker('sScr')}
    <div class="set-row set-head"><span class="grow"><b>${t('readTheme')}</b></span></div>
    <div style="padding:0 12px 12px"><div class="seg">${['app', 'white', 'black', 'paper'].map(k => `<button data-srt="${k}" class="${(S.quran.theme || 'app') === k ? 'on' : ''}">${t('rt_' + k)}</button>`).join('')}</div></div>
    ${selRowS('stopAfter', t('stopAfter'), [['ayah', t('stopAyah')], ['surah', t('stopSurah')], ['juz', t('stopJuz')], ['never', t('stopNever')]])}
    ${selRowS('repeat', t('repeatAyah'), [[1, t('rep1')], [2, '2×'], [3, '3×'], [5, '5×'], [10, '10×'], [0, '∞']])}
    ${swRow('q_repeatSurah', t('repeatSurah'), '', S.quran.repeatSurah)}
    ${selRowS('kbps', t('quality'), [[128, '128 kbps'], [64, '64 kbps']])}
    <div class="set-row"><span class="grow"><b>${t('reciter')}</b><span>Mishary Rashid al-Afasy</span></span></div>
    <div class="set-row"><span class="grow"><b>${t('dlAudio')}</b><span id="audStat">${t('checking')}</span></span><button class="btn sm" data-act="audList">${t('manage')}</button></div>
    <div class="set-row"><span class="grow"><b>${t('importAudio')}</b><span>${t('importAudioSub')}</span></span><label class="btn sm">${icon('upload')}<input type="file" id="audFile" accept=".mp3,.zip,audio/mpeg,application/zip" multiple hidden></label></div>
    <button class="set-row" style="width:100%" data-act="audHelp">${icon('info')}<span class="grow" style="text-align:start"><b>${t('importHow')}</b><span>000_versebyverse.zip · ~1,7 GB</span></span>${icon('chev')}</button>
    <div class="set-row"><span class="grow"><b>${t('sourcesTitle')}</b><span>${t('sourcesQuran')}</span></span></div>
  </div></div>

  <div class="set-sec"><h4>${t('sRemind')}</h4><div class="set-box">${swRow('remind', t('remindMissed'), t('remindMissedSub'), S.remind)}</div></div>

  <div class="set-sec"><h4>${t('tasbih')}</h4><div class="set-box">${swRow('sound', t('tbSound'), '', S.tasbih.sound)}${swRow('haptic', t('tbHaptic'), t('tbHapticSub'), S.tasbih.haptic)}</div></div>

  <div class="set-sec"><h4>${t('sData')}</h4><div class="set-box">
    <button class="set-row" style="width:100%" data-act="export">${icon('download')}<span class="grow" style="text-align:start"><b>${t('backupExport')}</b><span>${t('backupExportSub')}</span></span></button>
    <label class="set-row" style="width:100%">${icon('upload')}<span class="grow"><b>${t('backupImport')}</b></span><input type="file" id="bkFile" accept=".json,application/json" hidden></label>
    <button class="set-row" style="width:100%;color:var(--danger)" data-act="wipe">${icon('trash')}<span class="grow" style="text-align:start"><b>${t('resetAll')}</b></span></button>
  </div></div>

  <div class="set-sec"><h4>${t('sUpdate')}</h4><div class="set-box">
    ${swRow('autoUpdate', t('autoUpdate'), t('autoUpdateSub'), S.autoUpdate)}
    ${!S.autoUpdate ? `<div class="set-row"><span class="grow"><b>${t('manualCheck')}</b><span>${UPDATE_READY ? t('updAvail') : t('version') + ' ' + APP.version}</span></span>${UPDATE_READY ? `<button class="btn sm pri" data-act="install">${t('install')}</button>` : `<button class="btn sm" data-act="check">${t('checkNow')}</button>`}</div>` : ''}
  </div></div>

  <div class="set-sec"><h4>${t('sPrivacy')}</h4><div class="set-box">
    <details class="help"><summary>⚠️ ${t('disclaimerTitle')}</summary><div>${t('disclaimerText')}</div></details>
    <details class="help"><summary>${t('privTitle')}</summary><div>${t('privText')}</div></details>
    <details class="help"><summary>${t('licTitle')}</summary><div>${LICENSES.map(([n, l, d]) => `<p style="margin:0 0 10px"><b style="color:var(--fg)">${n}</b> – ${l}<br>${d}</p>`).join('')}</div></details>
  </div></div>

  <div class="set-sec"><h4>${t('sAbout')}</h4><div class="set-box"><div class="about">
    <img class="about-icon" src="icons/alt/${S.appIcon || 'kaaba_gruen'}-512.png" width="72" height="72" style="border-radius:18px;box-shadow:var(--shadow)" alt="">
    <div style="font-size:22px;font-weight:800;margin-top:10px">${APP.name}</div>
    <div class="muted small">${t('version')} ${APP.version} · ${fmtDate(fromKey(APP.date), { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    <p class="heart">${t('madeWith')}</p>
    <p>${t('feedback')}</p>
    <p class="tiny">${t('privacy')}</p></div></div></div>`;
}
const EZ = 'https://ezanvakti.emushaf.net';
async function ezGet(path) { const r = await fetch(EZ + path, { mode: 'cors' }); if (!r.ok) throw new Error(r.status); return r.json(); }
function bindSettings(b) {
  const rerender = (all = true) => { save(); applyTheme(); if (all) renderAll(); refreshSettings && refreshSettings(); };
  $('#sName', b).onchange = e => { S.name = e.target.value.trim(); rerender(); };
  $$('[data-lang]', b).forEach(x => x.onclick = () => { S.lang = x.dataset.lang; setSheet.el.querySelector('.sh-h h3').textContent = t('settings'); rerender(); });
  $$('[data-theme]', b).forEach(x => x.onclick = () => { S.theme = x.dataset.theme; rerender(false); });
  $$('[data-icon]', b).forEach(x => x.onclick = () => { S.appIcon = x.dataset.icon; save(); applyIcon(); refreshSettings(); toast(t('appIconSet'), 4500); });
  $$('[data-bead]', b).forEach(x => x.onclick = () => { S.beads = x.dataset.bead; rerender(); });
  $$('[data-cd]', b).forEach(x => x.onclick = () => { S.compass = x.dataset.cd; rerender(); });
  $$('[data-sel]', b).forEach(x => x.onchange = () => { S[x.dataset.sel] = x.value; clearTimes(); rerender(); });
  $$('[data-src]', b).forEach(x => x.onclick = () => {
    if (x.dataset.src === 'dl' && !(S.dl && S.dl.days && Object.keys(S.dl.days).length)) toast(t('dlFirst'));
    S.timeSource = x.dataset.src; clearTimes(); rerender();
  });
  $$('[data-adj]', b).forEach(x => x.onclick = () => { const [k, d] = x.dataset.adj.split('|'); S.adj[k] = Math.max(-30, Math.min(30, S.adj[k] + +d)); clearTimes(); rerender(); });
  $$('[data-hadj]', b).forEach(x => x.onclick = () => { S.hijriAdj = Math.max(-2, Math.min(2, S.hijriAdj + +x.dataset.hadj)); hCache.clear(); evCache = null; rerender(); });
  bindScriptPicker(b, 'sScr', () => { if (typeof R !== 'undefined' && R) showSurah(R.s, R.a, true); });
  $$('[data-srt]', b).forEach(x => x.onclick = () => { S.quran.theme = x.dataset.srt; save(); applyReaderTheme(); refreshSettings(); });
  $$('[data-qs]', b).forEach(x => x.onchange = () => { const v = x.value; S.quran[x.dataset.qs] = isNaN(+v) ? v : +v; save(); renderAll(); });
  $$('[data-ws]', b).forEach(x => x.onclick = () => { S.weekStart = +x.dataset.ws; rerender(); });
  $$('[data-sw]', b).forEach(x => x.onchange = () => {
    const k = x.dataset.sw;
    if (k === 'sound' || k === 'haptic') S.tasbih[k] = x.checked; else if (k.startsWith('q_')) S.quran[k.slice(2)] = x.checked; else S[k] = x.checked;
    if (k === 'kandil') evCache = null;
    if (k === 'autoUpdate' && x.checked && UPDATE_READY) applyUpdate();
    rerender();
  });
  // Audio
  allKeys().then(keys => {
    keys = keys.filter(k => k.startsWith(S.quran.reciter + '/'));
    const per = {}; keys.forEach(k => { const s = +k.split('/')[1].slice(0, 3); per[s] = (per[s] || 0) + 1; });
    const full = Object.keys(per).filter(s => META && per[s] >= sMeta(+s)[5]).length;
    const el = $('#audStat', b); if (el) el.textContent = keys.length ? t('audStat', { s: full, n: keys.length }) : t('dlNone');
  });
  $('#audFile', b).onchange = async e => { const f = [...e.target.files]; if (!f.length) return; toast(t('importing', { n: 0 })); await importAudio(f, m => { const el = $('#audStat', b); if (el) el.textContent = m; }); refreshSettings && refreshSettings(); };
  // Aktionen
  b.onclick = async e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    if (act === 'loc') openLocation();
    if (act === 'check') checkUpdate();
    if (act === 'install') applyUpdate();
    if (act === 'audList') openAudioManager();
    if (act === 'audHelp') openAudioHelp();
    if (act === 'export') exportBackup();
    if (act === 'wipe') {
      if (a.dataset.armed) { localStorage.removeItem('nur_state'); try { await deleteAllAudio(); } catch (x) {} location.reload(); }
      else { a.dataset.armed = 1; a.querySelector('b').textContent = t('resetConfirm'); }
    }
    if (act === 'dlDel') { S.dl = null; S.timeSource = 'calc'; clearTimes(); rerender(); }
    if (act === 'dlLoad') {
      if (!navigator.onLine) return toast(t('offline'));
      try {
        const U = await ezGet('/ulkeler'), sel = $('#dlU', b);
        sel.innerHTML = `<option value="">${t('country')}</option>` + U.map(u => `<option value="${u.UlkeID}" ${/ALMANYA/i.test(u.UlkeAdi) ? 'selected' : ''}>${esc(u.UlkeAdi)}</option>`).join('');
        const loadS = async () => { const S2 = await ezGet('/sehirler/' + sel.value), s = $('#dlS', b); s.disabled = false; s.innerHTML = `<option value="">${t('city')}</option>` + S2.map(x => `<option value="${x.SehirID}">${esc(x.SehirAdi)}</option>`).join(''); };
        sel.onchange = loadS; if (sel.value) await loadS();
        $('#dlS', b).onchange = async () => { const I = await ezGet('/ilceler/' + $('#dlS', b).value), s = $('#dlI', b); s.disabled = false; s.innerHTML = `<option value="">${t('district')}</option>` + I.map(x => `<option value="${x.IlceID}">${esc(x.IlceAdi)}</option>`).join(''); };
        $('#dlI', b).onchange = () => { const s = $('#dlI', b); S.dl = { ...(S.dl || {}), id: s.value, name: s.options[s.selectedIndex].text, days: S.dl && S.dl.id === s.value ? S.dl.days : {} }; save(); $('[data-act="dlGo"]', b).disabled = !s.value; };
      } catch (x) { toast(t('dlServerFail'), 5000); }
    }
    if (act === 'dlGo') {
      if (!navigator.onLine) return toast(t('offline'));
      try {
        const V = await ezGet('/vakitler/' + S.dl.id), days = S.dl.days || {};
        V.forEach(v => { const [d, m, y] = v.MiladiTarihKisa.split('.'); days[`${y}-${m}-${d}`] = [v.Imsak, v.Gunes, v.Ogle, v.Ikindi, v.Aksam, v.Yatsi]; });
        const cut = keyOf(addDays(new Date(), -40)); Object.keys(days).forEach(k => { if (k < cut) delete days[k]; });
        S.dl.days = days; S.dl.tz = S.loc.tz; S.dl.loc = { lat: S.loc.lat, lon: S.loc.lon }; S.timeSource = 'dl'; clearTimes();
        toast(t('dlTimesDone', { n: V.length })); rerender();
      } catch (x) { toast(t('dlServerFail'), 5000); }
    }
  };
  $('#bkFile', b).onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const d = JSON.parse(await f.text()); if (!d || typeof d !== 'object' || !d.__nur) throw 0; delete d.__nur; S = deepMerge(structuredClone(DEFAULTS), d); save(true); toast(t('backupLoaded')); applyTheme(); renderAll(); refreshSettings(); }
    catch (x) { toast(t('backupBad')); }
  };
}
function exportBackup() {
  const blob = new Blob([JSON.stringify({ __nur: APP.version, ...S }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Nuraya-Backup-${todayKey()}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function openAudioManager() {
  await loadMeta();
  const keys = (await allKeys()).filter(k => k.startsWith(S.quran.reciter + '/')), per = {};
  keys.forEach(k => { const s = +k.split('/')[1].slice(0, 3); per[s] = (per[s] || 0) + 1; });
  const row = m => { const n = per[m[0]] || 0, full = n >= m[5]; return `<div class="dl-row">${SNUM(m[0])}<div class="grow"><b>${sName(m[0])}</b><span>${full ? t('dlDone') : n ? t('dlPartial', { n, m: m[5] }) : t('dlNone')}</span></div>
    ${n ? `<button class="rbtn" data-del="${m[0]}">${icon('trash')}</button>` : ''}${!full ? `<button class="rbtn" data-get="${m[0]}">${icon('download')}</button>` : ''}</div>`; };
  const sh = openSheet(t('dlAudio'), `<p class="tiny" style="margin:0 4px 10px">${t('dlAudioNote')}</p><button class="btn full sm" data-delall>${icon('trash')} ${t('deleteAll')}</button><div id="amL">${META.surahs.map(row).join('')}</div>`);
  sh.body.onclick = async e => {
    const d = e.target.closest('[data-del]'), g = e.target.closest('[data-get]'), all = e.target.closest('[data-delall]');
    if (d) { await deleteSurahAudio(+d.dataset.del); delete per[+d.dataset.del]; d.closest('.dl-row').outerHTML = row(sMeta(+d.dataset.del)); }
    if (g) { const s = +g.dataset.get, r = g.closest('.dl-row'); await downloadSurah(s, msg => { const sp = r.querySelector('.grow span'); if (sp) sp.textContent = msg; }); per[s] = await surahDownloaded(s); r.outerHTML = row(sMeta(s)); }
    if (all) { await deleteAllAudio(); sh.close(); toast(t('deleted')); }
  };
}
