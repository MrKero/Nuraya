/* Nuraya – Tasbih (Gebetskette) mit Dhikr */
'use strict';
const DHIKR = [
  { id: 'subhanallah', ar: 'سُبْحَانَ اللّٰهِ', lat: 'Sübhânallah', de: 'Gepriesen sei Allah (frei von jedem Makel).', tr: 'Allah her türlü eksiklikten uzaktır.', n: 33 },
  { id: 'elhamdulillah', ar: 'اَلْحَمْدُ لِلّٰهِ', lat: 'Elhamdülillah', de: 'Alles Lob gebührt Allah.', tr: 'Hamd Allah\'a mahsustur.', n: 33 },
  { id: 'allahuekber', ar: 'اَللّٰهُ أَكْبَرُ', lat: 'Allâhu Ekber', de: 'Allah ist größer (als alles).', tr: 'Allah en büyüktür.', n: 33 },
  { id: 'tehlil', ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ', lat: 'Lâ ilâhe illallah', de: 'Es gibt keinen Gott außer Allah.', tr: 'Allah\'tan başka ilah yoktur.', n: 100 },
  { id: 'estagfirullah', ar: 'أَسْتَغْفِرُ اللّٰهَ', lat: 'Estağfirullah', de: 'Ich bitte Allah um Vergebung.', tr: 'Allah\'tan bağışlanma dilerim.', n: 100 },
  { id: 'subhanallahiwabihamdihi', ar: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ', lat: 'Sübhânallâhi ve bi hamdihî', de: 'Gepriesen sei Allah und Lob sei Ihm.', tr: 'Allah\'ı hamd ile tesbih ederim.', n: 100 },
  { id: 'subhanallahiladhim', ar: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ، سُبْحَانَ اللّٰهِ الْعَظِيمِ', lat: 'Sübhânallâhi ve bi hamdihî, sübhânallâhil azîm', de: 'Gepriesen sei Allah und Lob sei Ihm, gepriesen sei Allah, der Gewaltige.', tr: 'Allah\'ı hamd ile tesbih ederim, yüce Allah\'ı tesbih ederim.', n: 100 },
  { id: 'hawqala', ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ', lat: 'Lâ havle ve lâ kuvvete illâ billâh', de: 'Es gibt keine Macht und keine Kraft außer bei Allah.', tr: 'Güç ve kuvvet ancak Allah\'tandır.', n: 33 },
  { id: 'salawat', ar: 'اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ', lat: 'Allâhümme salli alâ seyyidinâ Muhammed', de: 'O Allah, segne unseren Meister Muhammad.', tr: 'Allah\'ım, efendimiz Muhammed\'e salât eyle.', n: 100 },
  { id: 'tehlil_full', ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', lat: 'Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehül mülkü ve lehül hamdü ve hüve alâ külli şey\'in kadîr', de: 'Es gibt keinen Gott außer Allah, dem Einzigen ohne Partner. Ihm gehört die Herrschaft und Ihm gebührt das Lob, und Er hat Macht über alle Dinge.', tr: 'Allah\'tan başka ilah yoktur; O tektir, ortağı yoktur. Mülk O\'nundur, hamd O\'na mahsustur ve O her şeye kadirdir.', n: 100 },
  { id: 'hasbunallah', ar: 'حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ', lat: 'Hasbünallâhu ve ni\'mel vekîl', de: 'Allah genügt uns, und welch vortrefflicher Sachwalter ist Er.', tr: 'Allah bize yeter, O ne güzel vekildir.', n: 100 },
  { id: 'free', ar: '', lat: '', de: '', tr: '', n: 0, free: true },
];
const DAILY = [
  { id: 'tesbihat', seq: ['subhanallah', 'elhamdulillah', 'allahuekber'], n: 33, key: 'dTesbihat' },
  { id: 'd_morning', seq: ['subhanallahiwabihamdihi'], n: 100, key: 'dMorning' },
  { id: 'd_istighfar', seq: ['estagfirullah'], n: 100, key: 'dIstighfar' },
  { id: 'd_tehlil', seq: ['tehlil_full'], n: 100, key: 'dTehlil' },
  { id: 'd_salawat', seq: ['salawat'], n: 100, key: 'dSalawat' },
];
const dhikrById = id => DHIKR.find(d => d.id === id) || DHIKR[0];
const dhikrName = d => d.free ? t('freeCount') : d.lat;
const dhikrMeaning = d => S.lang === 'tr' ? d.tr : S.lang === 'ar' ? '' : d.de;
const counter = () => S.tasbih.counters[S.tasbih.active] || S.tasbih.counters[0];

