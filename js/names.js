/* Nuraya – Esmâü'l-Hüsnâ: die 99 schönsten Namen Allahs (Liste nach at-Tirmidhi) */
'use strict';
// [Arabisch, Umschrift (türkisch), Deutsch, Türkisch]
const NAMES99 = [
  ['الرَّحْمٰنُ', 'Er-Rahmân', 'Der Allerbarmer', 'Dünyada bütün yaratılanlara merhamet eden'],
  ['الرَّحِيمُ', 'Er-Rahîm', 'Der Barmherzige', 'Ahirette müminlere merhamet eden'],
  ['الْمَلِكُ', 'El-Melik', 'Der König, Herrscher', 'Mülkün gerçek sahibi'],
  ['الْقُدُّوسُ', 'El-Kuddûs', 'Der Heilige, Reine', 'Her türlü eksiklikten uzak'],
  ['السَّلَامُ', 'Es-Selâm', 'Der Friede, Quelle des Friedens', 'Esenlik veren'],
  ['الْمُؤْمِنُ', "El-Mü'min", 'Der Gewährer der Sicherheit', 'Güven veren'],
  ['الْمُهَيْمِنُ', 'El-Müheymin', 'Der Wachende, Beschützer', 'Gözetip koruyan'],
  ['الْعَزِيزُ', 'El-Azîz', 'Der Allmächtige, Unbezwingbare', 'İzzet sahibi, mağlup edilmeyen'],
  ['الْجَبَّارُ', 'El-Cebbâr', 'Der Gewaltige, der alles zurechtbringt', 'Dilediğini yaptırmaya gücü yeten'],
  ['الْمُتَكَبِّرُ', 'El-Mütekebbir', 'Der Erhabene in Seiner Größe', 'Büyüklükte eşi olmayan'],
  ['الْخَالِقُ', 'El-Hâlık', 'Der Schöpfer', 'Yaratan'],
  ['الْبَارِئُ', "El-Bâri'", 'Der Erschaffer (aus dem Nichts)', 'Kusursuz ve uyumlu yaratan'],
  ['الْمُصَوِّرُ', 'El-Musavvir', 'Der Gestalter', 'Her şeye şekil veren'],
  ['الْغَفَّارُ', 'El-Gaffâr', 'Der stets Vergebende', 'Günahları çokça bağışlayan'],
  ['الْقَهَّارُ', 'El-Kahhâr', 'Der Bezwingende', 'Her şeye galip gelen'],
  ['الْوَهَّابُ', 'El-Vehhâb', 'Der Schenkende', 'Karşılıksız bol bol veren'],
  ['الرَّزَّاقُ', 'Er-Rezzâk', 'Der Versorger', 'Rızık veren'],
  ['الْفَتَّاحُ', 'El-Fettâh', 'Der Öffnende, der entscheidet', 'Her türlü zorluğu açan'],
  ['الْعَلِيمُ', 'El-Alîm', 'Der Allwissende', 'Her şeyi bilen'],
  ['الْقَابِضُ', 'El-Kâbıd', 'Der Zurückhaltende', 'Dilediğine darlık veren'],
  ['الْبَاسِطُ', 'El-Bâsıt', 'Der Ausbreitende, Großzügige', 'Dilediğine bolluk veren'],
  ['الْخَافِضُ', 'El-Hâfıd', 'Der Erniedrigende', 'Alçaltan'],
  ['الرَّافِعُ', "Er-Râfi'", 'Der Erhöhende', 'Yükselten'],
  ['الْمُعِزُّ', 'El-Muizz', 'Der Ehre Verleihende', 'İzzet veren'],
  ['الْمُذِلُّ', 'El-Müzill', 'Der Demütigende', 'Zillete düşüren'],
  ['السَّمِيعُ', "Es-Semî'", 'Der Allhörende', 'Her şeyi işiten'],
  ['الْبَصِيرُ', 'El-Basîr', 'Der Allsehende', 'Her şeyi gören'],
  ['الْحَكَمُ', 'El-Hakem', 'Der Richter', 'Hükmeden, hakkı yerine getiren'],
  ['الْعَدْلُ', 'El-Adl', 'Der Gerechte', 'Mutlak adaletli'],
  ['اللَّطِيفُ', 'El-Latîf', 'Der Feinfühlige, Gütige', 'Lütufkâr, en ince işleri bilen'],
  ['الْخَبِيرُ', 'El-Habîr', 'Der Kundige', 'Her şeyden haberdar'],
  ['الْحَلِيمُ', 'El-Halîm', 'Der Nachsichtige', 'Cezada acele etmeyen'],
  ['الْعَظِيمُ', 'El-Azîm', 'Der Gewaltige, Großartige', 'Pek yüce, azametli'],
  ['الْغَفُورُ', 'El-Gafûr', 'Der Verzeihende', 'Bağışlayan'],
  ['الشَّكُورُ', 'Eş-Şekûr', 'Der Anerkennende, Dankbare', 'Az amele çok sevap veren'],
  ['الْعَلِيُّ', 'El-Aliyy', 'Der Höchste', 'Yüce'],
  ['الْكَبِيرُ', 'El-Kebîr', 'Der Große', 'Büyük'],
  ['الْحَفِيظُ', 'El-Hafîz', 'Der Bewahrer', 'Koruyan'],
  ['الْمُقِيتُ', 'El-Mukît', 'Der Ernährer, Erhalter', 'Her canlının gıdasını veren'],
  ['الْحَسِيبُ', 'El-Hasîb', 'Der Abrechnende, der genügt', 'Hesaba çeken'],
  ['الْجَلِيلُ', 'El-Celîl', 'Der Majestätische', 'Celal ve azamet sahibi'],
  ['الْكَرِيمُ', 'El-Kerîm', 'Der Edle, Großzügige', 'Keremi bol, cömert'],
  ['الرَّقِيبُ', 'Er-Rakîb', 'Der Wachsame', 'Her şeyi gözetleyen'],
  ['الْمُجِيبُ', 'El-Mucîb', 'Der Erhörende', 'Duaları kabul eden'],
  ['الْوَاسِعُ', "El-Vâsi'", 'Der Allumfassende', 'Rahmeti ve ilmi geniş'],
  ['الْحَكِيمُ', 'El-Hakîm', 'Der Allweise', 'Her işi hikmetli'],
  ['الْوَدُودُ', 'El-Vedûd', 'Der Liebevolle', 'Kullarını seven, sevilmeye layık'],
  ['الْمَجِيدُ', 'El-Mecîd', 'Der Ruhmreiche', 'Şanı yüce'],
  ['الْبَاعِثُ', 'El-Bâis', 'Der Auferweckende', 'Ölüleri dirilten'],
  ['الشَّهِيدُ', 'Eş-Şehîd', 'Der Zeuge', 'Her şeye şahit'],
  ['الْحَقُّ', 'El-Hakk', 'Die Wahrheit', 'Varlığı gerçek olan'],
  ['الْوَكِيلُ', 'El-Vekîl', 'Der Sachwalter', 'Kendisine güvenilen'],
  ['الْقَوِيُّ', 'El-Kaviyy', 'Der Starke', 'Kuvvetli'],
  ['الْمَتِينُ', 'El-Metîn', 'Der Feste', 'Sarsılmaz'],
  ['الْوَلِيُّ', 'El-Veliyy', 'Der Schutzherr, Freund', 'Müminlerin dostu'],
  ['الْحَمِيدُ', 'El-Hamîd', 'Der Lobenswürdige', 'Övülmeye layık'],
  ['الْمُحْصِي', 'El-Muhsî', 'Der alles Erfassende', 'Her şeyi tek tek bilen'],
  ['الْمُبْدِئُ', "El-Mübdi'", 'Der Urheber', 'İlk defa yaratan'],
  ['الْمُعِيدُ', 'El-Muîd', 'Der Wiederherstellende', 'Yeniden yaratan'],
  ['الْمُحْيِي', 'El-Muhyî', 'Der Lebensspender', 'Can veren'],
  ['الْمُمِيتُ', 'El-Mümît', 'Der den Tod Bestimmende', 'Ölümü yaratan'],
  ['الْحَيُّ', 'El-Hayy', 'Der Lebendige', 'Diri, ezeli ve ebedi hayat sahibi'],
  ['الْقَيُّومُ', 'El-Kayyûm', 'Der Beständige, aus Sich selbst Bestehende', 'Her şeyi ayakta tutan'],
  ['الْوَاجِدُ', 'El-Vâcid', 'Der Findende, Reiche', 'İstediğini bulan'],
  ['الْمَاجِدُ', 'El-Mâcid', 'Der Glorreiche', 'Şanı büyük'],
  ['الْوَاحِدُ', 'El-Vâhid', 'Der Eine', 'Tek'],
  ['الْأَحَدُ', 'El-Ehad', 'Der Einzige', 'Bir, eşi olmayan'],
  ['الصَّمَدُ', 'Es-Samed', 'Der Unabhängige, auf den alle angewiesen sind', 'Hiçbir şeye muhtaç olmayan'],
  ['الْقَادِرُ', 'El-Kâdir', 'Der Mächtige', 'Gücü yeten'],
  ['الْمُقْتَدِرُ', 'El-Muktedir', 'Der Allmächtige', 'Kudret sahibi'],
  ['الْمُقَدِّمُ', 'El-Mukaddim', 'Der Voranbringende', 'Dilediğini öne alan'],
  ['الْمُؤَخِّرُ', 'El-Muahhir', 'Der Zurückstellende', 'Dilediğini geriye bırakan'],
  ['الْأَوَّلُ', 'El-Evvel', 'Der Erste', 'Başlangıcı olmayan'],
  ['الْآخِرُ', 'El-Âhir', 'Der Letzte', 'Sonu olmayan'],
  ['الظَّاهِرُ', 'Ez-Zâhir', 'Der Offenbare', 'Varlığı apaçık'],
  ['الْبَاطِنُ', 'El-Bâtın', 'Der Verborgene', 'Zatı gizli'],
  ['الْوَالِي', 'El-Vâlî', 'Der Herrschende, Verwalter', 'Her şeyi yöneten'],
  ['الْمُتَعَالِي', 'El-Müteâlî', 'Der Erhabene', 'Pek yüce'],
  ['الْبَرُّ', 'El-Berr', 'Der Gütige', 'İyiliği bol'],
  ['التَّوَّابُ', 'Et-Tevvâb', 'Der die Reue Annehmende', 'Tövbeleri kabul eden'],
  ['الْمُنْتَقِمُ', 'El-Müntekim', 'Der Vergeltende', 'Suçluları cezalandıran'],
  ['الْعَفُوُّ', 'El-Afüvv', 'Der Tilgende, Verzeihende', 'Affeden'],
  ['الرَّؤُوفُ', 'Er-Raûf', 'Der Gnädige, Mitleidvolle', 'Çok şefkatli'],
  ['مَالِكُ الْمُلْكِ', "Mâlikü'l-Mülk", 'Der Herrscher über alles Reich', 'Mülkün ebedi sahibi'],
  ['ذُو الْجَلَالِ وَالْإِكْرَامِ', "Zü'l-Celâli ve'l-İkrâm", 'Der Herr der Majestät und Ehre', 'Celal ve ikram sahibi'],
  ['الْمُقْسِطُ', 'El-Muksit', 'Der Ausgleichende, Gerechte', 'Adaletle hükmeden'],
  ['الْجَامِعُ', "El-Câmi'", 'Der Versammelnde', 'Dilediğini bir araya toplayan'],
  ['الْغَنِيُّ', 'El-Ganiyy', 'Der Reiche, Unabhängige', 'Zengin, muhtaç olmayan'],
  ['الْمُغْنِي', 'El-Mugnî', 'Der Bereichernde', 'Zengin eden'],
  ['الْمَانِعُ', "El-Mâni'", 'Der Verhindernde', 'Dilemediğine engel olan'],
  ['الضَّارُّ', 'Ed-Dârr', 'Der Schaden zulässt', 'Dilediğine zarar veren (imtihan)'],
  ['النَّافِعُ', "En-Nâfi'", 'Der Nutzen Spendende', 'Fayda veren'],
  ['النُّورُ', 'En-Nûr', 'Das Licht', 'Âlemleri nurlandıran'],
  ['الْهَادِي', 'El-Hâdî', 'Der Rechtleitende', 'Hidayet veren'],
  ['الْبَدِيعُ', "El-Bedî'", 'Der unvergleichliche Schöpfer', 'Eşsiz yaratan'],
  ['الْبَاقِي', 'El-Bâkî', 'Der Ewige, Bleibende', 'Varlığı sonsuz'],
  ['الْوَارِثُ', 'El-Vâris', 'Der Erbe', 'Her şeyin asıl sahibi olarak kalan'],
  ['الرَّشِيدُ', 'Er-Reşîd', 'Der zum rechten Weg Führende', 'Doğru yolu gösteren'],
  ['الصَّبُورُ', 'Es-Sabûr', 'Der Geduldige', 'Çok sabırlı'],
];
const nameMeaning = n => S.lang === 'tr' ? n[3] : S.lang === 'ar' ? '' : n[2];
const nameOfDay = () => { const d = new Date(), start = new Date(d.getFullYear(), 0, 0); return Math.floor((d - start) / 864e5) % 99; };
const SONG_LINK = 'https://www.youtube.com/results?search_query=' + encodeURIComponent('Asma ul Husna Atif Aslam Coke Studio');

