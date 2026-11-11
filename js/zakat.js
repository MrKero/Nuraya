/* Nuraya – Zakat-Rechner (Orientierungshilfe, keine Fatwa) */
'use strict';
const ZK_FIELDS = [
  ['cash', 'zkCash', 'zkCashSub', 'money'],
  ['goldG', 'zkGold', 'zkGoldSub', 'g'],
  ['silverG', 'zkSilver', 'zkSilverSub', 'g'],
  ['invest', 'zkInvest', 'zkInvestSub', 'money'],
  ['receivables', 'zkRecv', 'zkRecvSub', 'money'],
  ['trade', 'zkTrade', 'zkTradeSub', 'money'],
  ['realestate', 'zkRealEstate', 'zkRealEstateSub', 'money'],
  ['rentSaved', 'zkRent', 'zkRentSub', 'money'],
  ['other', 'zkOther', 'zkOtherSub', 'money'],
];
const ZK_BASIS = { gold85: ['gold', 85], gold8018: ['gold', 80.18], silver595: ['silver', 595] };
const zk = () => S.zakat;
const money = v => { try { return new Intl.NumberFormat(locale(), { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(v) + ' ' + zk().cur; } catch (e) { return v.toFixed(2) + ' ' + zk().cur; } };
function zakatCalc() {
  const Z = zk(), V = Z.vals, num = k => Math.max(0, +V[k] || 0);
  const goldVal = num('goldG') * (+Z.goldPrice || 0), silverVal = num('silverG') * (+Z.silverPrice || 0);
  const assets = num('cash') + goldVal + silverVal + num('invest') + num('receivables') + num('trade') + num('realestate') + num('rentSaved') + num('other');
  const net = assets - Math.max(0, +V.debts || 0);
  const [metal, grams] = ZK_BASIS[Z.basis] || ZK_BASIS.gold85;
  const price = metal === 'gold' ? +Z.goldPrice : +Z.silverPrice;
  const nisab = price > 0 ? grams * price : null;
  return { assets, net, nisab, due: nisab != null && net >= nisab ? net * 0.025 : 0, metal, grams, price };
}
/* Vieh nach den überlieferten Tabellen (frei weidend, ein Mondjahr im Besitz) */
function camelZakat(n) {
  if (n < 5) return '';
  if (n < 25) return t('zkSheepN', { n: Math.floor(n / 5) });
  if (n <= 35) return t('zkBintMakhad');
  if (n <= 45) return t('zkBintLabun', { n: 1 });
  if (n <= 60) return t('zkHiqqa', { n: 1 });
  if (n <= 75) return t('zkJadhaa');
  if (n <= 90) return t('zkBintLabun', { n: 2 });
  if (n <= 120) return t('zkHiqqa', { n: 2 });
  let best = [0, 0, -1]; // [Hiqqa (je 50), Bint Labun (je 40), abgedeckt]
  for (let h = 0; h * 50 <= n; h++) { const b = Math.floor((n - h * 50) / 40), c = h * 50 + b * 40; if (c > best[2]) best = [h, b, c]; }
  return [best[0] ? t('zkHiqqa', { n: best[0] }) : '', best[1] ? t('zkBintLabun', { n: best[1] }) : ''].filter(Boolean).join(' + ');
}
function cowZakat(n) {
  if (n < 30) return '';
  if (n < 40) return t('zkTabi', { n: 1 });
  if (n < 60) return t('zkMusinna', { n: 1 });
  let best = [0, 0, -1];
  for (let m = 0; m * 40 <= n; m++) { const tb = Math.floor((n - m * 40) / 30), c = m * 40 + tb * 30; if (c > best[2]) best = [tb, m, c]; }
  return [best[0] ? t('zkTabi', { n: best[0] }) : '', best[1] ? t('zkMusinna', { n: best[1] }) : ''].filter(Boolean).join(' + ');
}
function sheepZakat(n) {
  if (n < 40) return '';
  const k = n <= 120 ? 1 : n <= 200 ? 2 : n < 400 ? 3 : Math.floor(n / 100);
  return t('zkSheepN', { n: k });
}
function agriZakat() {
  const A = zk().agri, kg = +A.kg || 0, rate = { rain: .1, irrigated: .05, mixed: .075 }[A.water] || .1;
  return { kg, rate, due: kg >= 653 ? kg * rate : 0 };
}

registerSection('start', {
  id: 'zakat', title: () => t('zakat'),
  render() {
    const r = zakatCalc();
    return `<div class="sec-h"><h2>${t('zakat')}</h2></div>
      <button class="card row" style="width:100%;text-align:start" data-zk-open>
        <span style="font-size:30px">🤲</span><div class="grow"><b style="font-size:17px">${t('zkTitle')}</b>
        <div class="muted small">${r.assets > 0 ? (r.due > 0 ? t('zkDueShort', { v: money(r.due) }) : t('zkBelowShort')) : t('zkTeaser')}</div></div>${icon('chev')}</button>`;
  },
  after(el) { $('[data-zk-open]', el).onclick = openZakat; },
});

function openZakat() {
  const Z = zk();
  const inp = (path, val, unit, ph = '0') => `<div class="zk-inp"><input type="number" inputmode="decimal" min="0" step="any" data-zk="${path}" value="${val || ''}" placeholder="${ph}"><span>${unit}</span></div>`;
  const v = openView(`<div class="v-h"><button class="rbtn" data-back>${icon('back')}</button><h3>${t('zkTitle')}</h3><div style="width:44px"></div></div>
    <div class="v-b" style="padding:0 16px 60px">
      <div class="card zk-result" id="zkRes"></div>

      <div class="set-sec" style="margin-top:16px"><h4>${t('zkWhat')}</h4><div class="set-box">
        <details class="help" open><summary>${t('zkNotTitle')}</summary><div>${t('zkNotText')}</div></details>
        <details class="help"><summary>${t('zkRentTitle')}</summary><div>${t('zkRentText')}</div></details>
        <details class="help"><summary>${t('zkCondTitle')}</summary><div>${t('zkCondText')}</div></details></div></div>

      <div class="set-sec"><h4>${t('zkNisab')}</h4><div class="set-box">
        <div style="padding:12px"><div class="seg">${Object.keys(ZK_BASIS).map(k => `<button data-zb="${k}" class="${Z.basis === k ? 'on' : ''}">${t('zkB_' + k)}</button>`).join('')}</div>
        <p class="tiny" style="margin:8px 2px 0">${t('zkBasisNote')}</p></div>
        <div class="set-row"><span class="grow"><b>${t('zkGoldPrice')}</b><span>${t('zkPriceSub')}</span></span>${inp('goldPrice', Z.goldPrice, Z.cur + '/g')}</div>
        <div class="set-row"><span class="grow"><b>${t('zkSilverPrice')}</b></span>${inp('silverPrice', Z.silverPrice, Z.cur + '/g')}</div>
        <div class="set-row"><span class="grow"><b>${t('zkCurrency')}</b></span><select data-zcur>${['€', '₺', '$', 'CHF', '£'].map(c => `<option ${Z.cur === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div></div>

      <div class="set-sec"><h4>${t('zkAssets')}</h4><div class="set-box">
        ${ZK_FIELDS.map(([k, l, sub, u]) => `<div class="set-row"><span class="grow"><b>${t(l)}</b><span>${t(sub)}</span></span>${inp('vals.' + k, Z.vals[k], u === 'g' ? 'g' : Z.cur)}</div>`).join('')}</div></div>

      <div class="set-sec"><h4>${t('zkDebtsH')}</h4><div class="set-box">
        <div class="set-row"><span class="grow"><b>${t('zkDebts')}</b><span>${t('zkDebtsSub')}</span></span>${inp('vals.debts', Z.vals.debts, Z.cur)}</div></div></div>

      <div class="set-sec"><h4>${t('zkAgri')}</h4><div class="set-box">
        <div class="set-row"><span class="grow"><b>${t('zkHarvest')}</b><span>${t('zkHarvestSub')}</span></span>${inp('agri.kg', Z.agri.kg, 'kg')}</div>
        <div style="padding:0 12px 12px"><div class="seg" style="font-size:12.5px">${['rain', 'irrigated', 'mixed'].map(k => `<button data-zw="${k}" class="${Z.agri.water === k ? 'on' : ''}">${t('zkW_' + k)}</button>`).join('')}</div></div>
        <div class="set-row"><span class="grow" id="zkAgriRes"></span></div></div></div>

      <div class="set-sec"><h4>${t('zkLive')}</h4><div class="set-box">
        <div class="set-row"><span class="grow"><b>🐪 ${t('zkCamels')}</b><span id="zkCamelR"></span></span>${inp('live.camel', Z.live.camel, t('zkHead'))}</div>
        <div class="set-row"><span class="grow"><b>🐄 ${t('zkCows')}</b><span id="zkCowR"></span></span>${inp('live.cow', Z.live.cow, t('zkHead'))}</div>
        <div class="set-row"><span class="grow"><b>🐑 ${t('zkSheep')}</b><span id="zkSheepR"></span></span>${inp('live.sheep', Z.live.sheep, t('zkHead'))}</div>
        <div class="set-row"><span class="grow"><span>${t('zkLiveNote')}</span></span></div></div></div>

      <div class="card" style="border-color:var(--warn)"><b>⚠️ ${t('disclaimer')}</b><p class="muted small" style="margin:6px 0 0;line-height:1.5">${t('zkDisclaimer')}</p></div>
      <button class="btn full" style="margin-top:14px" data-zk-reset>${icon('reset')} ${t('zkReset')}</button>
    </div>`, { onClose: () => renderPage('start') });
  const el = v.el;
  const update = () => {
    const r = zakatCalc();
    $('#zkRes', el).innerHTML = `<div class="row"><div class="grow"><div class="muted small">${t('zkNet')}</div><div style="font-size:22px;font-weight:800">${money(r.net)}</div></div>
        <div style="text-align:end"><div class="muted small">${t('zkNisab')} (${r.grams} g ${t(r.metal === 'gold' ? 'zkGoldW' : 'zkSilverW')})</div><div style="font-size:16px;font-weight:700">${r.nisab != null ? money(r.nisab) : '—'}</div></div></div>
      <div class="zk-due ${r.due > 0 ? 'yes' : ''}">${r.nisab == null ? t('zkNeedPrice', { m: t(r.metal === 'gold' ? 'zkGoldW' : 'zkSilverW') }) : r.due > 0 ? `${t('zkDue')}<b>${money(r.due)}</b><span>2,5 % · ${t('zkHawl')}</span>` : t('zkBelow')}</div>`;
    const A = agriZakat();
    $('#zkAgriRes', el).innerHTML = A.kg ? (A.due ? `<b>${t('zkAgriDue', { kg: fmtNum(Math.round(A.due * 10) / 10), p: String(A.rate * 100).replace('.', ',') })}</b>` : `<span>${t('zkAgriBelow')}</span>`) : `<span>${t('zkAgriInfo')}</span>`;
    const L = zk().live;
    $('#zkCamelR', el).textContent = camelZakat(+L.camel || 0) || t('zkMinCamel');
    $('#zkCowR', el).textContent = cowZakat(+L.cow || 0) || t('zkMinCow');
    $('#zkSheepR', el).textContent = sheepZakat(+L.sheep || 0) || t('zkMinSheep');
  };
  el.addEventListener('input', e => {
    const i = e.target.closest('[data-zk]'); if (!i) return;
    const path = i.dataset.zk.split('.'), val = i.value === '' ? '' : Math.max(0, parseFloat(i.value.replace(',', '.')) || 0);
    let o = S.zakat; for (let j = 0; j < path.length - 1; j++) o = o[path[j]]; o[path[path.length - 1]] = val;
    save(); update();
  });
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-zb]'); if (b) { S.zakat.basis = b.dataset.zb; $$('[data-zb]', el).forEach(x => x.classList.toggle('on', x === b)); save(); update(); }
    const w = e.target.closest('[data-zw]'); if (w) { S.zakat.agri.water = w.dataset.zw; $$('[data-zw]', el).forEach(x => x.classList.toggle('on', x === w)); save(); update(); }
    if (e.target.closest('[data-zk-reset]')) { const keep = { cur: S.zakat.cur, basis: S.zakat.basis, goldPrice: S.zakat.goldPrice, silverPrice: S.zakat.silverPrice }; S.zakat = deepMerge(structuredClone(DEFAULTS.zakat), keep); save(); v.close(); setTimeout(openZakat, 350); }
  });
  $('[data-zcur]', el).onchange = e => { S.zakat.cur = e.target.value; save(); v.close(); setTimeout(openZakat, 350); };
  update();
}