/* ---------------- Perlen-Designs (Canvas) ---------------- */
const BEADS = {
  onyx: { g: ['#7a7a7a', '#1a1a1a', '#000'] },
  perle: { g: ['#ffffff', '#dedede', '#8e8e8e'] },
  bernstein: { g: ['#fff7b0', '#e3c21c', '#7d6200'] },
  holz: { g: ['#f1cfa5', '#bb8253', '#6b4224'] },
  walnuss: { g: ['#d39a62', '#8a5a33', '#3e2412'], stripes: 'rgba(60,30,10,.38)' },
  tigerauge: { g: ['#e9b85a', '#9b6420', '#3b220a'], stripes: 'rgba(255,215,120,.35)' },
  tuerkis: { g: ['#c8fff6', '#22b3a1', '#085049'] },
  rose: { g: ['#fff0f4', '#e59ab2', '#8f4560'] },
  smaragd: { g: ['#c6ffd9', '#1f9d55', '#0a4223'] },
  lapis: { g: ['#b3c8ff', '#2b4fb3', '#0c1a4d'], specks: '#e8c75a' },
  rot: { g: ['#ffb3b3', '#c62828', '#4d0a0a'] },
  marmor: { g: ['#ffffff', '#ecebe7', '#a8a59e'], veins: ['rgba(110,110,118,.55)', 'rgba(160,160,168,.4)'], gloss: 1 },
  marmor_schwarz: { g: ['#5a5a5e', '#17171a', '#000000'], veins: ['rgba(235,235,235,.6)', 'rgba(200,200,205,.35)'], gloss: 1 },
  marmor_gruen: { g: ['#b9e6cf', '#2e8b62', '#0b3d27'], veins: ['rgba(230,250,240,.55)', 'rgba(20,60,40,.45)'], gloss: 1 },
};
const BEAD_MAT = d => /marmor|onyx|lapis|smaragd|tuerkis|tigerauge|rose/.test(d) ? 'stone' : /holz|walnuss/.test(d) ? 'wood' : 'pearl';
function rnd(seed) { let x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
function drawBead(ctx, x, y, r, design, seed = 1) {
  const B = BEADS[design] || BEADS.onyx;
  ctx.save();
  // Schatten
  ctx.beginPath(); ctx.arc(x + r * .08, y + r * .14, r, 0, 7); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.filter = 'blur(' + r * .12 + 'px)'; ctx.fill(); ctx.filter = 'none';
  const g = ctx.createRadialGradient(x - r * .38, y - r * .42, r * .08, x, y, r * 1.05);
  g.addColorStop(0, B.g[0]); g.addColorStop(.55, B.g[1]); g.addColorStop(1, B.g[2]);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = g; ctx.fill();
  if (B.veins) {
    // Marmor-Adern: geschwungene Linien, je Perle leicht anders
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const a = rnd(seed * 7 + i) * Math.PI * 2, b = a + Math.PI * (0.6 + rnd(seed * 3 + i) * 0.6);
      ctx.strokeStyle = B.veins[i % 2]; ctx.lineWidth = r * (0.025 + rnd(seed + i * 5) * 0.06);
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1);
      ctx.bezierCurveTo(x + (rnd(seed + i) - .5) * r * 1.6, y + (rnd(seed * 2 + i) - .5) * r * 1.6, x + (rnd(seed * 4 + i) - .5) * r * 1.6, y + (rnd(seed * 6 + i) - .5) * r * 1.6, x + Math.cos(b) * r * 1.1, y + Math.sin(b) * r * 1.1);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (B.stripes || B.specks) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    if (B.stripes) { ctx.strokeStyle = B.stripes; ctx.lineWidth = r * .09; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.ellipse(x, y + i * r * .26, r * 1.3, r * .18, -.25, 0, Math.PI); ctx.stroke(); } }
    if (B.specks) { ctx.fillStyle = B.specks; for (let i = 0; i < 9; i++) { const a = i * 2.4, d = (i * .37 % 1) * r * .8; ctx.globalAlpha = .7; ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, r * .07, r * .07); } ctx.globalAlpha = 1; }
    ctx.restore();
  }
  // Glanz
  const h = ctx.createRadialGradient(x - r * .35, y - r * .45, 0, x - r * .35, y - r * .45, r * .55);
  h.addColorStop(0, 'rgba(255,255,255,.75)'); h.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = h; ctx.fill();
  if (B.gloss) {
    // polierter Glanz: scharfer Lichtpunkt + Randlicht unten rechts
    ctx.beginPath(); ctx.ellipse(x - r * .36, y - r * .42, r * .22, r * .13, -.6, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill();
    const rim = ctx.createRadialGradient(x + r * .45, y + r * .5, 0, x + r * .45, y + r * .5, r * .6);
    rim.addColorStop(0, 'rgba(255,255,255,.35)'); rim.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = rim; ctx.fill();
  }
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
  ctx.restore();
}
/* Vorgerenderte Perlen (inkl. Schatten) – pro Bild nur noch drawImage, dadurch flüssig */
const SPRITES = new Map();
function beadSprite(design, seed, r) {
  const dpr = Math.min(3, devicePixelRatio || 1), key = design + '|' + (BEADS[design] && BEADS[design].veins ? seed : 0) + '|' + Math.round(r * 10);
  let c = SPRITES.get(key);
  if (!c) {
    const pad = Math.ceil(r * .45), size = Math.ceil((r * 2 + pad * 2) * dpr);
    c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    drawBead(x, r + pad, r + pad, r, design, seed);
    c.off = r + pad; c.dpr = dpr;
    if (SPRITES.size > 400) SPRITES.clear();
    SPRITES.set(key, c);
  }
  return c;
}
function beadIcon(design, size = 62) {
  const c = document.createElement('canvas'), dpr = devicePixelRatio || 1;
  c.width = c.height = size * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr);
  drawBead(x, size / 2, size / 2, size * .44, design, 3); return c.toDataURL();
}