registerSection('start', {
  id: 'names', title: () => t('secNames'),
  render() {
    const i = nameOfDay(), n = NAMES99[i];
    return `<div class="sec-h"><h2>${t('secNames')}</h2><a href="#" data-nm-all>${t('showAll')}</a></div>
      <button class="card nm-hero" style="width:100%" data-nm-open="${i}">
        <div class="tiny">${t('nameOfDay')} · ${i + 1}/99</div>
        <div class="ar nm-ar">${n[0]}</div><b style="font-size:19px">${esc(n[1])}</b>${nameMeaning(n) ? `<div class="muted">${esc(nameMeaning(n))}</div>` : ''}
        <div class="row" style="justify-content:center;gap:8px;margin-top:12px"><span class="pill"><span>${t('flipThrough')} ›</span></span></div></button>`;
  },
  after(el) {
    $('[data-nm-all]', el).onclick = e => { e.preventDefault(); openNames(); };
    $('[data-nm-open]', el).onclick = b => openNameCards(+b.currentTarget.dataset.nmOpen);
  },
});

/* Übersicht aller 99 Namen mit Suche */
function openNames() {
  const v = openView(`<div class="v-h"><button class="rbtn" data-back>${icon('back')}</button><h3>${t('secNames')}</h3><button class="rbtn" data-nm-song>${icon('sound')}</button></div>
    <div class="v-b" style="padding:0 16px 40px">
      <div class="card" style="text-align:center;margin:4px 0 12px"><div class="ar" style="font-size:30px">وَلِلّٰهِ الْأَسْمَاءُ الْحُسْنٰى فَادْعُوهُ بِهَا</div>
        <div class="muted small" style="margin-top:6px">${t('namesVerse')}</div></div>
      <div class="row" style="gap:8px;margin-bottom:10px"><button class="btn pri grow" data-nm-flip>${icon('book')} ${t('flipThrough')}</button><button class="btn grow" data-nm-song>${icon('play')} ${t('namesSong')}</button></div>
      <div class="search">${icon('search')}<input id="nmQ" placeholder="${t('searchName')}" autocomplete="off"></div>
      <div class="nm-grid" id="nmGrid"></div></div>`);
  const el = v.el, grid = $('#nmGrid', el);
  const draw = q => {
    const nq = (q || '').toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    grid.innerHTML = NAMES99.map((n, i) => [n, i]).filter(([n, i]) => !nq || String(i + 1) === nq || (n[1] + ' ' + n[2] + ' ' + n[3]).toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(nq) || n[0].includes(q))
      .map(([n, i]) => `<button class="nm-cell" data-i="${i}"><span class="nm-no">${i + 1}</span><span class="ar">${n[0]}</span><b>${esc(n[1])}</b>${nameMeaning(n) ? `<i>${esc(nameMeaning(n))}</i>` : ''}</button>`).join('') || `<div class="empty">${t('noResults')}</div>`;
  };
  draw('');
  $('#nmQ', el).oninput = e => draw(e.target.value);
  grid.onclick = e => { const c = e.target.closest('[data-i]'); if (c) openNameCards(+c.dataset.i); };
  $('[data-nm-flip]', el).onclick = () => openNameCards(0);
  $$('[data-nm-song]', el).forEach(b => b.onclick = openNamesSong);
}

