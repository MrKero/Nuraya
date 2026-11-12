/* Nuraya – Tajwîd: Leseregeln und Pausezeichen (Beispiele aus dem Koran-Text der App) */
'use strict';
// [Schlüssel, Farbe, Sure, Vers, hervorgehobene Wörter (Index)]
const TJ_RULES = [
  ['ghunna', '#3fbf6a', 108, 1, [0]],
  ['qalqala', '#4a9df0', 112, 3, [1, 3]],
  ['izhar', '#9fb4c8', 2, 62, [7, 8]],
  ['idgham', '#e06fb4', 2, 8, [2, 3]],
  ['idghamNo', '#e8837a', 2, 5, [3, 4]],
  ['iqlab', '#f0a33a', 104, 4, [1]],
  ['ikhfa', '#e2c64a', 2, 4, [7, 8]],
  ['idghamMeem', '#e06fb4', 2, 10, [1, 2]],
  ['ikhfaMeem', '#e2c64a', 105, 4, [0, 1]],
  ['madd2', '#b98cf0', 114, 1, [3]],
  ['maddMuttasil', '#d9534f', 110, 1, [1]],
  ['maddMunfasil', '#e67a5a', 108, 1, [0, 1]],
  ['maddLazim', '#b5303a', 1, 7, [8]],
  ['maddArid', '#c97ab0', 1, 1, [3]],
  ['lamShams', '#8aa0ff', 91, 1, [0]],
  ['lamQamar', '#5ec9c0', 91, 2, [0]],
  ['lafzAllah', '#f0c060', 112, 1, [2]],
  ['ra', '#ff9f80', 113, 1, [2]],
  ['silent', '#97a2ad', 2, 6, [1, 2]],
];
// [Schlüssel, Zeichen (Anzeige), Unicode-Markierung im Text, Sure, Vers]
const TJ_STOPS = [
  ['lazim', 'م', 'ۘ', 54, 6],
  ['qili', 'قلى', 'ۗ', 3, 34],
  ['jaiz', 'ج', 'ۚ', 38, 1],
  ['sila', 'صلى', 'ۖ', 37, 9],
  ['la', 'لا', 'ۙ', 2, 262],
  ['muanaqa', '∴', 'ۛ', 2, 2],
  ['sakta', 'س', 'ۜ', 18, 1],
  ['ayahEnd', '۝', '', 112, 1],
  ['sajda', '۩', '۩', 53, 62],
];
let TJ_TAB = 'all';
async function tjVerse(s, a) { const v = await loadSurah(s); return v[a - 1][0]; }
function tjHighlight(text, idx, color) { return text.split(' ').map((w, i) => idx.includes(i) ? `<span style="color:${color}">${w}</span>` : w).join(' '); }
async function tjStopExample(key, mark, s, a) {
  let txt = await tjVerse(s, a);
  if (key === 'la' && !txt.includes(mark)) txt = txt.replace('أَذࣰى', 'أَذࣰى' + mark); // Zeichen wie im Medina-Mushaf ergänzen
  if (key === 'sakta' && !txt.includes(mark)) { s = 69; a = 28; txt = await tjVerse(s, a); }
  const words = txt.split(' ');
  const idx = words.map((w, i) => mark && w.includes(mark) ? i : -1).filter(i => i >= 0);
  return { s, a, html: tjHighlight(txt, idx.length ? idx : [], 'var(--accent)') };
}
async function openTajweed() {
  await loadMeta();
  const v = openView(`<div class="v-h"><button class="rbtn" data-back>${icon('back')}</button><h3>${t('tjTitle')}</h3><div style="width:44px"></div></div>
    <div class="tj-tabs">${['all', 'rules', 'stops'].map(k => `<button data-tj="${k}" class="${TJ_TAB === k ? 'on' : ''}">${t('tjTab_' + k)}</button>`).join('')}</div>
    <div class="v-b" id="tjBody" style="padding:4px 16px 40px"></div>`, { onClose: () => { if (AU.single) stopAudio(); } });
  const el = v.el, body = $('#tjBody', el);
  const ruleCard = async ([k, c, s, a, idx]) => `<div class="tj-rule"><b style="color:${c}">${t('tj_' + k)}</b><p>${t('tj_' + k + 'T')}</p>
      <div class="row tj-ex"><button class="rbtn" data-tjp="${s}|${a}">${icon('play')}</button><div class="ar grow">${tjHighlight(await tjVerse(s, a), idx, c)}</div></div>
      <div class="tiny">${sName(s)} ${s}:${a}${t('tj_' + k + 'N') !== 'tj_' + k + 'N' ? ' · ' + t('tj_' + k + 'N') : ''}</div></div>`;
  const stopRow = async ([k, sign, mark, s, a]) => { const ex = await tjStopExample(k, mark, s, a);
    return `<details class="tj-stop"><summary><span class="tj-sign ar">${sign}</span><span class="grow">${t('tjs_' + k)}</span></summary>
      <div><p>${t('tjs_' + k + 'T')}</p><div class="row tj-ex"><button class="rbtn" data-tjp="${ex.s}|${ex.a}">${icon('play')}</button><div class="ar grow">${ex.html}</div></div>
      <div class="tiny">${sName(ex.s)} ${ex.s}:${ex.a}</div></div></details>`; };
  const draw = async () => {
    let h = '';
    if (TJ_TAB === 'all') h += `<h2 class="tj-h">${t('tjWhat')}</h2><div class="card" style="line-height:1.5">${t('tjWhatT')}</div>`;
    if (TJ_TAB !== 'stops') h += `<h2 class="tj-h">${t('tjTab_rules')}</h2><div class="card tj-list">${(await Promise.all(TJ_RULES.map(ruleCard))).join('')}</div>`;
    if (TJ_TAB !== 'rules') h += `<h2 class="tj-h">${t('tjTab_stops')}</h2><div class="card tj-list" style="padding:4px 14px">${(await Promise.all(TJ_STOPS.map(stopRow))).join('')}</div>`;
    h += `<p class="tiny" style="margin:14px 4px">${t('tjAuto') + '<br><br>' + t('tjNote')}</p>`;
    body.innerHTML = h; body.scrollTop = 0;
  };
  el.addEventListener('click', e => {
    const tb = e.target.closest('[data-tj]'); if (tb) { TJ_TAB = tb.dataset.tj; $$('[data-tj]', el).forEach(x => x.classList.toggle('on', x === tb)); draw(); }
    const p = e.target.closest('[data-tjp]');
    if (p) { const [s, a] = p.dataset.tjp.split('|').map(Number); if (AU.playing && AU.single && AU.s === s && AU.a === a) { stopAudio(); } else { AU.single = true; playFrom(s, a, false); } }
  });
  draw();
}