/* ---------------- Kette entlang einer Kurve ---------------- */
class BeadChain {
  constructor(canvas, opts = {}) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.o = opts;
    this.disp = opts.start || 0; this.target = this.disp; this.anim = null; this.resize();
  }
  resize() {
    const dpr = devicePixelRatio || 1, W = this.c.clientWidth, H = this.c.clientHeight;
    this.c.width = W * dpr; this.c.height = H * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = W; this.H = H;
    const P = this.o.mini
      ? [[-.1 * W, .78 * H], [.3 * W, .6 * H], [.7 * W, .4 * H], [1.1 * W, .22 * H]]
      : [[-.2 * W, .78 * H], [.28 * W, .52 * H], [.62 * W, .28 * H], [1.2 * W, .16 * H]];
    this.lut = []; let len = 0, prev = null;
    for (let i = 0; i <= 600; i++) {
      const u = i / 600, a = 1 - u;
      const x = a * a * a * P[0][0] + 3 * a * a * u * P[1][0] + 3 * a * u * u * P[2][0] + u * u * u * P[3][0];
      const y = a * a * a * P[0][1] + 3 * a * a * u * P[1][1] + 3 * a * u * u * P[2][1] + u * u * u * P[3][1];
      if (prev) len += Math.hypot(x - prev[0], y - prev[1]);
      this.lut.push([len, x, y]); prev = [x, y];
    }
    this.len = len; this.r = this.o.mini ? Math.min(H * .2, W * .045) : Math.min(W * .056, 30);
    this.sp = this.r * 2.04; this.gap = len * (this.o.mini ? .22 : .3); this.mid = len * .5;
    this.draw();
  }
  at(s) {
    const L = this.lut; if (s <= 0) return [L[0][1], L[0][2]]; if (s >= this.len) return [L[L.length - 1][1], L[L.length - 1][2]];
    let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; L[m][0] < s ? lo = m : hi = m; }
    const f = (s - L[lo][0]) / (L[hi][0] - L[lo][0] || 1); return [L[lo][1] + (L[hi][1] - L[lo][1]) * f, L[lo][2] + (L[hi][2] - L[lo][2]) * f];
  }
  sOf(u) {
    const { mid, gap, sp } = this;
    if (u >= 0) return mid + gap / 2 + u * sp;
    if (u <= -1) return mid - gap / 2 + (u + 1) * sp;
    let e = u + 1; // 0..1 – sanft beschleunigen und abbremsen
    e = e * e * e * (e * (e * 6 - 15) + 10);
    return mid - gap / 2 + e * gap;
  }
  draw() {
    const { ctx, W, H } = this; ctx.clearRect(0, 0, W, H);
    // Schnur
    ctx.beginPath(); this.lut.forEach(([, x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = 'rgba(210,210,210,.85)'; ctx.lineWidth = this.o.mini ? 1.4 : 2.2; ctx.stroke();
    const c = this.disp, n = Math.ceil(this.len / this.sp) + 2, beads = [];
    for (let k = Math.floor(c) - n; k <= Math.floor(c) + n; k++) {
      const s = this.sOf(k - c); if (s < -this.r * 2 || s > this.len + this.r * 2) continue;
      beads.push([...this.at(s), k]);
    }
    const d = this.o.design();
    beads.forEach(([x, y, k]) => { const sp = beadSprite(d, ((k % 33) + 33) % 33 + 1, this.r); ctx.drawImage(sp, x - sp.off, y - sp.off, sp.width / sp.dpr, sp.height / sp.dpr); });
  }
  step(n = 1) {
    this.target += n;
    if (this.anim) return; // läuft schon – Ziel wird einfach weiter verfolgt
    let last = performance.now();
    const f = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const diff = this.target - this.disp;
      // gedämpfte Feder: schnell los, weich auslaufen; bei vielen Taps fließend hinterher
      this.vel = (this.vel || 0) + (diff * 260 - (this.vel || 0) * 30) * dt;
      this.disp += this.vel * dt;
      if (Math.abs(diff) < 0.0015 && Math.abs(this.vel) < 0.02) { this.disp = this.target; this.vel = 0; this.draw(); this.anim = null; return; }
      this.draw(); this.anim = requestAnimationFrame(f);
    };
    this.anim = requestAnimationFrame(f);
  }
  set(v) { cancelAnimationFrame(this.anim); this.anim = null; this.vel = 0; this.disp = this.target = v; this.draw(); }
}

/* ---------------- Zählen ---------------- */
function addToday(dhikrId) {
  const k = todayKey(), d = S.tasbih.days[k] ||= { total: 0, by: {} };
  d.total++; d.by[dhikrId] = (d.by[dhikrId] || 0) + 1;
  // nur die letzten 400 Tage aufheben
  const keys = Object.keys(S.tasbih.days); if (keys.length > 400) keys.sort().slice(0, keys.length - 400).forEach(x => delete S.tasbih.days[x]);
}
function countOne() {
  const C = counter();
  if (C.target && C.count >= C.target) { C.count = 0; }
  C.count++; C.total = (C.total || 0) + 1; addToday(C.dhikr);
  let done = false;
  if (C.target && C.count === C.target) {
    done = true; C.rounds = (C.rounds || 0) + 1;
    if (C.seq && C.seq.length > 1) {
      C.seqI = (C.seqI + 1) % C.seq.length; C.dhikr = C.seq[C.seqI]; C.count = 0;
      if (C.seqI === 0) toast(t('seqDone'));
    }
  }
  if (S.tasbih.sound) clickSound(done ? 'done' : 'bead', BEAD_MAT(S.beads));
  if (S.tasbih.haptic) haptic();
  save();
  return done;
}

/* ---------------- Vollbild-Tasbih ---------------- */
let TB = null;
function openTasbih() {
  const v = openView(`<div class="v-h" style="position:relative;z-index:3"><button class="rbtn" data-back>${icon('back')}</button><h3 style="color:#fff">${t('tasbih')}</h3>
      <div class="capsule"><button data-tb="reset">${icon('reset')}</button><button data-tb="sound">${icon(S.tasbih.sound ? 'sound' : 'mute')}</button></div></div>
    <div class="v-b" id="tbArea" style="overflow:hidden">
      <div class="tb-top"><button class="tb-name" data-tb="counters"></button><div class="tb-count" id="tbCount">00</div>
        <button class="tb-target" data-tb="target"></button><div class="tb-round" id="tbRound"></div></div>
      <canvas id="beadCanvas"></canvas>
      <div class="tb-hint" id="tbHint">${t('tapToStart')}</div>
      <div class="tb-dock"><div class="tb-dhikr"><div class="dt" id="tbDhikr"></div><button class="link" data-tb="dhikr">${t('showAll')}</button></div>
        <div class="design-row" id="tbDesigns">${Object.keys(BEADS).map(d => `<button data-bd="${d}" class="${d === S.beads ? 'on' : ''}"><img src="${beadIcon(d)}" style="width:100%;height:100%" alt="${d}"></button>`).join('')}</div></div>
    </div>`, { cls: 'tasbih-view' + (S.tasbihBg === 'theme' ? ' themed' : ''), onClose: () => { removeEventListener('resize', layout); TB = null; renderPage('start'); } });
  const el = v.el, area = $('#tbArea', el), cv = $('#beadCanvas', el), dock = $('.tb-dock', el);
  function layout() {
    if (!TB) return;
    const top = $('.tb-top', el).getBoundingClientRect().bottom - area.getBoundingClientRect().top, dockH = dock.offsetHeight;
    const h = area.clientHeight - top - dockH;
    cv.style.top = (top + 4) + 'px'; cv.style.height = Math.max(160, h - 46) + 'px';
    $('#tbHint', el).style.bottom = (dockH + 14) + 'px';
    TB.chain.resize();
  }
  TB = { el, chain: new BeadChain(cv, { design: () => S.beads, start: counter().total || 0 }) };
  const upd = (pop) => {
    const C = counter(), d = dhikrById(C.dhikr);
    $('.tb-name', el).innerHTML = `${esc(C.name || t('counterN', { n: S.tasbih.active + 1 }))} ${icon('chev', 'ic')}`.replace('class="ic"', 'class="ic" style="width:16px;height:16px;transform:rotate(90deg)"');
    $('#tbCount', el).textContent = pad(C.count);
    $('[data-tb="target"]', el).innerHTML = `/ ${C.target || '∞'} ${icon('edit2')}`.replace('class="ic"', 'class="ic" style="width:20px;height:20px"');
    $('#tbRound', el).textContent = C.rounds ? t('round', { n: C.rounds + (C.target && C.count === C.target ? 0 : 1) }) : '';
    $('#tbDhikr', el).innerHTML = d.free ? `<b>${t('freeCount')}</b>` : `<span class="ar">${d.ar}</span><b>${esc(d.lat)}</b>`;
    if (pop) { const n = $('#tbCount', el); n.classList.remove('pop'); void n.offsetWidth; n.classList.add('pop'); setTimeout(() => n.classList.remove('pop'), 130); }
  };
  TB.upd = upd; upd();
  requestAnimationFrame(layout); addEventListener('resize', layout);
  // Zählen: Antippen oder Wischen irgendwo im Bereich (außer Bedienelementen)
  let sx = 0, sy = 0, st = 0, active = false;
  area.addEventListener('pointerdown', e => { if (e.target.closest('button,.tb-dock')) return; active = true; sx = e.clientX; sy = e.clientY; st = Date.now(); });
  area.addEventListener('pointerup', e => {
    if (!active) return; active = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.hypot(dx, dy) > 12 && Math.abs(dx) < 30 && Date.now() - st > 600) return; // langes Ziehen ohne Richtung ignorieren
    $('#tbHint', el).style.opacity = 0;
    countOne(); TB.chain.step(1); upd(true);
  });
  area.addEventListener('touchmove', e => { if (active) e.preventDefault(); }, { passive: false });
  let resetArm = 0;
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-tb],[data-bd]'); if (!b) return;
    if (b.dataset.bd) { S.beads = b.dataset.bd; save(); if (S.tasbih.sound) clickSound('bead', BEAD_MAT(S.beads)); $$('[data-bd]', el).forEach(x => x.classList.toggle('on', x === b)); TB.chain.draw(); return; }
    const a = b.dataset.tb;
    if (a === 'sound') { S.tasbih.sound = !S.tasbih.sound; save(); b.innerHTML = icon(S.tasbih.sound ? 'sound' : 'mute'); toast(S.tasbih.sound ? t('soundOn') : t('soundOff')); }
    if (a === 'reset') {
      if (Date.now() - resetArm < 2500) { const C = counter(); C.count = 0; C.rounds = 0; C.seqI = 0; if (C.seq) C.dhikr = C.seq[0]; save(); upd(); toast(t('counterReset')); resetArm = 0; }
      else { resetArm = Date.now(); toast(t('tapAgainReset')); }
    }
    if (a === 'target') pickTarget(upd);
    if (a === 'dhikr') openDhikrList(upd);
    if (a === 'counters') openCounters(upd);
  });
}
function pickTarget(cb) {
  const C = counter();
  const sh = openSheet(t('target'), `<div class="chip-row" style="margin-bottom:14px">${[33, 99, 100, 500, 1000, 0].map(n => `<button class="btn sm ${C.target === n ? 'pri' : ''}" data-n="${n}">${n || '∞'}</button>`).join('')}</div>
    <div class="row"><input id="tgN" type="number" inputmode="numeric" min="1" placeholder="${t('custom')}" class="grow" style="background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:12px;font-size:16px"><button class="btn pri" data-ok>${t('save')}</button></div>`);
  const set = n => { C.target = Math.max(0, n | 0); if (C.target && C.count > C.target) C.count = 0; save(); sh.close(); cb(); };
  $$('[data-n]', sh.body).forEach(b => b.onclick = () => set(+b.dataset.n));
  $('[data-ok]', sh.body).onclick = () => { const n = +$('#tgN', sh.body).value; if (n > 0) set(n); };
}
function openCounters(cb) {
  const render = () => S.tasbih.counters.map((C, i) => `<div class="set-row"><button class="grow" style="text-align:start" data-sel="${i}"><b>${esc(C.name || t('counterN', { n: i + 1 }))}${i === S.tasbih.active ? ' ✓' : ''}</b>
      <span>${esc(dhikrName(dhikrById(C.dhikr)))} · ${C.count}/${C.target || '∞'} · ${t('totalN', { n: fmtNum(C.total || 0) })}</span></button>
      <button class="rbtn" data-ren="${i}">${icon('edit2')}</button>${S.tasbih.counters.length > 1 ? `<button class="rbtn" data-del="${i}">${icon('trash')}</button>` : ''}</div>`).join('');
  const sh = openSheet(t('counters'), `<div class="set-box" id="cL">${render()}</div><button class="btn full" style="margin-top:14px" data-add>${icon('plus')} ${t('addCounter')}</button>`);
  const b = sh.body, re = () => { $('#cL', b).innerHTML = render(); };
  b.addEventListener('click', e => {
    const x = e.target.closest('button'); if (!x) return;
    if (x.dataset.sel != null) { S.tasbih.active = +x.dataset.sel; save(); sh.close(); TB && TB.chain.set(counter().total || 0); cb(); }
    if (x.dataset.ren != null) {
      const i = +x.dataset.ren, row = x.closest('.set-row'), C = S.tasbih.counters[i];
      row.innerHTML = `<input type="text" value="${esc(C.name || t('counterN', { n: i + 1 }))}" style="flex:1;max-width:none;width:auto"><button class="btn sm pri">${t('save')}</button>`;
      const inp = $('input', row); inp.focus(); inp.select();
      $('button', row).onclick = () => { C.name = inp.value.trim(); save(); re(); cb(); };
    }
    if (x.dataset.del != null) { S.tasbih.counters.splice(+x.dataset.del, 1); S.tasbih.active = 0; save(); re(); TB && TB.chain.set(counter().total || 0); cb(); }
    if (x.dataset.add != null) { S.tasbih.counters.push({ name: '', count: 0, target: 33, dhikr: 'subhanallah', seq: null, seqI: 0, rounds: 0, total: 0 }); S.tasbih.active = S.tasbih.counters.length - 1; save(); re(); TB && TB.chain.set(0); cb(); }
  });
}
function openDhikrList(cb) {
  let tab = 'all';
  const item = (d, extra = '') => d.free ? '' : `<button class="dk-item ${counter().dhikr === d.id && !counter().seq ? 'on' : ''}" style="width:100%" data-dk="${d.id}">
      <span class="cnt">${d.n}×</span><span class="grow"><span class="ar" style="display:block">${d.ar}</span><b>${esc(d.lat)}</b>${dhikrMeaning(d) ? `<i>${esc(dhikrMeaning(d))}</i>` : ''}${extra}</span></button>`;
  const body = () => {
    if (tab === 'all') return DHIKR.map(d => item(d)).join('') + `<button class="dk-item" style="width:100%" data-dk="free"><span class="cnt">∞</span><span class="grow"><b>${t('freeCount')}</b><i>${t('freeCountSub')}</i></span></button>`;
    return DAILY.map(D => `<button class="dk-item ${JSON.stringify(counter().seq) === JSON.stringify(D.seq) && D.seq.length > 1 ? 'on' : ''}" style="width:100%" data-daily="${D.id}">
      <span class="cnt">${D.seq.length > 1 ? D.seq.length + ' × ' : ''}${D.n}×</span><span class="grow"><b>${t(D.key)}</b><i>${D.seq.map(id => esc(dhikrById(id).lat)).join(' · ')}</i><i>${t(D.key + 'Sub')}</i></span></button>`).join('');
  };
  const sh = openSheet(t('dhikr'), `<div class="seg" style="margin-bottom:6px"><button data-dt="all" class="on">${t('allDhikr')}</button><button data-dt="daily">${t('dailyDhikr')}</button></div><div id="dkL">${body()}</div>`);
  const b = sh.body;
  b.addEventListener('click', e => {
    const s = e.target.closest('[data-dt]'); if (s) { tab = s.dataset.dt; $$('[data-dt]', b).forEach(x => x.classList.toggle('on', x === s)); $('#dkL', b).innerHTML = body(); return; }
    const C = counter();
    const d = e.target.closest('[data-dk]');
    if (d) { const D = dhikrById(d.dataset.dk); C.dhikr = D.id; C.seq = null; C.seqI = 0; C.target = D.n; C.count = 0; C.rounds = 0; save(); sh.close(); cb(); toast(dhikrName(D)); }
    const y = e.target.closest('[data-daily]');
    if (y) { const D = DAILY.find(x => x.id === y.dataset.daily); C.seq = D.seq.length > 1 ? D.seq.slice() : null; C.seqI = 0; C.dhikr = D.seq[0]; C.target = D.n; C.count = 0; C.rounds = 0; save(); sh.close(); cb(); toast(t(D.key)); }
  });
}