/* Karten zum Durchblättern (wischen oder Pfeile) */
function openNameCards(start = 0) {
  let i = start;
  const v = openView(`<div class="v-h"><button class="rbtn" data-back>${icon('back')}</button><h3 id="ncTitle"></h3><button class="rbtn" data-nm-song>${icon('sound')}</button></div>
    <div class="v-b nc-wrap" id="ncWrap"><div class="nc-card" id="ncCard"></div>
      <div class="nc-nav"><button class="rbtn" data-nc="-1">${icon('chevl')}</button><div class="nc-dots" id="ncDots"></div><button class="rbtn" data-nc="1">${icon('chev')}</button></div>
      <div class="row" style="justify-content:center;gap:8px;margin:14px 16px 30px"><button class="btn" data-nc-tb>${icon('bead')} ${t('countWithTasbih')}</button><button class="btn" data-nc-rand>${icon('repeat')} ${t('random')}</button></div></div>`);
  const el = v.el, card = $('#ncCard', el);
  const show = (dir = 0) => {
    const n = NAMES99[i];
    $('#ncTitle', el).textContent = `${i + 1} / 99`;
    card.className = 'nc-card' + (dir ? (dir > 0 ? ' in-r' : ' in-l') : '');
    card.innerHTML = `<div class="nc-no">${arNum(i + 1)}</div><div class="ar nc-ar">${n[0]}</div><div class="nc-lat">${esc(n[1])}</div>
      ${S.lang !== 'tr' && S.lang !== 'ar' ? `<div class="nc-de">${esc(n[2])}</div>` : ''}<div class="nc-tr">${esc(n[3])}</div>`;
    $('#ncDots', el).innerHTML = `<div class="progress" style="width:140px"><i style="width:${(i + 1) / 99 * 100}%"></i></div>`;
  };
  const go = d => { i = (i + d + 99) % 99; show(d); haptic(); };
  show();
  el.addEventListener('click', e => {
    const n = e.target.closest('[data-nc]'); if (n) go(+n.dataset.nc);
    if (e.target.closest('[data-nc-rand]')) { i = Math.floor(Math.random() * 99); show(1); }
    if (e.target.closest('[data-nm-song]')) openNamesSong();
    if (e.target.closest('[data-nc-tb]')) {
      const C = counter(), n = NAMES99[i];
      C.dhikr = 'free'; C.seq = null; C.target = 33; C.count = 0; C.rounds = 0; C.name = 'Yâ ' + n[1].replace(/^(El|Er|Es|Eş|Ez|Ed|En|Et)-/, ''); save();
      toast(t('tasbihSet', { n: C.name })); openTasbih();
    }
  });
  let x0 = null;
  const wrap = $('#ncWrap', el);
  wrap.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); x0 = null; });
}

