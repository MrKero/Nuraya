/* Tajwîd-Erkennung für Uthmani-Text (Tanzil / KFGQPC).
   Nutzt die Schreibkonventionen des Madina-Mushaf: Nûn/Mîm ohne Sukûn = nicht deutlich,
   offenes Tanwîn = Idghâm/Ikhfâʾ, kleines Mîm = Iqlâb, Madda-Zeichen = lange Dehnung. */
const TT = (() => {
  const isMark = c => /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u08D3-\u08FF]/.test(c);
  const HAMZA = 'ءأإؤئ', QALQ = 'قطبجد', YANMU = 'ينمو';
  const FATHA = 'َ', DAMMA = 'ُ', KASRA = 'ِ', SHADDA = 'ّ', MADDAH = 'ٓ', DAGGER = 'ٰ';
  const SUK = /[\u0652\u06E1]/, VOW = /[\u064B-\u0650\u0656\u0657\u065E\u08F0-\u08F2]/, OPEN_TAN = /[\u0656\u0657\u065E\u08F0-\u08F2]/, IQLAB = /[\u06E2\u06ED]/;
  const SILENT = /[\u06DF\u06E0]/;
  const isSilent = k => SILENT.test(k.m) || ('اوى'.includes(k.b) && k.m.includes('\u0652') && !VOW.test(k.m));
  function clusters(t) {
    const cl = []; let w = 0;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === ' ' || c === ' ') { w++; continue; }
      if (c === 'ـ') { if (cl.length) cl[cl.length - 1].e = i + 1; continue; }
      if (isMark(c) && cl.length) { const k = cl[cl.length - 1]; k.m += c; k.e = i + 1; continue; }
      if (c === '۞' || c === '۩') continue; // Hizb-/Sajda-Zeichen
      cl.push({ b: c, m: '', s: i, e: i + 1, w });
    }
    cl.forEach((k, i) => { k.i = i; k.last = !cl[i + 1] || cl[i + 1].w !== k.w; k.first = !cl[i - 1] || cl[i - 1].w !== k.w; });
    return cl;
  }
  const isH = k => k && (HAMZA.includes(k.b) || /[ٕٔ]/.test(k.m));
  const bare = k => !VOW.test(k.m) && !SUK.test(k.m) && !k.m.includes(SHADDA) && !k.m.includes(DAGGER);
  function tag(t) {
    const cl = clusters(t), R = new Array(cl.length).fill(null), set = (i, r) => { if (i >= 0 && i < cl.length && !R[i]) R[i] = r; };
    const n = cl.length, lastW = n ? cl[n - 1].w : 0;
    const nextL = i => { let j = i + 1; while (j < n && (cl[j].b === 'ا' || cl[j].b === 'ى') && (bare(cl[j]) || isSilent(cl[j])) && cl[j].w === cl[i].w) j++; return j < n ? j : -1; };
    const nx = i => { let j = i + 1; while (j < n && isSilent(cl[j]) && cl[j].w === cl[i].w) j++; return j; };
    for (let i = 0; i < n; i++) {
      const k = cl[i], p = cl[i - 1], q = cl[i + 1];
      // Hamzat al-Wasl & stumme Buchstaben
      if (k.b === 'ٱ') { set(i, 'silent'); continue; }
      if (isSilent(k)) { set(i, 'silent'); continue; }
      // Lâm schamsiyya
      if (k.b === 'ل' && p && p.b === 'ٱ' && p.w === k.w && !k.m && q && q.w === k.w && q.m.includes(SHADDA) && !(q.b === 'ل' && cl[i + 2] && cl[i + 2].b === 'ه')) { set(i, 'lamShams'); continue; }
      // Nûn sâkin / Tanwîn
      const tan = OPEN_TAN.test(k.m) || (VOW.test(k.m) && IQLAB.test(k.m));
      if ((k.b === 'ن' && bare(k) && !k.m.includes(MADDAH)) || tan) {
        const j = nextL(i); if (j < 0) continue;
        const L = cl[j].b, mark = IQLAB.test(k.m) || (cl[i + 1] && IQLAB.test(cl[i + 1].m) && !VOW.test(cl[i + 1].m));
        let r;
        if (mark || L === 'ب') r = 'iqlab';
        else if (YANMU.includes(L) && cl[j].w !== k.w) r = 'idgham';
        else if ('لر'.includes(L) && cl[j].w !== k.w) r = 'idghamNo';
        else if (cl[j].m.includes(SHADDA) && cl[j].w !== k.w) r = 'idgham';
        else r = 'ikhfa';
        set(i, r); if (r !== 'ikhfa') set(j, r);
        continue;
      }
      // Mîm sâkin
      if (k.b === 'م' && bare(k) && !k.m.includes(MADDAH) && q) {
        if (q.b === 'م') { set(i, 'idghamMeem'); set(i + 1, 'idghamMeem'); continue; }
        if (q.b === 'ب') { set(i, 'ikhfaMeem'); continue; }
      }
      // Ghunna
      if ((k.b === 'ن' || k.b === 'م') && k.m.includes(SHADDA)) { set(i, 'ghunna'); continue; }
      // Qalqala
      if (QALQ.includes(k.b) && (SUK.test(k.m) || (i === n - 1))) { set(i, 'qalqala'); continue; }
    }
    // Dehnungen
    for (let i = 0; i < n; i++) {
      const k = cl[i], p = cl[i - 1], q = cl[i + 1];
      let madd = false;
      if (k.m.includes(DAGGER) || k.b === 'ۥ' || k.b === 'ۦ') madd = true;
      else if (p && p.w === k.w && bare(k) && !SILENT.test(k.m)) {
        if (k.b === 'ا' && p.m.includes(FATHA) && !/[\u064B\u0657\u08F0]/.test(p.m)) madd = true;
        else if (k.b === 'و' && p.m.includes(DAMMA)) madd = true;
        else if ((k.b === 'ي' || k.b === 'ى') && p.m.includes(KASRA)) madd = true;
      }
      const leen = !madd && (k.b === 'و' || k.b === 'ي') && SUK.test(k.m) && p && p.m.includes(FATHA);
      const maddah = k.m.includes(MADDAH);
      if (!madd && !leen && !maddah) continue;
      if (maddah && !madd && HAMZA.includes(k.b)) continue;
      if (maddah && !madd) { if (!'اويى'.includes(k.b)) set(i, 'maddLazim'); else set(i, 'maddMuttasil'); continue; }
      // Dehnungsbuchstabe am Wortende vor Hamzat al-Wasl fällt im Lesefluss weg
      { const j = nx(i); if ((k.last || !cl[j] || cl[j].w !== k.w) && cl[j] && cl[j].b === 'ٱ') continue; }
      if (maddah) {
        const j = nx(i), r = cl[j], endW = !r || r.w !== k.w;
        if (k.first && k.b === 'ي' && k.m.includes(DAGGER) && isH(r)) set(i, 'maddMunfasil');
        else if (!endW && isH(r)) set(i, 'maddMuttasil');
        else if (!endW && (r.m.includes(SHADDA) || SUK.test(r.m))) set(i, 'maddLazim');
        else if (endW) set(i, 'maddMunfasil');
        else if (isH(cl[j + 1]) && cl[j + 1].w === k.w) set(i, 'maddMuttasil');
        else set(i, 'maddMunfasil');
        continue;
      }
      // Am Versende: Dehnung vor dem letzten Buchstaben
      if (k.w === lastW && i === n - 2) { set(i, 'maddArid'); continue; }
      // natürliche Dehnung (2 Takte) wird – wie in Tajwîd-Mushafs üblich – nicht eingefärbt
    }
    const out = [];
    R.forEach((r, i) => { if (!r) return; const k = cl[i]; const o = out[out.length - 1]; if (o && o[2] === r && o[1] === k.s) o[1] = k.e; else out.push([k.s, k.e, r]); });
    return out;
  }
  return { tag, clusters };
})();
if (typeof module !== 'undefined') module.exports = TT;