/* ---------------- Start-Abschnitte ---------------- */
registerSection('start', {
  id: 'said', title: () => t('secSaid'),
  render() {
    const d = S.tasbih.days[todayKey()] || { total: 0, by: {} };
    const top = Object.entries(d.by).sort((a, b) => b[1] - a[1]).slice(0, 4);
    let week = 0; for (let i = 0; i < 7; i++) week += (S.tasbih.days[keyOf(addDays(new Date(), -i))] || { total: 0 }).total;
    return `<div class="card"><div class="row"><div class="grow"><div class="muted small">${t('saidToday')}</div>
        <div class="big-num" style="margin-top:4px">${fmtNum(d.total)}<span style="font-size:22px;font-weight:700">×</span></div></div>
        <div style="text-align:end"><div class="muted small">${t('last7')}</div><div style="font-size:22px;font-weight:800">${fmtNum(week)}×</div></div></div>
      ${top.length ? `<div class="chip-row" style="margin-top:12px">${top.map(([id, n]) => `<span class="pill"><span>${esc(dhikrName(dhikrById(id)))} · ${n}×</span></span>`).join('')}</div>`
        : `<div class="muted small" style="margin-top:10px">${t('saidNone')}</div>`}</div>`;
  },
});
registerSection('start', { id: 'prayer', title: () => t('secPrayerNow'), render: () => `<div class="sec-h"><h2>${t('secPrayerNow')}</h2><a href="#" data-go="prayer">${t('allTimes')}</a></div>${prayerNowCard()}`, after(el) { $('[data-go]', el).onclick = e => { e.preventDefault(); setTab('prayer'); }; bindChecks(el); } });
registerSection('start', { id: 'quran', title: () => t('secContinue'), render: () => quranContinueCard(true), after: el => bindQuranCard(el) });
registerSection('start', {
  id: 'tasbih', title: () => t('tasbih'),
  render() {
    const C = counter(), d = dhikrById(C.dhikr);
    return `<div class="sec-h"><h2>${t('tasbih')}</h2><a href="#" data-dk-open>${t('dhikr')}</a></div>
      <button class="card" style="width:100%;text-align:start;padding:14px 16px 8px" data-tb-open>
      <div class="row"><div class="grow"><div class="muted small">${esc(C.name || t('counterN', { n: S.tasbih.active + 1 }))}</div>
        <div style="font-size:19px;font-weight:700;margin-top:3px">${esc(dhikrName(d))}</div>${d.ar ? `<div class="ar" style="font-size:22px;text-align:start;margin-top:2px">${d.ar}</div>` : ''}</div>
        <div style="text-align:end"><div class="big-num" style="color:var(--accent)">${pad(C.count)}</div><div class="muted">/ ${C.target || '∞'}</div></div></div>
      <canvas class="mini-beads" id="miniBeads"></canvas><div class="tiny" style="text-align:center;margin-top:2px">${t('tapToOpen')}</div></button>`;
  },
  after(el) {
    $('[data-tb-open]', el).onclick = openTasbih;
    $('[data-dk-open]', el).onclick = e => { e.preventDefault(); openDhikrList(() => renderPage('start')); };
    requestAnimationFrame(() => { const cv = $('#miniBeads', el); if (cv && cv.clientWidth) new BeadChain(cv, { mini: true, design: () => S.beads, start: counter().total || 0 }); });
  },
});
registerSection('start', { id: 'calendar', title: () => t('secNextDay'), render: () => nextDayCard(), after(el) { const b = $('[data-go]', el); if (b) b.onclick = e => { e.preventDefault(); setTab('calendar'); }; } });