/* Lied der 99 Namen: eigene Audiodatei abspielen oder extern anhören */
const NAU = new Audio();
async function openNamesSong() {
  const have = await getNamesSong();
  const sh = openSheet(t('namesSong'), `<p class="muted" style="margin:0 4px 12px">${t('namesSongInfo')}</p>
    <div class="set-box">
      ${have ? `<button class="set-row" style="width:100%" data-ns="play">${icon(NAU.paused ? 'play' : 'pause')}<span class="grow" style="text-align:start"><b>${NAU.paused ? t('playSong') : t('pauseSong')}</b><span>${esc(have.name || '')}</span></span></button>` : ''}
      <label class="set-row" style="width:100%">${icon('upload')}<span class="grow"><b>${have ? t('replaceSong') : t('importSong')}</b><span>${t('importSongSub')}</span></span><input type="file" accept="audio/*,.mp3,.m4a" id="nsFile" hidden></label>
      <a class="set-row" href="${SONG_LINK}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none">${icon('search')}<span class="grow"><b>${t('songOnline')}</b><span>${t('songOnlineSub')}</span></span>${icon('chev')}</a>
      ${have ? `<button class="set-row" style="width:100%;color:var(--danger)" data-ns="del">${icon('trash')}<span class="grow" style="text-align:start"><b>${t('deleteSong')}</b></span></button>` : ''}
    </div>`);
  sh.body.onclick = async e => {
    const b = e.target.closest('[data-ns]'); if (!b) return;
    if (b.dataset.ns === 'play') {
      if (NAU.paused) { const s = await getNamesSong(); if (!NAU.src) NAU.src = URL.createObjectURL(s.blob); NAU.play().catch(() => toast(t('audioFail'))); } else NAU.pause();
      sh.close();
    }
    if (b.dataset.ns === 'del') { await idb('readwrite', st => st.delete('names/song')); NAU.pause(); NAU.removeAttribute('src'); sh.close(); toast(t('deleted')); }
  };
  $('#nsFile', sh.body).onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    await putBlob('names/song', { blob: f, name: f.name }); NAU.pause(); NAU.removeAttribute('src'); sh.close(); toast(t('songSaved'));
  };
}
async function getNamesSong() { try { return await idb('readonly', st => st.get('names/song')); } catch (e) { return null; } }
