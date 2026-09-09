/* HomeTikki · KANTO — Round 2 app.
   Views: Corridor (33-station line map) · Homes (LIVE + REP cards) ·
   Tikki Radio (judgment deck → taste vector → re-sort).
   Overlays: case sheet, area-fusion sheet. EN primary / JA secondary, toggle.
   One delegated listener; overlay routes never wipe the underlying view
   (Round-1 lesson); all timers are owned and cleared on view switch
   (Round-1 lesson). Zero dependencies. */
"use strict";

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const yen = n => n == null ? '—' : '¥' + n.toLocaleString('en-US');
const man = n => n == null ? '—' : (n/10000).toFixed(n % 10000 ? 1 : 0) + '万';

const CORRIDORS = {
  all:        { name:'All Corridors', ja:'首都圏全線', tag:'All 5 Living Corridors · 1,000 Verified Homes', badge:'🌐', ready:true, color:'#803860' },
  keikyu:     { name:'Keikyu', ja:'京急本線・都営浅草線', tag:'Ningyōchō → Yokohama', badge:'⛩', ready:true, color:'var(--shu)' },
  toyoko:     { name:'Tōyoko', ja:'東急東横線', tag:'Shibuya → Yokohama', badge:'🌸', ready:true, color:'#da0442' },
  hibiya:     { name:'Hibiya', ja:'東京メトロ日比谷線', tag:'Naka-Meguro → Kita-Senju', badge:'🌹', ready:true, color:'#9caeb7' },
  denentoshi: { name:'Den-en-toshi', ja:'東急田園都市線', tag:'Shibuya → Chūō-Rinkan', badge:'🌿', ready:true, color:'#20a288' },
  odakyu:     { name:'Odakyū', ja:'小田急小田原線', tag:'Shinjuku → Machida', badge:'🗻', ready:true, color:'#1067b8' },
};

const state = {
  corridor: new URLSearchParams(location.search).get('c') || 'keikyu',
  view: 'corridor', dest: 'yokohama',
  fStation: new URLSearchParams(location.search).get('stn') || 'all', fLayout: 'all', fTier: 'all', sort: 'goal',
  fPocket: 'all', fQuick: 'all', fService: 'all', activeStnDrawer: null,
  loved: new Set(), taste: null, radio: null, toastT: null,
  topoGroup: 'all', topoLine: null, topoSelectedStation: null,
  pk: null, pkMax: 35, pkBudget: 0, pkLayout: '1K',
};

function getAllCorridorHomes(){
  let all = [];
  if (typeof HOMES !== 'undefined' && Array.isArray(HOMES)) all = all.concat(HOMES);
  if (typeof CORRIDORS_DATA !== 'undefined'){
    for (const [k, c] of Object.entries(CORRIDORS_DATA)){
      if (c && c.homes && Array.isArray(c.homes)) all = all.concat(c.homes);
    }
  }
  const seen = new Set();
  return all.filter(h => {
    if (!h || !h.id || seen.has(h.id)) return false;
    seen.add(h.id);
    return true;
  });
}

function getAllCorridorPockets(){
  let all = [];
  if (typeof POCKETS_R3 !== 'undefined' && Array.isArray(POCKETS_R3)) all = all.concat(POCKETS_R3);
  if (typeof CORRIDORS_DATA !== 'undefined'){
    for (const [k, c] of Object.entries(CORRIDORS_DATA)){
      if (k !== 'keikyu' && c && c.pockets && Array.isArray(c.pockets)) all = all.concat(c.pockets);
    }
  }
  const seen = new Set();
  return all.filter(p => {
    if (!p || !p.id || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

function getAllCorridorStations(){
  let all = [];
  if (typeof STATIONS !== 'undefined' && Array.isArray(STATIONS)) all = all.concat(STATIONS);
  if (typeof CORRIDORS_DATA !== 'undefined'){
    for (const [k, c] of Object.entries(CORRIDORS_DATA)){
      if (k !== 'keikyu' && c && c.stations && Array.isArray(c.stations)) all = all.concat(c.stations);
    }
  }
  const seen = new Set();
  return all.filter(s => {
    if (!s || !s.id || seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

function pocketForListing(l){
  if (!l) return null;
  const pList = getAllCorridorPockets();
  if (l.pocketId){
    const f = pList.find(p => p.id === l.pocketId);
    if (f) return f;
  }
  const bySt = pList.find(p => p.st === l.st);
  if (bySt) return bySt;
  const st = getAllCorridorStations().find(s => s.id === l.st);
  if (st && st.ward){
    const byW = pList.find(p => p.ward === st.ward);
    if (byW) return byW;
  }
  return pList[0] || null;
}

function getActiveCorridor(){
  const p = state.corridor || 'keikyu';
  if (p === 'all') {
    return {
      id: 'all', name: 'All Corridors', ja: '首都圏全線',
      stations: getAllCorridorStations(),
      homes: getAllCorridorHomes(),
      pockets: getAllCorridorPockets(),
      color: '#803860', goalMin: 26.5
    };
  }
  return (typeof CORRIDORS_DATA !== 'undefined' && CORRIDORS_DATA[p]) ? CORRIDORS_DATA[p] : (typeof CORRIDORS_DATA !== 'undefined' ? CORRIDORS_DATA.keikyu : null);
}
function activeStations(){
  if (state.corridor === 'all') return getAllCorridorStations();
  const c = getActiveCorridor();
  return (c && c.stations) ? c.stations : STATIONS;
}
function activeWards(){
  const c = getActiveCorridor();
  return (c && c.wards) ? c.wards : WARDS;
}
function activeDests(){
  const c = getActiveCorridor();
  return (c && c.dests) ? c.dests : DESTS;
}
function activeAnchors(){
  const c = getActiveCorridor();
  return (c && c.anchors) ? c.anchors : ANCHORS;
}
function activeHomes(){
  if (state.corridor === 'all') return getAllCorridorHomes();
  const c = getActiveCorridor();
  return (c && c.homes) ? c.homes : HOMES;
}
function activePockets(){
  if (state.corridor === 'all') return getAllCorridorPockets();
  const c = getActiveCorridor();
  return (c && c.pockets) ? c.pockets : POCKETS_R3;
}
function activeGoalMin(){
  if (typeof state !== 'undefined' && state.customGoalMin) return state.customGoalMin;
  const c = getActiveCorridor();
  return (c && c.goalMin) ? c.goalMin : GOAL_MIN;
}
function activeColor(){
  if (state.corridor === 'all') return '#803860';
  const c = getActiveCorridor();
  return (c && c.color) ? c.color : 'var(--shu)';
}

function calcCommute(stId, destId){
  if (state.corridor === 'all'){
    if (typeof STATIONS !== 'undefined' && STATIONS.some(s => s.id === stId)) {
      return (typeof keikyuCommute === 'function') ? keikyuCommute(stId, destId, true) : commute(stId, destId, true);
    }
    if (typeof CORRIDORS_DATA !== 'undefined'){
      for (const [k, c] of Object.entries(CORRIDORS_DATA)){
        if (k !== 'keikyu' && c && c.stations && c.stations.some(s => s.id === stId)){
          const oldC = state.corridor;
          state.corridor = k;
          const res = calcCommute(stId, destId);
          state.corridor = oldC;
          return res;
        }
      }
    }
    return (typeof keikyuCommute === 'function') ? keikyuCommute(stId, destId, true) : commute(stId, destId, true);
  }
  if (state.corridor === 'keikyu' || !state.corridor){
    return (typeof keikyuCommute === 'function') ? keikyuCommute(stId, destId, true) : commute(stId, destId, true);
  }
  const cData = getActiveCorridor();
  if (!cData || !cData.stations) return (typeof keikyuCommute === 'function') ? keikyuCommute(stId, destId, true) : commute(stId, destId, true);
  const stList = cData.stations;
  const a = stList.find(s => s.id === stId);
  if (!a) return { median: 25, p90: 29, direct: true, transfers: 0, verified: false, walkOnly: false };

  // Yokosuka Regional Multi-Line Routing
  if (destId === 'yokosuka' || destId === 'yokosuka_jr'){
    const JR_YOKOSUKA_LINE_TIMES = {
      yokosuka_jr: 0, taura_jr: 3, zushi: 8, kamakura: 14, kitakamakura: 17,
      ofuna: 21, totsuka: 26, higashitotsuka: 31, hodogaya: 36, yokohama: 42,
      shinkawasaki: 48, musashikosugi: 53
    };
    const KEIKYU_SOUTH_TIMES = {
      yokosukachuo: 0, shioiri: 2, heisaka: 4, anzinmuka: 6, keikyutaura: 8,
      oppama: 11, kanazawahakkei: 14, kanazawabunko: 17, nokendai: 20,
      keikyutomioka: 22, sugita: 24, byobugaura: 27, kamiooka: 29, gumyoji: 33,
      idogaya: 35, minamiota: 37, koganecho: 39, hinodecho: 41, tobe: 43, yokohama: 27
    };

    if (destId === 'yokosuka_jr' && JR_YOKOSUKA_LINE_TIMES[a.id] !== undefined){
      const med = JR_YOKOSUKA_LINE_TIMES[a.id];
      return { median: med, p90: Math.round((med + 2.5) * 10) / 10, direct: true, transfers: 0, verified: true, walkOnly: a.id === 'yokosuka_jr',
               note: { en: `JR Yokosuka Line direct (${med}′)`, ja: `JR横須賀線直通（${med}分）` } };
    }
    if (destId === 'yokosuka' && KEIKYU_SOUTH_TIMES[a.id] !== undefined){
      const med = KEIKYU_SOUTH_TIMES[a.id];
      return { median: med, p90: Math.round((med + 2.5) * 10) / 10, direct: true, transfers: 0, verified: true, walkOnly: a.id === 'yokosukachuo',
               note: { en: `Keikyū Line direct to Yokosuka-Chūō (${med}′)`, ja: `京急線直通 横須賀中央へ（${med}分）` } };
    }
    if (destId === 'yokosuka' && JR_YOKOSUKA_LINE_TIMES[a.id] !== undefined){
      const toYkJR = JR_YOKOSUKA_LINE_TIMES[a.id];
      const med = toYkJR + 12;
      return { median: med, p90: Math.round((med + 3.0) * 10) / 10, direct: false, transfers: 0, verified: true, walkOnly: false,
               note: { en: `JR Yokosuka Line (${toYkJR}′) + 12′ transfer walk to Chūō`, ja: `JR横須賀線（${toYkJR}分）+ 徒歩12分で中央へ` } };
    }
    if (destId === 'yokosuka_jr' && KEIKYU_SOUTH_TIMES[a.id] !== undefined){
      const toKk = KEIKYU_SOUTH_TIMES[a.id];
      const med = toKk + 12;
      return { median: med, p90: Math.round((med + 3.0) * 10) / 10, direct: false, transfers: 0, verified: true, walkOnly: false,
               note: { en: `Keikyū Line (${toKk}′) + 12′ walk to JR Yokosuka`, ja: `京急線（${toKk}分）+ 徒歩12分でJR横須賀へ` } };
    }

    if (destId === 'yokosuka'){
      if (state.corridor === 'toyoko'){
        if (a.id === 'yokohama'){
          return { median: 27, p90: 28.5, direct: true, transfers: 0, verified: true, walkOnly: false,
                   note: { en:'Keikyū Main Line Kaitoku from Yokohama (27′)', ja:'横浜から京急快特直通（27分）' } };
        }
        if (a.id === 'hiyoshi'){
          return { median: 44, p90: 49.5, direct: false, transfers: 1, verified: true, walkOnly: false,
                   note: { en:'Tōyoko Express to Yokohama (12′) + Keikyū Kaitoku (27′)', ja:'東横線急行で横浜へ（12分）+ 京急快特（27分）' } };
        }
        if (a.id === 'kikuna'){
          return { median: 38, p90: 43.5, direct: false, transfers: 1, verified: true, walkOnly: false,
                   note: { en:'Tōyoko Express to Yokohama (6′) + Keikyū Kaitoku (27′)', ja:'東横線急行で横浜へ（6分）+ 京急快特（27分）' } };
        }
        if (a.id === 'musashikosugi'){
          return { median: 46, p90: 51.5, direct: false, transfers: 1, verified: true, walkOnly: false,
                   note: { en:'Tōyoko Express to Yokohama (14′) + Keikyū Kaitoku (27′)', ja:'東横線急行で横浜へ（14分）+ 京急快特（27分）' } };
        }
        const diff = Math.abs(45 - a.cumL);
        const runMin = (a.tier >= 2) ? Math.round(diff * 0.60) : Math.round(diff * 0.72 + 2);
        const median = runMin + 5 + 27;
        const hw = a.hw || 3;
        const p90 = Math.round((median + hw * 0.4 + 4) * 10) / 10;
        return { median, p90, direct: false, transfers: 1, verified: false, walkOnly: false,
                 note: { en:'Tōyoko Line to Yokohama (transfer) + Keikyū Kaitoku (27′)', ja:'東横線で横浜へ（乗換）+ 京急快特（27分）' } };
      }
      if (state.corridor === 'odakyu'){
        const diffMachida = Math.abs(48 - a.cumL);
        const toMachida = (a.tier >= 2) ? Math.round(diffMachida * 0.60) : Math.round(diffMachida * 0.75 + 2);
        const median = (a.id === 'machida') ? 59 : toMachida + 4 + 59;
        return { median, p90: median + 6, direct: false, transfers: (a.id==='machida'?1:2), verified: false, walkOnly: false,
                 note: { en:'Via JR Yokohama Line to Yokohama + Keikyū Kaitoku', ja:'JR横浜線経由 横浜乗換 京急快特' } };
      }
      if (state.corridor === 'hibiya'){
        const toNakameguro = Math.round(a.cumL * 0.85);
        const median = toNakameguro + 24 + 5 + 27;
        return { median, p90: median + 6, direct: false, transfers: (a.id==='nakameguro'?1:2), verified: false, walkOnly: false,
                 note: { en:'Via Naka-Meguro / Tōyoko to Yokohama + Keikyū Kaitoku', ja:'中目黒・東横線経由 横浜乗換 京急快特' } };
      }
      if (state.corridor === 'denentoshi'){
        const diffMizo = Math.abs(14.1 - a.cumL);
        const toMizo = Math.round(diffMizo * 0.65);
        const median = toMizo + 6 + 4 + 44;
        return { median, p90: median + 6, direct: false, transfers: 2, verified: false, walkOnly: false,
                 note: { en:'Via JR Nambu / Musashi-Kosugi to Keikyū / JR', ja:'JR南武線・武蔵小杉経由' } };
      }
    }

    if (destId === 'yokosuka_jr'){
      if (state.corridor === 'toyoko'){
        if (a.id === 'musashikosugi'){
          return { median: 53, p90: 55.5, direct: true, transfers: 0, verified: true, walkOnly: false,
                   note: { en:'JR Yokosuka Line direct (53′)', ja:'JR横須賀線直通（53分）' } };
        }
        if (a.id === 'hiyoshi'){
          return { median: 52, p90: 56.5, direct: false, transfers: 1, verified: true, walkOnly: false,
                   note: { en:'Tōyoko Express to Yokohama (12′) + JR Yokosuka Line (35′)', ja:'東横線急行で横浜へ（12分）+ JR横須賀線（35分）' } };
        }
        if (a.id === 'yokohama'){
          return { median: 42, p90: 44.5, direct: true, transfers: 0, verified: true, walkOnly: false,
                   note: { en:'JR Yokosuka Line direct from Yokohama (42′)', ja:'横浜からJR横須賀線直通（42分）' } };
        }
        const diff = Math.abs(45 - a.cumL);
        const runMin = (a.tier >= 2) ? Math.round(diff * 0.60) : Math.round(diff * 0.72 + 2);
        const median = runMin + 5 + 42;
        const hw = a.hw || 3;
        const p90 = Math.round((median + hw * 0.4 + 4) * 10) / 10;
        return { median, p90, direct: false, transfers: 1, verified: false, walkOnly: false,
                 note: { en:'Tōyoko Line to Yokohama + JR Yokosuka Line (42′)', ja:'東横線で横浜へ + JR横須賀線（42分）' } };
      }
    }
  }

  const b = stList.find(s => s.id === destId) || stList[0];
  if (!b) return { median: 25, p90: 29, direct: true, transfers: 0, verified: false, walkOnly: false };
  if (a.id === b.id) return { median: 0, p90: 0, direct: true, walkOnly: true };

  const rawDiff = Math.abs(a.cumL - b.cumL);
  let median = rawDiff;
  let direct = true, transfers = 0;

  if (a.tier >= 2 && b.tier >= 2 && rawDiff > 6){
    median = Math.round(rawDiff * 0.60 * 10) / 10;
  } else if (rawDiff > 12 && (a.tier === 1 || b.tier === 1)){
    median = Math.round((rawDiff * 0.72 + 3) * 10) / 10;
    transfers = 1;
    direct = false;
  }
  const hw = a.hw || 4;
  median = Math.round((median + hw / 2) * 10) / 10;
  const p90 = Math.round((median + hw * 0.4 + 4 * transfers) * 10) / 10;
  return { median, p90, direct, transfers, verified: false, walkOnly: false };
}

/* ————— location essence (Round 2.5) ————— */
function kickVideos(){        // innerHTML-parsed `muted` doesn't set the IDL prop → autoplay refuses; set it and play
  document.querySelectorAll('.ess video').forEach(v => { v.muted = true; const p = v.play(); if (p) p.catch(()=>{}); });
}
function essStrip(sid, mode){          // mode: true/'big' = sheet · 'card' = grid card · falsy = still strip
  const e = (typeof ESSENCE !== 'undefined') && ESSENCE[sid];
  if (!e) return '';
  const big = mode === true || mode === 'big';
  const cardAnim = mode === 'card';
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let media;
  if (big && !reduced){                  // sheets: play immediately
    media = `<video poster="essence/${sid}.webp" autoplay muted loop playsinline aria-label="${esc(e.detail)}">
       <source src="essence/${sid}_live.webm" type="video/webm"><source src="essence/${sid}_live.mp4" type="video/mp4"></video>`;
  } else if (cardAnim && !reduced){      // cards: lazy video, played only while in view (IO below)
    media = `<video poster="essence/${sid}.webp" preload="none" muted loop playsinline data-essio aria-label="${esc(e.detail)}">
       <source src="essence/${sid}_live.webm" type="video/webm"><source src="essence/${sid}_live.mp4" type="video/mp4"></video>`;
  } else {
    media = `<img src="essence/${sid}.webp" loading="lazy" alt="${esc(e.detail)}">`;
  }
  const playBtn = (big && reduced) ? `<span class="essplay" data-essplay="${sid}" role="button" tabindex="0" aria-label="play ambient loop">▶</span>` : '';
  return `<div class="ess${big?' essbig':''}" data-esswrap="${sid}">${media}${playBtn}
    <span class="wm">${esc(t('ess_wm'))} <i data-essinfo="${sid}" role="button" tabindex="0" aria-label="${esc(t('ess_title'))}">ⓘ</i></span></div>`;
}
function pocketEssStrip(p, mode){
  const pkId = 'pk_' + p.id;
  const hasDedicated = (typeof ESSENCE !== 'undefined') && !!ESSENCE[pkId];
  if (hasDedicated) return essStrip(pkId, mode);
  return p.off ? '' : essStrip(p.st, mode);
}
/* search: tokens AND-ed; each token tries a semantic alias first (structured
   predicate + reason label), else full-text against the item's dossier.
   Prefix '-' negates a token. Works on Homes, Pockets, and dims the Corridor. */
const Q_ALIASES = [
  { keys:['noise','noisy','騒音','loud'], label:{en:'noise watch',ja:'騒音注意'},
    fn:(k,it)=> k==='pocket' ? !!(it.noiseWatch||noiseSummary(it.st)) : !!noiseSummary(it.st) },
  { keys:['quiet','静か','しずか'], label:{en:'quiet ≥4',ja:'夜静4以上'},
    fn:(k,it)=>{ const a=areaFor(it.st); const q=a.quiet&&a.quiet.v; return k==='pocket' ? it.ax.quiet>=4 : (q||3)>=4; } },
  { keys:['breeze','seabreeze','海風','wind','風'], label:{en:'sea/river air',ja:'海・川の風'},
    fn:(k,it)=>{ const s=areaFor(it.st).senses; return !!s && ['sea','river','canal'].includes(s.breeze); } },
  { keys:['photo','golden,','golden','映え','instagram','photogenic'], label:{en:'photogenic',ja:'映え'},
    fn:(k,it)=> k==='pocket' ? (it.ax.photo||0)>=4 : !!areaFor(it.st).photoOps },
  { keys:['refined','organic','seijo','成城','洗練','オーガニック'], label:{en:'refined / premium grocer',ja:'洗練・高級グローサリー'},
    fn:(k,it)=> k==='pocket' ? (it.ax.refined||0)>=3 || !!areaFor(it.st).grocerPlus : !!areaFor(it.st).grocerPlus },
  { keys:['english','expat','英語'], label:{en:'english-friendly',ja:'英語フレンドリー'},
    fn:(k,it)=> k==='pocket' ? (it.ax.intl||0)>=4 : !!it.en_agent },
  { keys:['direct','直通'], label:{en:'direct run',ja:'直通'},
    fn:(k,it)=> calcCommute(it.st, state.dest).direct },
  { keys:['cheap','安い'], label:{en:'under market',ja:'相場より安い'},
    fn:(k,it)=> k==='pocket' ? (((activeWards()[it.ward]||(typeof WARDS!=='undefined'&&WARDS[it.ward])||{}).souba?.['1K'])||99e4)<100000 : bandFor(it)==='under' },
  { keys:['new','新築'], label:{en:'new build',ja:'新築'},
    fn:(k,it)=> k==='pocket' ? false : /202[3-9]/.test(it.built||'') },
  { keys:['live'], label:{en:'live listing',ja:'ライブ'},
    fn:(k,it)=> k==='pocket' ? false : it.tier==='LIVE' },
];
const Q_CACHE = new Map();
function qText(kind, it){
  const key = kind + ':' + (it.id || it.st);
  if (Q_CACHE.has(key)) return Q_CACHE.get(key);
  const a = areaFor(it.st) || {};
  const bits = [];
  const both = o => { if(!o) return; if(typeof o==='string'){bits.push(o);return;} bits.push(o.en||'', o.ja||''); };
  if (kind === 'pocket'){
    both(it.name); both(it.gem); both(it.photoOp); both(it.how); both(it.noiseWatch);
    bits.push(it.id||'', it.st||'');
  } else {
    both(it.name);
    bits.push(it.id||'', it.layout||'', it.srcName||'', it.built||'', it.address||'', it.url||'', it.mapUrl||'');
    both(it.why); both(it.extra);
    if(it.listed){ both(it.listed.st); bits.push(it.listed.line||''); }
    const p = pocketForListing(it);
    if (p){ both(p.name); both(p.gem); bits.push(p.id||''); }
  }
  const st = activeStations().find(s => s.id === it.st) || (typeof S_IDX !== 'undefined' && STATIONS[S_IDX[it.st]]) || { en:it.st, ja:it.st, ward:'' };
  const w = activeWards()[st.ward] || (typeof WARDS !== 'undefined' && WARDS[st.ward]) || { en:st.ward, ja:st.ward };
  bits.push(st.en, st.ja, tx(w), ty(w)||'');
  [a.char,a.style,a.landmarks,a.food,a.hobby,a.grocery,a.coffee,a.crime,a.people,a.photoOps].forEach(both);
  if (a.senses){ both(a.senses.smell); both(a.senses.feel); }
  (a.noise||[]).forEach(ev=>both(ev));
  const s = bits.join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  Q_CACHE.set(key, s);
  return s;
}
function qMatch(kind, it){
  const q = (state.q||'').trim().toLowerCase();
  if (!q) return { ok:true, reasons:[] };
  const toks = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[\s,]+/).filter(Boolean);
  const reasons = [];
  for (let tok of toks){
    const neg = tok.startsWith('-'); if (neg) tok = tok.slice(1);
    if (!tok) continue;
    const alias = Q_ALIASES.find(al => al.keys.some(kk => kk.startsWith(tok) && tok.length>=Math.min(3,kk.length) || kk===tok));
    let hit, label;
    if (alias){ hit = alias.fn(kind, it); label = tx(alias.label); }
    else { hit = qText(kind, it).includes(tok); label = '“'+tok+'”'; }
    if (neg ? hit : !hit) return { ok:false, reasons:[] };
    if (!neg) reasons.push(label);
  }
  return { ok:true, reasons };
}
function matchLine(reasons){
  return (state.q && reasons && reasons.length)
    ? `<div class="matchline">${reasons.map(r=>`<i>✓ ${esc(r)}</i>`).join('')}</div>` : '';
}

const BREEZE_LABEL = { sea:{en:'sea breeze',ja:'海風'}, river:{en:'river breeze',ja:'川風'}, canal:{en:'canal air',ja:'運河の風'}, hill:{en:'hillside air',ja:'丘の風'}, canyon:{en:'street-canyon',ja:'ビル谷'}, still:{en:'still air',ja:'風少なめ'} };
function senseHtml(s){
  if (!s) return '';
  const smell = esc(tx(s.smell))
    .replace(/\+([^·<]+)/g, '<b style="color:var(--good)">+$1</b>')
    .replace(/−([^·<]+)/g, '<b style="color:var(--bad)">−$1</b>')
    .replace(/~([^·<]+)/g, '<span style="color:var(--warn)">~$1</span>');
  const br = BREEZE_LABEL[s.breeze] || BREEZE_LABEL.still;
  const meter = '▮'.repeat(s.crowd) + '▯'.repeat(5-s.crowd);
  return `${smell}<br>🌬 ${esc(tx(br))} · <span title="${esc(t('feel_scale'))}">${esc(t('feel_rush'))} <b>${meter}</b></span><br><small>${esc(tx(s.feel))}</small>`;
}
function goldenHour(){                 // NOAA-approx sunset for 35.55N 139.75E, JST — tier P, ±3min
  const d = new Date();
  const n = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5);
  const rad = Math.PI/180;
  const decl = 23.45*rad*Math.sin(2*Math.PI*(284+n)/365);
  const lat = 35.55*rad;
  const ha = Math.acos(Math.max(-1, Math.min(1, -Math.tan(lat)*Math.tan(decl)))) / rad;   // degrees
  const B = 2*Math.PI*(n-81)/364;
  const eot = 9.87*Math.sin(2*B) - 7.53*Math.cos(B) - 1.5*Math.sin(B);                     // minutes
  const noon = 12*60 - (139.75-135)*4 - eot;                                               // JST minutes
  const sunset = noon + ha*4;
  const fmt = m => `${Math.floor(m/60)}:${String(Math.round(m%60)).padStart(2,'0')}`;
  return { start: fmt(sunset-40), end: fmt(sunset), sunset: fmt(sunset) };
}
function noiseSummary(stId){
  const evs = (typeof NOISE_EVENTS !== 'undefined') && NOISE_EVENTS[stId];
  if (!evs || !evs.length) return null;
  const enParts = evs.map(e => e.summary?.en || (typeof NOISE_TYPE_LABELS !== 'undefined' && NOISE_TYPE_LABELS[e.type]?.en ? NOISE_TYPE_LABELS[e.type].en : e.type) + ` (${tx(e.when)})`);
  const jaParts = evs.map(e => e.summary?.ja || (typeof NOISE_TYPE_LABELS !== 'undefined' && NOISE_TYPE_LABELS[e.type]?.ja ? NOISE_TYPE_LABELS[e.type].ja : e.type) + `（${tx(e.when)}）`);
  const tipEn = evs[0]?.tip?.en ? ` — ${evs[0].tip.en}` : ' — check street setback and double glazing';
  const tipJa = evs[0]?.tip?.ja ? ` — ${evs[0].tip.ja}` : ' — 幹線から奥のブロックや二重サッシを推奨';
  return {
    en: `Noise watch: ${enParts.join(' · ')}${tipEn}.`,
    ja: `騒音注意：${jaParts.join('、')}${tipJa}。`
  };
}
let essIO = null;
function bindCardVideos(){               // only the cards in view decode/play — scroll stays 60fps
  if (essIO) essIO.disconnect();
  const vids = document.querySelectorAll('video[data-essio]');
  if (!vids.length) return;
  essIO = new IntersectionObserver(ents => ents.forEach(en => {
    const v = en.target;
    if (en.isIntersecting){ v.muted = true; const p = v.play(); if (p) p.catch(()=>{}); }
    else v.pause();
  }), { rootMargin: '140px' });
  vids.forEach(v => essIO.observe(v));
}
function openEssInfo(sid){
  const e = (typeof ESSENCE !== 'undefined') && ESSENCE[sid]; if (!e) return;
  let title = sid;
  if (sid.startsWith('pk_')){
    const pid = sid.slice(3);
    const pk = (typeof POCKETS_R3 !== 'undefined') && POCKETS_R3.find(x => x.id === pid);
    if (pk) title = tx(pk.name);
  } else {
    const st = STATIONS[S_IDX[sid]];
    if (st) title = esc(LANG.cur==='ja' ? st.ja : st.en);
  }
  $('#overlay').innerHTML = `<div class="sheet" role="dialog" aria-modal="true" style="width:min(560px,100%)">
    <button type="button" class="sheet-close" data-close="1" aria-label="${esc(t('close'))}">✕</button>
    <h2 style="font-size:19px">${esc(t('ess_title'))} — ${esc(title)}</h2>
    <p class="jah">${esc(e.detail)}</p>
    ${essStrip(sid, true)}
    <div class="sect" style="border-top:none;margin-top:4px;padding-top:0"><h3>${esc(t('ess_matched'))}</h3>
      <ul class="esslist">${e.matched.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="sect"><h3>${esc(t('ess_not'))}</h3>
      <p style="margin:0;font-size:13px;color:var(--muted)">${esc(LANG.cur==='ja'?'特定の建物や店舗・現況・季節・正確な寸法':'any specific building or storefront · current condition · season · exact geometry')}</p></div>
    <p class="provrow" style="margin-top:12px">${esc(e.method)} · ${esc(e.status)} · ${esc(e.grade)} · ${esc(e.gen)}<br>${esc(t('ess_upgrade'))}</p>
    <div class="sheetacts"><span class="cta ghost" data-close="1">${esc(t('close'))}</span></div>
  </div>`;
  $('#overlay').hidden = false; kickVideos();
}

function bldgStrip(lid, mode){
  const H = (typeof HERO_VISUALS !== 'undefined') && HERO_VISUALS[lid];
  const B = H || ((typeof BUILDING_VISUALS !== 'undefined') && BUILDING_VISUALS[lid]);
  if (B) {
    const cls = (mode === 'card') ? 'ess bldg' : 'ess essbig bldg';
    return `<div class="${cls}"><img src="${B.src}" loading="lazy" alt="${esc(B.detail)}">
      <span class="wm">${esc(t('bldg_wm'))} <i data-bldginfo="${lid}" role="button" tabindex="0" aria-label="${esc(t('ess_title'))}">ⓘ</i></span></div>`;
  }
  const q = (typeof RENDER_QUEUED !== 'undefined') && RENDER_QUEUED.includes(lid);
  return q ? `<p class="note" style="margin:0 0 10px">🏗 ${esc(t('bldg_queued'))}</p>` : '';
}
function openBldgInfo(lid){
  const B = ((typeof HERO_VISUALS !== 'undefined') && HERO_VISUALS[lid]) || ((typeof BUILDING_VISUALS !== 'undefined') && BUILDING_VISUALS[lid]);
  if (!B) return;
  $('#overlay').innerHTML = `<div class="sheet" role="dialog" aria-modal="true" style="width:min(560px,100%)">
    <button type="button" class="sheet-close" data-close="1" aria-label="${esc(t('close'))}">✕</button>
    <h2 style="font-size:19px">${esc(t('ess_title'))}</h2>
    <p class="jah">${esc(B.detail)}</p>
    <div class="ess essbig bldg"><img src="${B.src}" alt=""></div>
    <div class="sect" style="border-top:none;margin-top:4px;padding-top:0"><h3>${esc(t('ess_matched'))}</h3>
      <ul class="esslist">${B.matched.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="sect"><h3>${esc(t('ess_not'))}</h3>
      <p style="margin:0;font-size:13px;color:var(--muted)">${esc(LANG.cur==='ja'?'実際の外観の詳細・窓配置・色（明記されたもの以外）・敷地状況・現況':'actual facade beyond stated facts · window placement · colors (except stated) · site context · current condition')}</p></div>
    <p class="provrow" style="margin-top:12px">${esc(B.status)} · ${esc(B.grade)} · ${esc(t('bldg_upgrade'))}</p>
    <div class="sheetacts"><span class="cta ghost" data-close="1">${esc(t('close'))}</span></div>
  </div>`;
  $('#overlay').hidden = false; kickVideos();
}

/* ————— madori glyphs (honest floor plans — no fake photos) ————— */
const MADORI = {
  '1R':   [[8,8,60,84,'1R'],[70,8,22,30,'浴'],[70,42,22,50,'']],
  '1K':   [[8,8,56,84,'1K'],[66,8,26,36,'K'],[66,48,26,44,'浴']],
  '1DK':  [[8,8,48,84,'1DK'],[58,8,34,48,'DK'],[58,60,34,32,'浴']],
  '1LDK': [[8,8,44,84,'LDK'],[54,8,38,52,'1'],[54,64,38,28,'浴']],
  '1SLDK':[[8,8,44,84,'LDK'],[54,8,38,36,'1'],[54,46,38,22,'S'],[54,70,38,22,'浴']],
  '2K':   [[8,8,42,42,'1'],[8,52,42,40,'2'],[52,8,40,50,'K'],[52,60,40,32,'浴']],
  '2DK':  [[8,8,42,42,'1'],[8,52,42,40,'2'],[52,8,40,50,'DK'],[52,60,40,32,'浴']],
  '2LDK': [[8,8,40,42,'1'],[8,52,40,40,'2'],[50,8,42,60,'LDK'],[50,70,42,22,'浴']],
  '3DK':  [[8,8,40,28,'1'],[8,38,40,26,'2'],[8,66,40,26,'3'],[50,8,42,56,'DK'],[50,66,42,26,'浴']],
  '3LDK': [[8,8,40,28,'1'],[8,38,40,26,'2'],[8,66,40,26,'3'],[50,8,42,56,'LDK'],[50,66,42,26,'浴']],
};
function madori(l){
  const rooms = MADORI[layoutClass(l)] || MADORI['1K'];
  const cells = rooms.map(([x,y,w,h,lab]) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/>` +
    (lab ? `<text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle" font-size="${lab.length>2?10:12}" font-weight="700" fill="currentColor">${lab}</text>` : '')
  ).join('');
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${esc(l.layout)}">${cells}</svg>`;
}

/* ————— commute dial ————— */
function dial(c){
  const m = c.median, R = 30, C = 2*Math.PI*R;
  const frac = Math.min(m/(GOAL_MIN*2), 1);
  const col = m <= GOAL_MIN ? 'var(--good)' : m <= GOAL_MIN+8 ? 'var(--warn)' : 'var(--bad)';
  const goalA = (GOAL_MIN/(GOAL_MIN*2))*360 - 90;
  const gx = 38 + 34*Math.cos(goalA*Math.PI/180), gy = 38 + 34*Math.sin(goalA*Math.PI/180);
  const gx2 = 38 + 27*Math.cos(goalA*Math.PI/180), gy2 = 38 + 27*Math.sin(goalA*Math.PI/180);
  return `<div class="dial" title="${t('med')} ${m}′ · ${t('p90')} ${c.p90}′">
    <svg viewBox="0 0 76 76" width="76" height="76">
      <circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--line)" stroke-width="7"/>
      <circle cx="38" cy="38" r="${R}" fill="none" stroke="${col}" stroke-width="7"
        stroke-linecap="round" stroke-dasharray="${(frac*C).toFixed(1)} ${C.toFixed(1)}"
        transform="rotate(-90 38 38)"/>
      <line x1="${gx2.toFixed(1)}" y1="${gy2.toFixed(1)}" x2="${gx.toFixed(1)}" y2="${gy.toFixed(1)}" stroke="var(--shu)" stroke-width="2.5"/>
    </svg>
    <div class="dv">${c.walkOnly ? '0' : (c.approxMark||'') + m}′<small>${t('med')}</small></div>
  </div>`;
}

/* ————— chrome / i18n ————— */
function applyChrome(){
  document.documentElement.lang = LANG.cur;
  $('#navcorr').innerHTML = `${esc(t('nav_corridor'))} <small>${LANG.cur==='en'?'沿線':'Corridor'}</small>`;
  $('#navlines').innerHTML = `${esc(t('nav_lines'))} <small>${LANG.cur==='en'?'路線':'Lines'}</small>`;
  $('#navhomes').innerHTML = `${esc(t('nav_homes'))} <small>${LANG.cur==='en'?'物件':'Homes'}</small>`;
  $('#navpockets').innerHTML = `${esc(t('nav_pockets'))} <small>${LANG.cur==='en'?'街角':'Pockets'}</small>`;
  $('#navradio').innerHTML = `${esc(t('nav_radio'))} <small>${LANG.cur==='en'?'電波':'Radio'}</small>`;
  $('#destlabel').textContent = t('commute_to');
  const curGoal = activeGoalMin();
  const corrGoal = (getActiveCorridor() && getActiveCorridor().goalMin) || GOAL_MIN;
  const gp = $('#goalpick');
  if (gp){
    const optLabel = (val) => {
      if (val === corrGoal) return `${LANG.cur==='ja'?'目標':'goal'} ${val}′`;
      if (val === 40 || val === 45) return `${LANG.cur==='ja'?'希望':'limit'} ${val}′`;
      if (val === 60) return `${LANG.cur==='ja'?'上限 60分 (1h)':'limit 60′ (1h)'}`;
      return `${val}′`;
    };
    const goals = Array.from(new Set([corrGoal, 40, 60]));
    gp.innerHTML = goals.map(g => `<option value="${g}" ${Math.abs(g - curGoal) < 0.1 ? 'selected' : ''}>${optLabel(g)}</option>`).join('');
  }
  const gc = $('#goalchip');
  if (gc) gc.textContent = `goal ${curGoal}′`;
  $('#langbtn').textContent = t('lang_btn');
  $('#q').placeholder = t('q_ph');
  const corr = CORRIDORS[state.corridor] || CORRIDORS.keikyu;
  $('#brandtag').textContent = corr.tag + ' · rentals';
  $('#foot1').textContent = t('foot_1');
  $('#foot2').textContent = t('foot_2');
  const sel = $('#dest');
  const destList = activeDests();
  sel.innerHTML = destList.map(d => `<option value="${d.id}" ${d.id===state.dest?'selected':''}>${esc(tx(d))}</option>`).join('');
}

/* ————— corridor view ————— */
function heat(v){
  if (v == null) return 'var(--muted)';
  const tt = Math.max(0, Math.min(1, (v - 65000)/(160000 - 65000)));
  return `hsl(${Math.round(210 - 195*tt)} 68% 58%)`;
}
function corridorView(){
  const curCorr = getActiveCorridor() || { name:'Corridor', ja:'沿線', desc:{en:'',ja:''}, zones:[] };
  const stList = activeStations();
  const wards = activeWards();
  const anchors = activeAnchors();
  const goalMin = activeGoalMin();
  const brandColor = activeColor();

  // 1. Multi-Corridor Selector Deck
  const deckCards = Object.entries(CORRIDORS).map(([cid, c]) => {
    const isActive = (state.corridor || 'keikyu') === cid;
    const cData = (typeof CORRIDORS_DATA !== 'undefined' && CORRIDORS_DATA[cid]) || {};
    const nStns = cData.stations ? cData.stations.length : (cid === 'keikyu' ? 33 : 21);
    const label = LANG.cur === 'ja' ? c.ja : c.name;
    return `
      <div class="corr-card ${isActive ? 'active' : ''}" data-corridor-switch="${cid}" role="button" tabindex="0" aria-label="${esc(label)}">
        <div class="corr-card-head">
          <span class="corr-badge">${c.badge}</span>
          <span class="corr-status">${isActive ? (LANG.cur==='ja'?'選択中':'ACTIVE') : (LANG.cur==='ja'?'切替':'SWITCH')}</span>
        </div>
        <span class="corr-name">${esc(label)}</span>
        <span class="corr-tag">${esc(c.tag)}</span>
        <span class="corr-stat">${nStns} ${esc(LANG.cur==='ja'?'駅':'stations')} · LIVE</span>
      </div>`;
  }).join('');

  // 2. Service class filter chips
  const nExpress = stList.filter(s => s.tier >= 2).length;
  const nLocal = stList.filter(s => s.tier === 1).length;
  const serviceChips = `
    <div class="corr-service-chips" role="group" aria-label="Filter service pattern">
      <button type="button" class="corr-chip ${state.fService==='all'?'active':''}" data-fservice="all">${esc(LANG.cur==='ja'?'全駅表示':'All Stations')} (${stList.length})</button>
      <button type="button" class="corr-chip ${state.fService==='express'?'active':''}" data-fservice="express">⚡ ${esc(LANG.cur==='ja'?'優等停車駅のみ':'Express / Rapid Only')} (${nExpress})</button>
      <button type="button" class="corr-chip ${state.fService==='local'?'active':''}" data-fservice="local">☕ ${esc(LANG.cur==='ja'?'各駅停車のみ（閑静な住宅街）':'Local Only (Quiet Enclaves)')} (${nLocal})</button>
    </div>`;

  // 3. Dynamic SVG Line Map
  const W = 60 + stList.length * 56, BASE = 168;
  let svg = '';

  if (state.corridor === 'keikyu' || !state.corridor){
    const jx = 30 + (typeof S_IDX !== 'undefined' && S_IDX['sengakuji'] ? S_IDX['sengakuji'] : 7) * 56;
    svg += `<line x1="30" y1="${BASE}" x2="${jx}" y2="${BASE}" stroke="#e85298" stroke-width="5" stroke-linecap="round"/>`;
    svg += `<line x1="${jx}" y1="${BASE}" x2="${W-30}" y2="${BASE}" stroke="var(--shu)" stroke-width="5" stroke-linecap="round"/>`;
    svg += `<text x="${30 + 3.5*56}" y="${BASE-118}" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="2" fill="#e85298">TOEI ASAKUSA 都営浅草線</text>`;
    svg += `<text x="${jx + 12*56}" y="${BASE-118}" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="2" fill="var(--shu)">KEIKYU MAIN 京急本線</text>`;
    svg += `<g><line x1="${jx}" y1="${BASE-96}" x2="${jx}" y2="${BASE+64}" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="${jx}" y="${BASE+80}" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--gold)">${esc(t('corr_through'))}</text></g>`;
  } else {
    svg += `<line x1="30" y1="${BASE}" x2="${W-30}" y2="${BASE}" stroke="${brandColor}" stroke-width="5" stroke-linecap="round"/>`;
    svg += `<text x="${W/2}" y="${BASE-118}" text-anchor="middle" font-size="12" font-weight="700" letter-spacing="2" fill="${brandColor}">${esc(LANG.cur==='ja'?curCorr.ja:curCorr.name.toUpperCase() + ' LINE')}</text>`;
  }

  stList.forEach((s, i) => {
    const x = 30 + i * 56, y = BASE;
    const c = calcCommute(s.id, state.dest);
    const gd = c.median - goalMin;
    const w = wards[s.ward] || (typeof WARDS !== 'undefined' && WARDS[s.ward]) || { souba: {} };
    const rent1k = w.souba?.['1K'] ?? w.souba?.['1R'];
    const r = s.tier === 3 ? 9 : s.tier === 2 ? 7 : 4.5;
    const near = !c.walkOnly && Math.abs(gd) <= 5;
    const qm = state.q ? qMatch('listing', { st: s.id, name: { en: s.en, ja: s.ja } }).ok : true;

    let svcMatch = true;
    if (state.fService === 'express') svcMatch = s.tier >= 2;
    if (state.fService === 'local') svcMatch = s.tier === 1;

    const op = (qm && svcMatch) ? 1 : 0.20;

    const isSnap = (s.id === state.activeStnDrawer);
    if (isSnap) {
      svg += `<circle cx="${x}" cy="${y}" r="${r+9}" fill="none" stroke="var(--gold)" stroke-width="3.2" stroke-dasharray="4 2" class="pulse-ring"/>`;
    } else if (near && svcMatch) {
      svg += `<circle cx="${x}" cy="${y}" r="${r+6.5}" fill="none" stroke="var(--gold)" stroke-width="2" opacity=".85"/>`;
    }
    const tipText = isSnap ? (LANG.cur==='ja'?'📖 もう一度クリックで街詳細カードを開く':'📖 Click again to open Dossier') : (LANG.cur==='ja'?'📍 クリックで駅探索（もう一度クリックで詳細）':'📍 Click to explore station (click again for dossier)');
    svg += `<g class="stn ${isSnap ? 'selected active-dot' : ''}" data-stn-snap="${s.id}" tabindex="0" role="button" aria-label="${esc(s.en)}" opacity="${isSnap ? 1 : op}">
      <title>${esc(LANG.cur==='ja'?s.ja:s.en)} · ${esc(tipText)}</title>
      ${qm && state.q ? `<circle cx="${x}" cy="${y}" r="${r+9}" fill="none" stroke="var(--gold)" stroke-width="1.6" stroke-dasharray="3 3"/>` : ''}
      <circle cx="${x}" cy="${y}" r="${r+14}" fill="transparent"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="${heat(rent1k)}" stroke="var(--navy-ink)" stroke-width="${isSnap ? 3.8 : (s.tier>1?3:1.5)}"/>
      ${s.tier === 3 ? `<circle cx="${x}" cy="${y}" r="${r+3.2}" fill="none" stroke="var(--navy-ink)" stroke-width="1.2"/>` : ''}
      <text x="${x}" y="${y-16}" transform="rotate(-42 ${x} ${y-16})" font-size="11.5" font-weight="${isSnap || s.tier>1?700:500}" fill="${isSnap ? 'var(--gold)' : 'var(--navy-ink)'}">${esc(LANG.cur==='ja'?s.ja:s.en)}</text>
      <text x="${x}" y="${y+22}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${isSnap ? 'var(--gold)' : (c.walkOnly?'var(--gold)':(gd<=0?'#7fd8ab':'var(--navy-muted)'))}">${c.walkOnly?'·':c.median+'′'}</text>
      <text x="${x}" y="${y+37}" text-anchor="middle" font-size="9.5" fill="${isSnap ? 'var(--gold)' : 'var(--navy-muted)'}">${man(rent1k)}</text>
      <text x="${x}" y="${y+51}" text-anchor="middle" font-size="8.5" fill="var(--navy-muted)" opacity=".8">${s.num || ''}</text>
    </g>`;
  });

  // 4. Station snapshot drawer (if active)
  let snapDrawer = '';
  if (state.activeStnDrawer) {
    const s = stList.find(x => x.id === state.activeStnDrawer);
    if (s) {
      const c = calcCommute(s.id, state.dest);
      const w = wards[s.ward] || (typeof WARDS !== 'undefined' && WARDS[s.ward]) || {};
      const r1k = w.souba?.['1K'] ?? w.souba?.['1R'];
      snapDrawer = `
        <div class="corr-stn-drawer" role="region" aria-label="Station Snapshot">
          <div>
            <h3>${s.tier===3?'◎ ':s.tier===2?'○ ':'· '}${esc(LANG.cur==='ja'?s.ja:s.en)} <small style="color:var(--muted)">(${s.num || ''})</small></h3>
            <p>1K Market: <b>${man(r1k)}</b> · Commute to ${esc(state.dest)}: <b>${c.median}′</b> (${c.direct ? (LANG.cur==='ja'?'直通':'direct') : (LANG.cur==='ja'?'乗換1回':'1 transfer')}) · Ward: <b>${esc(w[LANG.cur==='ja'?'ja':'en'] || s.ward)}</b></p>
          </div>
          <div class="acts">
            <button type="button" class="btn" style="padding:6px 12px;font-size:12px" data-filter-stn="${s.id}">${esc(LANG.cur==='ja'?'この駅の物件を見る':'See Homes Here')}</button>
            <button type="button" class="btn btn-pri" style="padding:6px 12px;font-size:12px" data-open-dossier="${s.id}">${esc(LANG.cur==='ja'?'街の詳細シート →':'Full Area Dossier →')}</button>
          </div>
        </div>`;
    }
  }

  // 5. Corridor Lifestyle Zones
  const zones = curCorr.zones || [];
  const zonesHtml = zones.length ? `
    <div class="corr-zones-grid">
      ${zones.map(z => `
        <div class="corr-zone-card">
          <h4>${z.num}. ${esc(LANG.cur==='ja'?z.ja:z.en)}</h4>
          <p style="font-size:11.5px;color:var(--shu);font-weight:600;margin-bottom:4px">${esc(z.stns)}</p>
          <p>${esc(LANG.cur==='ja'?z.desc.ja:z.desc.en)}</p>
        </div>`).join('')}
    </div>` : '';

  // 6. Corridor Rent Gradient Curve
  const soubaVals = Object.values(wards).map(w => w.souba?.['1K'] || w.souba?.['1R']).filter(Boolean);
  const minRent = soubaVals.length ? Math.min(...soubaVals) : 70000;
  const maxRent = soubaVals.length ? Math.max(...soubaVals) : 150000;
  const gradientHtml = `
    <div class="corr-gradient-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h4 style="margin:0;font:700 12px/1 ui-monospace,Menlo,monospace;letter-spacing:1px;color:var(--shu);text-transform:uppercase">
          ${esc(LANG.cur==='ja'?'沿線家賃グラデーション（都心部 → 郊外・神奈川方面）':'Corridor Rent Gradient (Tokyo Core → Kanagawa/Suburbs)')}
        </h4>
        <span style="font:600 11.5px/1 ui-monospace,Menlo,monospace;color:var(--muted)">1K Spread: ${man(minRent)} – ${man(maxRent)}</span>
      </div>
      <div class="corr-gradient-bar"></div>
      <div class="corr-gradient-labels">
        <span>${esc(stList[0]?.[LANG.cur==='ja'?'ja':'en'] || 'Core')} (${man(maxRent)})</span>
        <span>${esc(stList[Math.floor(stList.length/2)]?.[LANG.cur==='ja'?'ja':'en'] || 'Mid-Point')}</span>
        <span>${esc(stList[stList.length-1]?.[LANG.cur==='ja'?'ja':'en'] || 'Terminal')} (${man(minRent)})</span>
      </div>
    </div>`;

  const destName = tx(activeDests().find(d => d.id === state.dest) || DESTS[0]);

  return `
    <p class="kick">${esc(t('corr_kick'))}</p>
    <h1>${esc(LANG.cur==='ja'?curCorr.ja:curCorr.name + ' Corridor')}</h1>
    <p class="sub">${esc(LANG.cur==='ja'?curCorr.desc?.ja:curCorr.desc?.en)}</p>

    <!-- Multi-Corridor Switcher Cards -->
    <div class="corr-deck" role="region" aria-label="Corridor Switcher">
      ${deckCards}
    </div>

    <!-- Service Class Filters -->
    ${serviceChips}

    <div class="corridor">
      <div class="corrscroll"><svg viewBox="0 0 ${W} 260" width="${W}" height="260">${svg}</svg></div>
      <div class="legend">
        <i><b style="color:#7fd8ab">nn′</b> ${esc(t('med'))} → ${esc(destName)}</i>
        <i>◎ ${esc(t('corr_legend_exp'))}</i><i>· ${esc(t('corr_legend_loc'))}</i>
        <i style="color:var(--gold)">◯ ${esc(t('corr_legend_goal'))} (${goalMin}′)</i>
        <i>${esc(LANG.cur==='ja'?'色＝区の1K相場':'dot color = ward 1K market rate')}</i>
      </div>
    </div>

    ${snapDrawer}

    ${zonesHtml}

    ${gradientHtml}

    <div class="wrap2" style="margin-top:20px">
      <div class="panel"><h3>${esc(t('corr_deal'))}</h3>${tradePanel()}</div>
      <div class="panel"><h3>${esc(t('corr_anchors'))}</h3>${anchors.map(a =>
        `<p class="provrow"><span class="tierchip tc-${a.tier}">${a.tier}</span> ${esc(tx(a))} <em>· ${esc(a.src)}</em></p>`).join('')}
      </div>
    </div>`;
}

function tradePanel(){
  const rows = [];
  const stList = activeStations();
  const wards = activeWards();
  const goalMin = activeGoalMin();
  for (const s of stList){
    const c = calcCommute(s.id, state.dest);
    if (c.walkOnly) continue;
    const w = wards[s.ward] || (typeof WARDS !== 'undefined' && WARDS[s.ward]);
    if (!w) continue;
    const r = w.souba?.['1K'] ?? w.souba?.['1R']; if (r == null) continue;
    rows.push({ s, c, r, score: Math.abs(c.median - goalMin) });
  }
  rows.sort((a,b) => a.score - b.score || a.r - b.r);
  const destName = tx(activeDests().find(d=>d.id===state.dest) || DESTS[0]);
  return rows.slice(0, 5).map(({s,c,r}) => `
    <div class="srow"><span class="lab">${esc(LANG.cur==='ja'?s.ja:s.en)}</span>
    <b>${c.median}′ · 1K ${man(r)}</b></div>`).join('') +
    `<p class="provrow" style="margin-top:8px">${esc(LANG.cur==='ja'
      ? `目標${goalMin}分に最も近い5駅（→${destName}、1K相場付き）`
      : `the 5 stations closest to the ${goalMin}′ goal → ${destName}, with 1K market rate`)}</p>`;
}

/* ————— lines topology view (Round 2.5) ————— */
function bez(t){                       // shallow editorial arc, NW → SE
  const P0=[84,205], P1=[480,115], P2=[980,500];
  const u=1-t;
  return [u*u*P0[0]+2*u*t*P1[0]+t*t*P2[0], u*u*P0[1]+2*u*t*P1[1]+t*t*P2[1]];
}
function bezN(t){                      // unit normal pointing down/right (SE)
  const P0=[84,205], P1=[480,115], P2=[980,500];
  const dx=2*(1-t)*(P1[0]-P0[0])+2*t*(P2[0]-P1[0]);
  const dy=2*(1-t)*(P1[1]-P0[1])+2*t*(P2[1]-P1[1]);
  const L=Math.hypot(dx,dy)||1;
  return [-dy/L, dx/L];
}
function lineName(id){ const L=TOPO_LINES[id]; return LANG.cur==='ja' ? L.ja : L.en; }
function topoT(){                       // arc share ∝ connection richness (Kosmos LOD)
  const stList = activeStations();
  const w = stList.map(s => 1 + 0.55 * ((TOPO_CONN[s.id] || []).length) + (s.tier === 3 ? 0.4 : 0));
  const cum = [0]; for (const v of w) cum.push(cum[cum.length - 1] + v);
  const total = cum[cum.length - 1] - w[w.length - 1];
  return stList.map((_, i) => cum[i] / (total || 1));
}

function findStationForHub(hubText){
  if (!hubText) return null;
  const clean = hubText.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.includes('yokosuka')) return { id: 'yokosuka', en: 'Yokosuka', ja: '横須賀' };
  const allStns = (typeof activeStations === 'function') ? activeStations() : [];
  for (const s of allStns){
    if (clean.includes(s.id) || s.id.includes(clean)) return s;
    const enClean = s.en.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.includes(enClean) || enClean.includes(clean)) return s;
  }
  if (typeof CORRIDORS_DATA !== 'undefined'){
    for (const cid of Object.keys(CORRIDORS_DATA)){
      const corr = CORRIDORS_DATA[cid];
      if (!corr.stations) continue;
      for (const s of corr.stations){
        const enClean = s.en.toLowerCase().replace(/[^a-z]/g, '');
        if (clean.includes(s.id) || clean.includes(enClean)) return s;
      }
    }
  }
  return null;
}

function stCommute(stAId, stBId){
  const stList = activeStations();
  const a = stList.find(s => s.id === stAId);
  const b = stList.find(s => s.id === stBId);
  if (!a || !b) return { median: 20, direct: true };
  if (a.id === b.id) return { median: 0, direct: true, walkOnly: true };

  // If on Keikyu with pairTime available
  if ((state.corridor === 'keikyu' || !state.corridor) && typeof pairTime === 'function' && typeof S_IDX !== 'undefined' && S_IDX[a.id] !== undefined && S_IDX[b.id] !== undefined){
    const leg = pairTime(a, b);
    const median = Math.round((leg.mins + a.hw / 2) * 2) / 2;
    return { median, direct: leg.transfers === 0, transfers: leg.transfers };
  }

  // Fallback: estimate from station sequence
  const idxA = stList.findIndex(s => s.id === a.id);
  const idxB = stList.findIndex(s => s.id === b.id);
  if (idxA !== -1 && idxB !== -1){
    const stops = Math.abs(idxA - idxB);
    const mins = Math.max(2, Math.round(stops * 2.3));
    return { median: mins, direct: stops <= 12, transfers: stops <= 12 ? 0 : 1 };
  }
  return { median: 25, direct: false, transfers: 1 };
}

function linesView(){
  const curCorr = getActiveCorridor() || { id: 'keikyu', name: 'Keikyu', ja: '京急本線', color: 'var(--shu)' };
  const stList = activeStations();
  const brandColor = activeColor();
  const traced = state.topoLine;
  const grp = state.topoGroup;
  const selStation = state.topoSelectedStation;
  const TT = topoT();
  const pts = stList.map((s, i) => { const [x, y] = bez(TT[i]); return { s, i, tt: TT[i], x, y, imp: impact(s.id) }; });

  const dim = (on) => on ? 1 : (traced || selStation || grp !== 'all' ? 0.12 : 1);
  const touches = id => (TOPO_CONN[id] || []).some(c => c.l === traced);
  const spineOn = l => !traced || traced === l;

  let svg = '';
  const poly = (arr) => arr.map((p, k) => (k ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');

  // Draw main corridor arc
  if (state.corridor === 'keikyu' || !state.corridor){
    const jI = S_IDX['sengakuji'] ?? 7;
    svg += `<path d="${poly(pts.slice(0, jI + 1))}" fill="none" stroke="#e85298" stroke-width="4.5" stroke-linecap="round" opacity="${dim(spineOn('asakusa') && (grp === 'all' || grp === 'corridor'))}" />`;
    svg += `<path d="${poly(pts.slice(jI))}" fill="none" stroke="var(--shu)" stroke-width="4.5" stroke-linecap="round" opacity="${dim(spineOn('keikyu') && (grp === 'all' || grp === 'corridor'))}" />`;
  } else {
    svg += `<path d="${poly(pts)}" fill="none" stroke="${brandColor}" stroke-width="4.5" stroke-linecap="round" opacity="${dim(grp === 'all' || grp === 'corridor')}" />`;
  }

  // Active track highlight for selected station connecting along the corridor
  const selIdx = selStation ? pts.findIndex(p => p.s.id === selStation) : -1;
  if (selStation && selIdx !== -1) {
    const corridorHubs = pts.filter(p => Math.abs(p.i - selIdx) <= 2 || p.s.tier >= 2 || (TOPO_CONN[p.s.id] || []).length > 0);
    if (corridorHubs.length > 1) {
      corridorHubs.sort((a, b) => a.i - b.i);
      svg += `<path d="${poly(corridorHubs)}" fill="none" stroke="var(--gold)" stroke-width="6.5" stroke-linecap="round" opacity="0.95" filter="drop-shadow(0 0 10px rgba(235,178,74,0.9))" />`;
    }
  }

  // Connection rays: all fan into the lower-right half (Southeast) away from station labels
  pts.forEach(p => {
    const rawConns = TOPO_CONN[p.s.id] || [];
    const conns = rawConns.filter(c => {
      if (grp === 'all') return true;
      const L = TOPO_LINES[c.l];
      if (!L) return true;
      return L.group === grp || (L.group === 'spine' && grp === 'corridor');
    });
    if (!conns.length) return;

    const [nx, ny] = bezN(p.tt);
    const n = conns.length;
    const isSelStn = (selStation === p.s.id);

    conns.forEach((c, k) => {
      const L = TOPO_LINES[c.l] || { color: '#888', en: c.l, ja: c.l };
      const isTr = (c.l === traced) || isSelStn;
      const fanShift = (n >= 8 ? -1.0 : (n >= 5 ? -0.4 : 0));
      const fanSpread = (n >= 9 ? 0.17 : (n >= 6 ? 0.28 : 0.40));
      const fan = (k - (n - 1) / 2 + fanShift) * fanSpread;
      const dx = nx * Math.cos(fan) - ny * Math.sin(fan);
      const dy = ny * Math.cos(fan) + nx * Math.sin(fan);
      const baseLen = (n >= 8 ? 60 : (n > 3 ? 78 : 64));
      // Stagger radial length in 4 tiers so neighbor endpoints never collide
      const len = baseLen + (k % 4) * 32 + (p.i % 3) * 5 + (isSelStn ? 12 : 0);
      let ex = Math.min(1135, Math.max(25, p.x + dx * len));
      let ey = Math.min(660, Math.max(30, p.y + dy * len));

      let on = 1;
      if (selStation) {
        on = isSelStn ? 1 : 0.12;
      } else if (traced) {
        on = (c.l === traced) ? 1 : 0.12;
      } else if (grp !== 'all') {
        on = (grp === L.group || (grp === 'corridor' && (L.group === 'corridor' || L.group === 'spine'))) ? 1 : 0.14;
      } else {
        on = 0.85;
      }

      const dash = (L.dash || c.walk > 0) ? 'stroke-dasharray="2 5"' : '';
      // Show text label on the selected station or traced line
      const showName = isTr || (traced === c.l);
      const topHub = c.hubs && c.hubs.length ? c.hubs[0] : null;
      const hubStr = topHub ? ` (${tx(topHub)})` : (c.walk ? ` (${c.walk}′)` : '');
      const labelStr = lineName(c.l) + hubStr;

      const txPos = ex + dx * 8;
      const tyPos = ey + dy * 8 + 3;
      const clampedTx = Math.min(1135, Math.max(25, txPos));
      const clampedTy = Math.min(665, Math.max(25, tyPos));

      svg += `<g class="tray" data-tline="${c.l}" opacity="${on}" style="cursor:pointer" title="${esc(lineName(c.l))}">
        <line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${L.color}" stroke-width="${isTr ? 4.2 : 2.4}" ${dash}/>
        <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${isTr ? 5.5 : 4}" fill="${L.color}"/>
        ${showName ? `<text x="${clampedTx.toFixed(1)}" y="${clampedTy.toFixed(1)}" text-anchor="${dx > 0.2 ? 'start' : dx < -0.2 ? 'end' : 'middle'}" font-size="9.6" font-weight="750" fill="${L.color}">${esc(labelStr)}</text>` : ''}
      </g>`;
    });
  });

  // Station nodes on top: labels angled at -38deg on top side (Northwest)
  pts.forEach(p => {
    const rawConns = TOPO_CONN[p.s.id] || [];
    const isSel = (p.s.id === selStation);
    const sharesConnWithSel = selStation && rawConns.some(c => (TOPO_CONN[selStation] || []).some(sc => sc.l === c.l));
    const isNeighbor = selIdx !== -1 && (Math.abs(p.i - selIdx) === 1);

    let on = 1;
    if (selStation) {
      if (isSel) on = 1;
      else if (sharesConnWithSel || isNeighbor) on = 0.95;
      else if (p.s.tier >= 2 || rawConns.length > 0) on = 0.75;
      else on = 0.45;
    } else if (traced) {
      on = (touches(p.s.id) || (traced === 'asakusa' && p.s.sub) || (traced === 'keikyu' && !p.s.sub) || (traced === curCorr.id)) ? 1 : 0.18;
    } else if (grp !== 'all') {
      on = rawConns.some(c => TOPO_LINES[c.l]?.group === grp) ? 1 : 0.22;
    }

    const r = Math.min(13.5, 3.8 + p.imp * 1.15);
    const hot = isSel || (traced && on === 1 && touches(p.s.id));
    const isMajor = p.s.tier >= 2 || rawConns.length > 0;

    const lx = (p.x - 7).toFixed(1);
    const ly = (p.y - r - 7).toFixed(1);
    const showStationLabel = isSel || isMajor || (traced && (touches(p.s.id) || p.s.sub));

    svg += `<g class="tnode ${isSel ? 'selected active-dot' : ''}" data-tstation="${p.s.id}" tabindex="0" role="button" aria-label="${esc(p.s.en)}: ${rawConns.length} connections" opacity="${on}">
      <title>${esc(LANG.cur === 'ja' ? p.s.ja : p.s.en)}${p.s.num ? ` (${p.s.num})` : ''} · ${isSel ? (LANG.cur === 'ja' ? 'もう一度クリックで街詳細カードを開く' : 'Click again to open Dossier') : (LANG.cur === 'ja' ? `${rawConns.length} 接続路線 · クリックで接続探索` : `${rawConns.length} transfer lines · Click to explore`)}</title>
      ${isSel ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r + 10}" fill="none" stroke="var(--gold)" stroke-width="3.2" stroke-dasharray="4 2" class="pulse-ring"/>` : (hot ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r + 7}" fill="none" stroke="var(--gold)" stroke-width="2.2" stroke-dasharray="4 2"/>` : '')}
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r + 6}" fill="transparent"/>
      <circle class="main-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="${p.s.sub ? '#e85298' : brandColor}" stroke="var(--navy-ink)" stroke-width="${isSel ? 3.5 : (isMajor ? 2.4 : 1.2)}"/>
      ${showStationLabel ? `<text x="${lx}" y="${ly}" transform="rotate(-38 ${lx} ${ly})" text-anchor="end" font-size="${isSel ? '12.5' : (isMajor ? '11' : '9.5')}" font-weight="${isSel ? '850' : (isMajor ? '750' : '550')}" fill="${isSel ? 'var(--gold)' : (isMajor ? '#f0f6fc' : '#9aa6b7')}">${esc(LANG.cur === 'ja' ? p.s.ja : p.s.en)}</text>` : ''}
      ${(isSel || (isMajor && p.imp >= 6)) ? `<text x="${(p.x - 4).toFixed(1)}" y="${(p.y - r - 22).toFixed(1)}" transform="rotate(-38 ${(p.x - 4).toFixed(1)} ${(p.y - r - 22).toFixed(1)})" text-anchor="end" font-size="8.5" font-weight="700" fill="${isSel ? 'var(--gold)' : 'var(--navy-muted)'}">★ ${p.imp}</text>` : ''}
      ${isSel ? `<g class="tnode-callout callout-interactive" data-open-dossier="${p.s.id}" role="button" tabindex="0">
        <rect x="${(p.x - 68).toFixed(1)}" y="${(p.y + r + 14).toFixed(1)}" width="136" height="24" rx="12" fill="var(--gold)" stroke="#fff" stroke-width="1.5"/>
        <text x="${p.x.toFixed(1)}" y="${(p.y + r + 29).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="800" fill="var(--navy-ink)">${esc(LANG.cur === 'ja' ? '📖 詳細カードを開く ↗' : '📖 Open Area Dossier ↗')}</text>
      </g>` : ''}
    </g>`;
  });

  const lineOpts = Object.keys(TOPO_LINES)
    .map(id => ({
      id,
      n: stList.filter(s => (TOPO_CONN[s.id] || []).some(c => c.l === id)).length
    }))
    .filter(o => o.n > 0 || (curCorr.id === 'keikyu' && ['asakusa', 'keikyu', 'kkAirport', 'kkDaishi'].includes(o.id)))
    .sort((a, b) => b.n - a.n);

  const chips = TOPO_GROUPS.map(g => `<span class="tchip ${state.topoGroup === g.id && !traced && !selStation ? 'on' : ''}" data-tgroup="${g.id}">${esc(LANG.cur === 'ja' ? g.ja : g.en)}</span>`).join('');

  const quickHubs = stList.filter(s => s.tier >= 2 || (TOPO_CONN[s.id] || []).length >= 1);
  const quickHubsHtml = `
    <div class="topo-quick-stns" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:10px 0 14px">
      <span style="font:700 11px/1 ui-monospace,Menlo,monospace;letter-spacing:1px;color:var(--muted);text-transform:uppercase">
        ${esc(LANG.cur === 'ja' ? '駅カードを開く：' : 'Inspect Station:')}
      </span>
      ${quickHubs.map(s => `
        <button type="button" class="btn ${selStation === s.id ? 'btn-pri' : ''}" style="padding:4px 10px;font-size:12px;border-radius:99px" data-tstation="${s.id}">
          ${s.tier === 3 ? '◎ ' : '○ '}${esc(LANG.cur === 'ja' ? s.ja : s.en)}
        </button>
      `).join('')}
      ${selStation ? `<button type="button" class="btn ghost" style="padding:4px 10px;font-size:12px" data-tstation-clear="1">✕ ${esc(LANG.cur === 'ja' ? '解除' : 'Clear')}</button>` : ''}
    </div>`;

  let panel = '';
  if (selStation) {
    const s = stList.find(x => x.id === selStation) || (typeof S_IDX !== 'undefined' && STATIONS[S_IDX[selStation]]) || { id: selStation, en: selStation, ja: selStation, tier: 1 };
    const conns = TOPO_CONN[selStation] || [];
    const cm = calcCommute(s.id, state.dest);
    const wards = activeWards();
    const w = wards[s.ward] || (typeof WARDS !== 'undefined' && WARDS[s.ward]) || {};
    const r1k = w.souba ? (w.souba['1K'] || w.souba['1R']) : null;
    const destObj = activeDests().find(d => d.id === state.dest) || { id: state.dest, en: state.dest, ja: state.dest };

    const corridorDests = stList.filter(other => other.id !== s.id && (other.tier >= 2 || (TOPO_CONN[other.id] || []).length > 0 || other.id === stList[0].id || other.id === stList[stList.length - 1].id)).map(other => {
      const c = stCommute(s.id, other.id);
      return { st: other, cm: c };
    }).sort((a, b) => a.cm.median - b.cm.median);

    const corridorDestRows = corridorDests.map(d => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:8px;gap:8px">
        <div style="min-width:0;flex:1">
          <span style="font-weight:700;font-size:13px">${esc(LANG.cur === 'ja' ? d.st.ja : d.st.en)}</span>
          ${d.st.num ? `<small style="color:var(--muted);font-size:10px;margin-left:4px">(${d.st.num})</small>` : ''}
          <span style="font-size:11.5px;color:var(--gold);font-weight:700;margin-left:6px">${d.cm.median}′</span>
          ${d.cm.direct ? `<small style="color:var(--muted);font-size:10.5px"> ${esc(LANG.cur === 'ja' ? '直通' : 'direct')}</small>` : ''}
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button type="button" class="btn ghost" style="padding:3px 7px;font-size:11px" data-tstation="${d.st.id}" title="${esc(LANG.cur === 'ja' ? '路線図で選択' : 'Select on map')}">📍</button>
          <button type="button" class="btn" style="padding:3px 8px;font-size:11px;border-color:var(--gold);color:var(--gold)" data-open-dossier="${d.st.id}" title="${esc(LANG.cur === 'ja' ? `${d.st.ja}の街詳細カードを開く` : `Open ${d.st.en} Dossier`)}">📖 ${esc(LANG.cur === 'ja' ? '詳細' : 'Dossier')}</button>
        </div>
      </div>
    `).join('');

    const connRows = conns.length ? conns.map(c => {
      const L = TOPO_LINES[c.l] || { en: c.l, ja: c.l, color: 'var(--shu)', sig: { en: '', ja: '' } };
      const hubChips = (c.hubs || []).map(h => {
        const hText = tx(h);
        const matched = findStationForHub(hText);
        return `
          <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:99px;padding:2px 8px;font-size:11px">
            <b>${esc(hText)}</b>
            ${matched ? `<button type="button" class="btn ghost" style="padding:0 5px;font-size:10px;border-color:var(--gold);color:var(--gold);min-height:18px" data-open-dossier="${matched.id}" title="${esc(LANG.cur === 'ja' ? `${matched.ja}の街詳細カードを開く` : `Open ${matched.en} Dossier`)}">📖 ${esc(LANG.cur === 'ja' ? '詳細' : 'Dossier')}</button>` : ''}
          </span>`;
      }).join(' ');

      return `
        <div class="tracerow" style="align-items:center;gap:8px">
          <span class="lab" style="flex:1">
            <span class="linedot" style="background:${L.color}"></span>
            <b>${esc(LANG.cur === 'ja' ? L.ja : L.en)}</b>
            <small>${c.walk ? `${esc(t('lines_walk'))} ${c.walk}′ (${esc(LANG.cur === 'ja' ? '地上乗換' : 'out-of-station')})` : esc(LANG.cur === 'ja' ? '改札内・構内直結' : 'in-station concourse')}${c.via ? ` · via ${esc(tx(c.via))}` : ''}</small>
            ${c.hubs && c.hubs.length ? `<div style="margin-top:4px;display:flex;gap:5px;flex-wrap:wrap;align-items:center">
              <small style="color:var(--muted);font-weight:600">→ </small>
              ${hubChips}
            </div>` : ''}
          </span>
          <button type="button" class="btn" style="padding:4px 9px;font-size:11px" data-tline="${c.l}">${esc(LANG.cur === 'ja' ? '路線を追跡' : 'Trace Line')}</button>
        </div>`;
    }).join('') : `<p class="provrow" style="color:var(--muted)">${esc(LANG.cur === 'ja' ? 'この駅には直通・接続する他路線はありません（閑静な単独駅）。' : 'Quiet residential enclave — no complex interline transfers.')}</p>`;

    panel = `
      <div id="station-inspector" class="panel topo-inspector">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:10px">
          <div>
            <h3 style="margin:0;display:flex;align-items:center;gap:8px">
              <span>${s.tier === 3 ? '◎ ' : s.tier === 2 ? '○ ' : '· '}${esc(LANG.cur === 'ja' ? s.ja : s.en)}</span>
              ${s.num ? `<small style="color:var(--muted);font-weight:500">(${s.num})</small>` : ''}
              <span style="font-size:12px;font-weight:600;padding:2px 8px;border-radius:99px;background:rgba(235,178,74,.15);color:var(--gold);border:1px solid rgba(235,178,74,.4)">
                ${esc(LANG.cur === 'ja' ? '選択中の駅' : 'Selected Station')}
              </span>
            </h3>
            <p style="margin:4px 0 0;font-size:13px;color:var(--muted)">
              ${esc(w[LANG.cur === 'ja' ? 'ja' : 'en'] || s.ward || '')} · Impact <b>${impact(s.id)}</b> · 1K Market: <b>${man(r1k)}</b> · Commute to ${esc(tx(destObj))}: <b>${cm.median}′</b> (${cm.direct ? (LANG.cur === 'ja' ? '直通' : 'direct') : (LANG.cur === 'ja' ? '乗換あり' : 'transfer')})
            </p>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button type="button" class="btn btn-pri" style="padding:6px 14px;font-size:12.5px" data-open-dossier="${s.id}">
              ${esc(LANG.cur === 'ja' ? `📖 ${s.ja}の街詳細カードを開く →` : `📖 Open ${s.en} Dossier →`)}
            </button>
            <button type="button" class="btn ghost" style="padding:4px 8px;font-size:12px" data-tstation-clear="1" title="Clear selection">✕ ${esc(LANG.cur === 'ja' ? '閉じる' : 'Close')}</button>
          </div>
        </div>

        <div style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <h4 style="margin:0;font:700 11px/1 ui-monospace,Menlo,monospace;letter-spacing:1px;color:var(--shu);text-transform:uppercase">
              ${esc(LANG.cur === 'ja' ? '沿線の行き先・所要時間（この路線で直通）' : 'Places You Can Go on this Line (Direct)')}
            </h4>
            <small style="color:var(--muted);font-size:11px">${esc(LANG.cur === 'ja' ? '各駅の街詳細カードも閲覧可能' : 'Inspect or open dossier on any station')}</small>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px">
            ${corridorDestRows}
          </div>
        </div>

        <div style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-bottom:14px">
          <h4 style="margin:0 0 8px;font:700 11px/1 ui-monospace,Menlo,monospace;letter-spacing:1px;color:var(--shu);text-transform:uppercase">
            ${esc(LANG.cur === 'ja' ? '乗換・接続路線と主要行き先' : 'Transit Transfer Lines & Destination Hubs')} (${conns.length})
          </h4>
          ${connRows}
        </div>

        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:12px">
          <button type="button" class="btn btn-pri" style="padding:7px 16px;font-size:13px" data-open-dossier="${s.id}">
            ${esc(LANG.cur === 'ja' ? `📖 ${s.ja}の街詳細ファイルを開く →` : `📖 Open Full ${s.en} Area Dossier →`)}
          </button>
          <button type="button" class="btn" style="padding:7px 14px;font-size:12.5px" data-filter-stn="${s.id}">
            ${esc(LANG.cur === 'ja' ? '🏠 この駅の物件を見る →' : '🏠 See Homes Here →')}
          </button>
        </div>
      </div>`;
  } else if (traced) {
    const L = TOPO_LINES[traced] || { en: traced, ja: traced, color: 'var(--shu)', sig: { en: '', ja: '' } };
    const destObj = activeDests().find(d => d.id === state.dest) || { id: state.dest, en: state.dest, ja: state.dest };
    const rows = stList.filter(s => (TOPO_CONN[s.id] || []).some(c => c.l === traced)).map(s => {
      const c = (TOPO_CONN[s.id] || []).find(c => c.l === traced);
      const cm = calcCommute(s.id, state.dest);
      return `<div class="tracerow"><span class="lab"><b>${esc(LANG.cur === 'ja' ? s.ja : s.en)}</b>
        <small>${c.via ? `${esc(t('lines_via'))} ${esc(tx(c.via))} · ` : ''}${c.walk ? `${esc(t('lines_walk'))} ${c.walk}′` : esc(LANG.cur === 'ja' ? '駅構内' : 'in station')}${c.hubs && c.hubs.length ? ` · → ${esc(c.hubs.map(h => tx(h)).join(' · '))}` : ''}</small></span>
        <span class="num">${cm.walkOnly ? '·' : cm.median + '′'} <small style="color:var(--muted)">→ ${esc(tx(destObj))}</small><br><small style="color:var(--muted)">impact ${impact(s.id)}</small></span></div>`;
    }).join('');

    panel = `<div class="panel"><h3><span class="linedot" style="background:${L.color}"></span>${esc(t('lines_trace'))} — ${esc(lineName(traced))}</h3>
      <p class="provrow" style="margin:0 0 8px">${esc(tx(L.sig))}</p>${rows || `<p class="provrow">${esc(LANG.cur === 'ja' ? 'この路線は沿線の主要幹線そのもの — 全ての駅を結びます。' : 'this is the primary railway line — it connects every station along the corridor.')}</p>`}</div>`;
  } else {
    const top5 = pts.slice().sort((a, b) => b.imp - a.imp).slice(0, 5);
    panel = `
      <div class="panel topo-inspector-prompt">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:24px">📍</span>
          <div>
            <h3 style="margin:0 0 4px;font-size:15px;color:var(--ink)">
              ${esc(LANG.cur === 'ja' ? '駅カードを開いて乗換・詳細を探索' : 'Open Station Card for Inspection')}
            </h3>
            <p style="margin:0;font-size:13px;color:var(--muted)">
              ${esc(LANG.cur === 'ja' 
                ? '路線図の駅ドットをクリックするか、上の「主要駅」ボタンまたはメニューから駅を選択すると、全接続路線・所要時間・街ファイルが開きます。' 
                : 'Click any station dot on the line, or tap a hub button above, to inspect its direct transit connections, transfers, and open its area dossier.')}
            </p>
          </div>
        </div>
      </div>
      <div class="panel"><h3>${esc(t('lines_impact'))}</h3>${top5.map(p => {
        const n = (TOPO_CONN[p.s.id] || []).length;
        return `<div class="tracerow" style="cursor:pointer" data-tstation="${p.s.id}"><span class="lab"><b>${esc(LANG.cur === 'ja' ? p.s.ja : p.s.en)}</b>
          <small>${esc(LANG.cur === 'ja' ? `優等${p.s.tier} + 接続${n}` : `tier ${p.s.tier} + ${n} connection${n === 1 ? '' : 's'}`)} · ${esc(LANG.cur === 'ja' ? 'クリックでカードを開く' : 'click to inspect')}</small></span>
          <span class="num"><b>${p.imp}</b></span></div>`;
      }).join('')}
        <p class="provrow" style="margin-top:8px">${esc(LANG.cur === 'ja' ? 'インパクト＝優等階級＋接続の重み（構内1.0／徒歩0.6）。駅をクリックして乗換探索。' : 'impact = express tier + connection weights (in-station 1.0 / walk 0.6). Click any station dot to inspect.')}</p></div>`;
  }

  return `
  <p class="kick">${esc(t('lines_kick'))}</p>
  <h1>${esc(t('lines_h1'))} — ${esc(LANG.cur === 'ja' ? curCorr.ja : curCorr.name)}</h1>
  <p class="sub">${t('lines_sub')}</p>
  <div class="topochips">${chips}
    <div style="display:flex;gap:8px;margin-left:auto;flex-wrap:wrap;align-items:center">
      <select id="topostation" aria-label="${esc(LANG.cur === 'ja' ? '駅を選択して探索' : 'Select Station to Inspect')}">
        <option value="">${esc(LANG.cur === 'ja' ? '📍 駅を選択して探索...' : '📍 Select Station to Inspect...')}</option>
        ${stList.map(s => `<option value="${s.id}" ${selStation === s.id ? 'selected' : ''}>${s.tier === 3 ? '◎ ' : s.tier === 2 ? '○ ' : '· '}${esc(LANG.cur === 'ja' ? s.ja : s.en)}${s.num ? ` (${s.num})` : ''} — ${impact(s.id)} impact</option>`).join('')}
      </select>
      <select id="tline" aria-label="${esc(t('lines_pick'))}">
        <option value="">${esc(t('lines_pick'))}</option>
        ${lineOpts.map(o => `<option value="${o.id}" ${traced === o.id ? 'selected' : ''}>${esc(lineName(o.id))}${o.n ? ` · ${o.n} ${esc(t('lines_touch'))}` : ''}</option>`).join('')}
      </select>
    </div>
  </div>
  ${quickHubsHtml}
  <div class="topo"><svg viewBox="0 0 1160 680" role="img" aria-label="line topology">${svg}</svg>
    <div class="topocap">${esc(t('lines_caption'))}</div></div>
  <div class="wrap2" style="margin-top:20px">
    ${panel}
    <div class="panel"><h3>${esc(LANG.cur === 'ja' ? '読み方' : 'HOW TO READ IT')}</h3>
      <p class="provrow">${esc(LANG.cur === 'ja'
        ? '駅ドットをクリックすると、その駅の全乗換路線・ハブ先・所要時間をその場で探索できます（ポップアップで画面を塞ぎません）。街ファイルは探索パネルから開けます。'
        : 'Click any station dot to inspect its transit connections in-place without opening an intrusive modal. Click any ray to trace that line across the corridor. Open the deep area dossier from the inspector card when you wish.')}</p>
  </div>`;
}

/* ————— pockets: personality matching (Round 3) ————— */
function radar7(p, u, touched, size){
  const S = size || 100, cx = S/2, cy = S/2, r = S*0.40;
  const pt = (i, v) => {
    const a = (-90 + i*360/AXES.length) * Math.PI/180;
    return [cx + Math.cos(a)*r*(v/5), cy + Math.sin(a)*r*(v/5)];
  };
  const ring = f => AXES.map((_,i)=>pt(i,f*5).map(n=>n.toFixed(1)).join(',')).join(' ');
  const poly = AXES.map((a,i)=>pt(i, p.ax[a.id]).map(n=>n.toFixed(1)).join(',')).join(' ');
  let me = '';
  if (u && touched && touched.size){
    const upoly = AXES.map((a,i)=>pt(i, u[a.id] ?? 2.5).map(n=>n.toFixed(1)).join(',')).join(' ');
    me = `<polygon points="${upoly}" fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="4 3" opacity=".75"/>`;
  }
  return `<svg class="radar7" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img" aria-label="personality profile">
    <polygon points="${ring(1)}" fill="none" stroke="var(--line)" stroke-width="1"/>
    <polygon points="${ring(.5)}" fill="none" stroke="var(--line)" stroke-width="1" opacity=".6"/>
    <polygon points="${poly}" fill="var(--shu)" opacity=".30" stroke="var(--shu)" stroke-width="1.8"/>
    ${me}</svg>`;
}
function pocketGates(p){
  const c = pocketCommute(p, state.dest);
  const timeOk = c.median <= state.pkMax;
  const wards = activeWards();
  const w = wards[p.ward] || (typeof WARDS !== 'undefined' && WARDS[p.ward]) || {};
  const souba = w.souba ? w.souba[state.pkLayout] : null;
  const budgetOk = !state.pkBudget || souba == null || souba <= state.pkBudget;
  return { c, timeOk, souba, budgetOk, ok: timeOk && budgetOk };
}
function pkTouched(){ return state.pk ? state.pk.touched : new Set(); }
function pocketsView(){
  const pk = state.pk;
  const asking = pk && !pk.done && !pk.skipped;
  let head = `
  <p class="kick">${esc(t('pk_kick'))}</p>
  <h1>${esc(t('pk_h1'))}</h1>
  <p class="sub">${esc(t('pk_sub'))}</p>
  <div class="pkbar">
    <label>${esc(t('pk_gate'))}</label><input type="number" id="pkmax" min="10" max="90" step="5" value="${state.pkMax}"> <span style="color:var(--muted);font-size:13px">${esc(t('mins'))} → ${esc(tx(DESTS.find(d=>d.id===state.dest)))}</span>
    <label>${esc(t('pk_budget'))}</label>
    <select id="pklayout">${['1R','1K','1DK','1LDK','2LDK'].map(v=>`<option ${state.pkLayout===v?'selected':''}>${v}</option>`).join('')}</select>
    <select id="pkbudget">
      <option value="0" ${!state.pkBudget?'selected':''}>${esc(LANG.cur==='ja'?'上限なし':'no cap')}</option>
      ${[100000,150000,200000,300000].map(v=>`<option value="${v}" ${state.pkBudget===v?'selected':''}>≤ ${man(v)}</option>`).join('')}
    </select>
    <span style="margin-left:auto">${pk&&(pk.done||pk.skipped)?`<span class="mini" data-pkredo="1">${esc(t('pk_redo'))}</span>`:''}</span>
  </div>`;

  if (asking){
    const q = PQ[pk.i];
    return head + `<div class="pkq">
      <p class="kick" style="color:var(--muted)">${pk.i+1} / ${PQ.length} · ${pk.touched.size} ${esc(t('pk_touched'))}</p>
      <h2>${esc(tx(q.q))}</h2>
      <div class="opts">
        <span class="pkopt" data-pq="a">${esc(tx(q.a.t))}</span>
        <span class="pkopt" data-pq="b">${esc(tx(q.b.t))}</span>
      </div>
      <p class="provrow" style="margin-top:14px"><span class="mini" data-pkskip="1">${esc(t('pk_skip'))}</span></p>
    </div>`;
  }

  const touched = pkTouched();
  const pList = activePockets();
  const rows = pList.filter(p => qMatch('pocket', p).ok).map(p => {
    const g = pocketGates(p);
    const fit = pk && pk.done ? pocketFit(p, pk.u, touched) : null;
    return { p, g, fit };
  });
  rows.sort((a,b) => (b.g.ok-a.g.ok) || ((b.fit??-1)-(a.fit??-1)) || (a.g.c.median-b.g.c.median));

  const cards = rows.map(({p,g,fit}) => {
    const st = activeStations().find(s => s.id === p.st) || (typeof S_IDX !== 'undefined' && STATIONS[S_IDX[p.st]]) || { en:p.st, ja:p.st };
    return `<button class="pcard ${g.ok?'':'ineligible'}" data-pocket="${p.id}" aria-label="${esc(tx(p.name))}">
      <div class="ptop">${radar7(p, pk&&pk.done?pk.u:null, touched, 92)}
        <div><h3>${esc(tx(p.name))}<small>${esc(ty(p.name)||'')} · ${esc(LANG.cur==='ja'?st.ja:st.en)}</small></h3></div>
        <span class="fitbadge ${fit==null?'na':''}">${fit==null?'—':fit+'%'}</span>
      </div>
      ${pocketEssStrip(p, 'card')}
      <p class="pgem">${esc(tx(p.gem))}</p>
      <div class="pmeta">
        ${p.off?`<span class="badge b-en">${esc(t('pk_gem'))}</span>`:''}
        <span class="badge ${g.timeOk?'b-direct':'b-transfer'}">≈${g.c.median}′ ${g.timeOk?'✓':`+${r5(g.c.median-state.pkMax)}′ ${esc(t('pk_over_time'))}`}</span>
        <span class="badge ${g.budgetOk?'b-rep':'b-transfer'}">${state.pkLayout} ${g.souba!=null?man(g.souba):'—'}${g.budgetOk?'':' · '+esc(t('pk_over_budget'))}</span>
        ${(p.noiseWatch||noiseSummary(p.st))?`<span class="badge b-transfer" title="${esc(tx(p.noiseWatch||noiseSummary(p.st)))}">⚠ ${esc(t('noise_chip'))}</span>`:''}
        ${p.off?`<span class="badge b-rep">${esc(tx(p.how))}</span>`:''}
      </div>
      ${matchLine(qMatch('pocket', p).reasons)}
    </button>`;
  }).join('');

  const intro = (!pk) ? `<p class="note" style="margin-bottom:14px"><span class="cta" data-pkstart="1">${esc(t('pk_start'))}</span></p>` : '';
  return head + intro + `<div class="pkgrid">${cards}</div>
  <p class="note" style="margin-top:14px">${esc(t('pk_verify'))} · ${esc(tx(SOUBA_NOTE))}</p>`;
}
function pkAnswer(which){
  const pk = state.pk; if (!pk || pk.done) return;
  const q = PQ[pk.i]; const opt = which==='a' ? q.a : q.b;
  const dt = performance.now() - pk.shownAt;
  const w = dt < 3000 ? 1 : dt < 9000 ? 0.75 : 0.5;
  for (const [k, d] of Object.entries(opt.d)){
    pk.u[k] = Math.max(0, Math.min(5, (pk.u[k] ?? 2.5) + d * w * 0.9));
    pk.touched.add(k);
  }
  pk.i++;
  if (pk.i >= PQ.length) pk.done = true;
  pk.shownAt = performance.now();
  render();
}
function openPocket(id){
  const pList = getAllCorridorPockets();
  const p = pList.find(x=>x.id===id) || activePockets().find(x=>x.id===id);
  if (!p) return;
  const st = getAllCorridorStations().find(s => s.id === p.st) || activeStations().find(s => s.id === p.st) || { en:p.st, ja:p.st };
  const wards = activeWards();
  const pWard = wards[p.ward] || (typeof WARDS !== 'undefined' && WARDS[p.ward]) || { en:p.ward, ja:p.ward };
  const pk = state.pk; const touched = pkTouched();
  const g = pocketGates(p);
  const fit = pk && pk.done ? pocketFit(p, pk.u, touched) : null;
  const bars = AXES.map(a => {
    const v = p.ax[a.id];
    const uv = pk && pk.done && touched.has(a.id) ? (pk.u[a.id] ?? 2.5) : null;
    return `<div class="axbar"><span class="nm">${esc(LANG.cur==='ja'?a.ja:a.en)}</span>
      <span class="axtrack"><span class="axfill" style="width:${v/5*100}%"></span>
      ${uv!=null?`<span class="axme" style="left:calc(${uv/5*100}% - 1px)"></span>`:''}</span></div>`;
  }).join('');
  let why = '';
  if (fit != null){
    const ds = AXES.filter(a=>touched.has(a.id)).map(a=>({a, d: Math.abs((pk.u[a.id]??2.5)-p.ax[a.id])})).sort((x,y)=>x.d-y.d);
    const good = ds.slice(0,3).map(x=>esc(LANG.cur==='ja'?x.a.ja:x.a.en)).join(' · ');
    const worst = ds[ds.length-1];
    why = `<div class="sect"><h3>${esc(t('pk_why'))} — ${fit}%</h3>
      <p style="margin:0;font-size:13.5px">✓ ${good}${worst && worst.d>2 ? ` · <span style="color:var(--warn)">△ ${esc(LANG.cur==='ja'?worst.a.ja:worst.a.en)}</span>`:''}</p></div>`;
  }
  const destObj = activeDests().find(d=>d.id===state.dest) || DESTS[0];
  $('#overlay').innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(tx(p.name))}">
    <h2>${esc(tx(p.name))} ${fit!=null?`<span class="fitbadge">${fit}%</span>`:''}</h2>
    <p class="jah">${esc(ty(p.name)||'')} · ${esc(LANG.cur==='ja'?st.ja:st.en)} · ${esc(tx(pWard))}${p.off?` · <b style="color:var(--shu)">${esc(t('pk_off'))}</b>`:''}</p>
    ${pocketEssStrip(p, true)}
    <p style="margin:4px 0 14px">${esc(tx(p.gem))}</p>
    ${(p.noiseWatch||noiseSummary(p.st))?`<p class="note" style="color:var(--warn);margin:0 0 12px">⚠ ${esc(tx(p.noiseWatch||noiseSummary(p.st)))}${p.noiseSrc?`<br><small style="color:var(--muted);display:block;margin-top:3px">${esc(LANG.cur==='ja'?'出典：':'Source: ')}${esc(p.noiseSrc)}</small>`:''}</p>`:''}
    ${p.photoOp?`<p class="note" style="margin:0 0 12px">📷 <b>${esc(LANG.cur==='ja'?'映え':'Photo ops')}:</b> ${esc(tx(p.photoOp))} · <small>${esc(t('golden_label'))} ${goldenHour().start}–${goldenHour().end} <i class="tierchip tc-P">P</i></small></p>`:''}
    ${(()=>{const aa=areaFor(p.st); let out='';
      if (!aa) return '';
      if (aa.people) out += `<p class="note" style="margin:0 0 8px">👥 ${aa.people.foreign?`<b>${esc(LANG.cur==='ja'?'外国人比率':'foreign residents')} ${esc(aa.people.foreign)}</b> · `:''}${esc(tx(aa.people))} <i class="tierchip tc-E">E</i></p>`;
      if (aa.grocerPlus) out += `<p class="note" style="margin:0 0 8px">🧺 <b>${esc(LANG.cur==='ja'?(aa.grocerPlus.ja||aa.grocerPlus.v):aa.grocerPlus.v)}</b> <small>${esc(t('grocer_note'))}</small></p>`;
      if (aa.senses) out += `<p class="note" style="margin:0 0 12px">👃 ${senseHtml(aa.senses)}</p>`;
      return out;})()}
    ${why}
    <div class="sect"><h3>${esc(LANG.cur==='ja'?'性格の輪郭':'THE PROFILE')} <small style="text-transform:none;letter-spacing:0;color:var(--muted)">· ${esc(t('pk_axes_note'))}</small></h3>${bars}</div>
    <div class="sect"><h3>${esc(t('sheet_commute'))}</h3>
      <div class="srow"><span class="lab">→ ${esc(tx(destObj))}</span><b>≈${g.c.median}′ · p90 ${g.c.p90}′ · <span class="badge ${g.timeOk?'b-direct':'b-transfer'}">${g.timeOk?esc(t('pk_ok')):esc(t('pk_over_time'))}</span></b></div>
      ${p.off?`<p class="provrow" style="margin-top:6px">${esc(t('pk_access'))}: ${esc(tx(p.how))}</p>`:''}
      <p class="provrow" style="margin-top:4px">${esc(t('pk_souba_at'))} ${state.pkLayout}: ${g.souba!=null?yen(g.souba):'—'} · ${esc(tx(SOUBA_NOTE))}</p>
    </div>
    ${(() => {
      const pHomes = getAllCorridorHomes().filter(h => {
        const pkt = pocketForListing(h);
        return pkt && pkt.id === p.id;
      });
      if (pHomes.length === 0) return '';
      return `<div class="sect">
        <h3>${esc(LANG.cur==='ja'?'この街角の掲載物件':'Homes in this Pocket')} (${pHomes.length})</h3>
        <div class="pocket-homes-row">
          ${pHomes.slice(0, 12).map(h => `
            <div class="pocket-home-chip" data-case="${h.id}">
              <b title="${esc(tx(h.name))}">${esc(tx(h.name))}</b>
              <span style="font-weight:700;color:var(--shu)">${yen(h.rent)}</span>
              <span>${esc(h.layout)}${h.m2 ? ' · ' + h.m2 + 'm²' : ''}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
    })()}
    <div class="sheetacts">
      <span class="cta" data-homesat="${p.st}">${esc(t('pk_seehomes'))} →</span>
      <span class="cta ghost" data-area="${p.st}">${esc(t('area_btn'))}: ${esc(LANG.cur==='ja'?st.ja:st.en)}</span>
      <span class="cta ghost" data-close="1">${esc(t('close'))}</span>
    <p class="provrow" style="margin-top:10px">${esc(t('pk_verify'))}</p>
  </div>`;
  $('#overlay').hidden = false; kickVideos();
}

/* ————— taste vector plumbing ————— */
function goalBucket(gd){ return gd <= 0 ? 'under' : gd <= 6 ? 'near' : 'over'; }
function bandFor(l){
  const st = activeStations().find(s => s.id === l.st) || (typeof S_IDX !== 'undefined' && STATIONS[S_IDX[l.st]]) || { ward:'' };
  const wards = activeWards();
  const w = wards[st.ward] || (typeof WARDS !== 'undefined' && WARDS[st.ward]);
  if (!w || !w.souba || !l.rent) return 'at';
  const bench = w.souba[layoutClass(l)];
  if (!bench) return 'at';
  const d = (l.rent - bench)/bench;
  return d < -0.07 ? 'under' : d > 0.07 ? 'over' : 'at';
}
function dimsFor(l){
  const st = activeStations().find(s => s.id === l.st) || (typeof S_IDX !== 'undefined' && STATIONS[S_IDX[l.st]]) || { ward:'' };
  const c = calcCommute(l.st, state.dest);
  const q = (typeof AREA_ST !== 'undefined' && AREA_ST[l.st] && AREA_ST[l.st].quiet && AREA_ST[l.st].quiet.v) || 3;
  return ['lay:'+layoutClass(l), 'ward:'+st.ward, 'band:'+bandFor(l),
          'goal:'+goalBucket(c.median-activeGoalMin()), 'quiet:'+(q>=4?'quiet':q<=2?'lively':'mid')];
}
function dimLabel(d){
  const [k,v] = d.split(':');
  if (k==='lay') return v;
  if (k==='ward') {
    const w = activeWards()[v] || (typeof WARDS !== 'undefined' && WARDS[v]) || { en:v, ja:v };
    return tx(w);
  }
  if (k==='band') return {under:LANG.cur==='ja'?'相場より安い':'under market', at:LANG.cur==='ja'?'相場並み':'at market', over:LANG.cur==='ja'?'相場より高い':'over market'}[v];
  if (k==='goal') return {under:t('goal_under'), near:t('goal_near'), over:t('goal_over')}[v];
  if (k==='quiet') return {quiet:LANG.cur==='ja'?'静かな街':'quiet streets', mid:LANG.cur==='ja'?'ふつうの街':'average streets', lively:LANG.cur==='ja'?'にぎやかな街':'lively streets'}[v];
  return d;
}
function tasteScore(l){
  if (!state.taste) return 0;
  let sc = 0;
  for (const d of dimsFor(l)) sc += state.taste[d] || 0;
  return sc;
}

/* ————— homes view ————— */
function filteredHomes(){
  const allHomes = activeHomes();
  const goalMin = activeGoalMin();
  let hs = allHomes.filter(l => {
    if (state.fStation!=='all' && l.st!==state.fStation) return false;
    if (state.fPocket!=='all' && pocketForListing(l)?.id!==state.fPocket) return false;
    if (state.fLayout!=='all' && layoutClass(l)!==state.fLayout) return false;
    if (state.fTier!=='all') {
      if (state.fTier==='LIVE' && (l.status==='FILLED' || l.tier!=='LIVE')) return false;
      if (state.fTier==='FILLED' && l.status!=='FILLED') return false;
      if (state.fTier==='REP' && l.tier!=='REP' && l.status!=='FILLED') return false;
      if (state.fTier==='LUXURY' && !(l.rent>=300000)) return false;
    }
    if (state.fQuick==='live' && (l.status==='FILLED' || l.tier!=='LIVE')) return false;
    if (state.fQuick==='filled' && l.status!=='FILLED') return false;
    if (state.fQuick==='luxury' && !(l.rent>=300000)) return false;
    if (state.fQuick==='goal'){
      const med = calcCommute(l.st, state.dest).median;
      const ok = (goalMin <= 30) ? Math.abs(med - goalMin) <= 5 : med <= goalMin;
      if (!ok) return false;
    }
    if (state.fQuick==='direct' && !calcCommute(l.st, state.dest).direct) return false;
    if (state.fQuick==='under100k' && !(l.rent <= 100000)) return false;
    if (state.fQuick==='family' && !((l.layout||'').includes('2') || (l.layout||'').includes('3'))) return false;
    return qMatch('listing', l).ok;
  });

  let isCrossMatch = false;
  if (hs.length === 0 && (state.q || '').trim() && state.corridor !== 'all') {
    const cross = getAllCorridorHomes().filter(l => qMatch('listing', l).ok);
    if (cross.length > 0) {
      hs = cross;
      isCrossMatch = true;
    }
  }

  const key = l => Math.abs(calcCommute(l.st, state.dest).median - goalMin);
  if (state.sort==='rent') hs.sort((a,b) => (a.rent||9e9)-(b.rent||9e9));
  else if (state.sort==='size') hs.sort((a,b) => (b.m2||0)-(a.m2||0));
  else if (state.sort==='radio' && state.taste) hs.sort((a,b) => tasteScore(b)-tasteScore(a));
  else if (state.sort==='pocket') {
    hs.sort((a,b) => {
      const pa = (pocketForListing(a)?.name?.[LANG.cur==='ja'?'ja':'en'] || '');
      const pb = (pocketForListing(b)?.name?.[LANG.cur==='ja'?'ja':'en'] || '');
      return pa.localeCompare(pb);
    });
  }
  else hs.sort((a,b) => key(a)-key(b));
  // stand-ins never outrank the real thing (the editorial-sorts-last rule)
  const res = hs.filter(l=>l.tier==='LIVE').concat(hs.filter(l=>l.tier!=='LIVE'));
  if (isCrossMatch) res._crossMatch = true;
  return res;
}
function layoutOptions(){
  const allHomes = activeHomes();
  const set = [...new Set(allHomes.map(layoutClass))];
  const order = ['1R','1K','1DK','1LDK','1SLDK','2K','2DK','2LDK','3DK','3LDK'];
  return set.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
}
function homesView(){
  const hs = filteredHomes();
  const allHomes = activeHomes();
  const stList = activeStations();
  const goalMin = activeGoalMin();
  const nLive = allHomes.filter(l => l.status !== 'FILLED' && l.tier === 'LIVE').length;
  const nFilled = allHomes.filter(l => l.status === 'FILLED' || l.tier === 'REP').length;
  const nRep = nFilled;
  const nLuxury = allHomes.filter(l=>l.rent>=300000).length;
  const nGoal = allHomes.filter(l => {
    const med = calcCommute(l.st, state.dest).median;
    return (goalMin <= 30) ? Math.abs(med - goalMin) <= 5 : med <= goalMin;
  }).length;
  const nDirect = allHomes.filter(l => calcCommute(l.st, state.dest).direct).length;
  const nUnder100 = allHomes.filter(l => l.rent <= 100000).length;
  const nFamily = allHomes.filter(l => (l.layout||'').includes('2') || (l.layout||'').includes('3')).length;

  const stCounts = {};
  allHomes.forEach(h => { stCounts[h.st] = (stCounts[h.st] || 0) + 1; });
  const stationsWithHomes = Object.keys(stCounts).length;

  const rents = allHomes.map(l=>l.rent).filter(Boolean).sort((a,b)=>a-b);
  const minRent = rents.length ? rents[0] : 0;
  const maxRent = rents.length ? rents[rents.length - 1] : 0;
  const medRent = rents.length ? rents[Math.floor(rents.length/2)] : 0;

  const ribbonNodes = stList.map(s => {
    const count = stCounts[s.id] || 0;
    const isCur = state.fStation === s.id;
    return `<div class="ribbon-st ${isCur?'on':''}" data-stfilter="${s.id}" title="${esc(s.en)} (${esc(s.ja)}): ${count} ${esc(t('n_homes'))}">
      <div class="ribbon-dot ${s.tier>1?'exp':''} ${count>0?'has-homes':''}"></div>
      <div class="ribbon-name">${esc(LANG.cur==='ja'?s.ja:s.en)}</div>
      <div class="ribbon-count ${count===0?'zero':''}">${count}</div>
    </div>`;
  }).join('');

  return `
  <p class="kick">${esc(t('homes_kick'))}</p>
  <h1>${esc(t('homes_h1'))}</h1>
  <p class="sub">${esc(t('homes_sub'))}</p>

  <!-- Preattentive Scope Deck -->
  <div class="scope-deck" aria-label="Corridor Scope Summary">
    <div class="scope-card">
      <div class="label">${esc(LANG.cur==='ja'?'全掲載物件数':'Total Inventory')}</div>
      <div class="num">${allHomes.length}</div>
      <div class="subtxt"><b>${nLive}</b> ${esc(t('live_badge'))} · ${nRep} ${esc(t('rep_badge'))}</div>
    </div>
    <div class="scope-card">
      <div class="label">${esc(LANG.cur==='ja'?'賃料相場帯':'Rent Spread')}</div>
      <div class="num">${man(medRent)}</div>
      <div class="subtxt">${yen(minRent)} – ${yen(maxRent)} (${esc(LANG.cur==='ja'?'中央値':'median')})</div>
    </div>
    <div class="scope-card">
      <div class="label">${esc(LANG.cur==='ja'?'路線カバー数':'Stations Covered')}</div>
      <div class="num">${stationsWithHomes}<small style="font-size:18px;color:var(--muted)">/${stList.length}</small></div>
      <div class="subtxt"><b>${nDirect}</b> ${esc(LANG.cur==='ja'?'直通運転':'direct to desk')}</div>
    </div>
    <div class="scope-card">
      <div class="label">${esc(LANG.cur==='ja'?'目標通勤適合':'Within ±5′ of Goal')}</div>
      <div class="num"><b>${nGoal}</b></div>
      <div class="subtxt"><b>${nLuxury}</b> ${esc(t('tier_luxury'))}</div>
    </div>
  </div>

  <!-- Preattentive Corridor Transit Ribbon -->
  <div class="ribbon-wrap" aria-label="Corridor Station Distribution">
    <div class="ribbon-head">
      <span class="ribbon-title">${esc(LANG.cur==='ja'?'沿線分布 · 駅をクリックで絞り込み':'Corridor Distribution · Click station to filter')}</span>
      <span class="ribbon-hint">${state.fStation==='all'?esc(LANG.cur==='ja'?'全駅表示中':'Showing all stations'):`Filtered: <b>${esc(stList.find(s=>s.id===state.fStation)?.[LANG.cur==='ja'?'ja':'en']||state.fStation)}</b> (${stCounts[state.fStation]||0})`}</span>
    </div>
    <div class="corridor-ribbon">
      <div class="ribbon-track"></div>
      ${ribbonNodes}
    </div>
  </div>

  <!-- Preattentive Quick-Filter Chips -->
  <div class="quick-chips" role="group" aria-label="Quick filters">
    <button class="quick-chip ${state.fQuick==='all' && state.fTier==='all'?'on':''}" data-qfilter="all">
      ${esc(LANG.cur==='ja'?'すべて':'All')} <span class="q-count">${allHomes.length}</span>
    </button>
    <button class="quick-chip ${state.fQuick==='live' || state.fTier==='LIVE'?'on':''}" data-qfilter="live">
      🟢 ${esc(t('tier_live'))} <span class="q-count">${nLive}</span>
    </button>
    <button class="quick-chip ${state.fQuick==='filled' || state.fTier==='FILLED'?'on':''}" data-qfilter="filled">
      ⚪ ${esc(LANG.cur==='ja'?'成約参考':'Leased Ref')} <span class="q-count">${nFilled}</span>
    </button>
    <button class="quick-chip luxury-chip ${state.fQuick==='luxury' || state.fTier==='LUXURY'?'on':''}" data-qfilter="luxury">
      ✨ ${esc(t('tier_luxury'))} <span class="q-count">${nLuxury}</span>
    </button>
    <button class="quick-chip ${state.fQuick==='goal'?'on':''}" data-qfilter="goal">
      ⏱️ ${esc(LANG.cur==='ja' ? (goalMin <= 30 ? `目標圏 ±5分 (${goalMin}′)` : `上限 ${goalMin}分内`) : (goalMin <= 30 ? `Within ±5′ Goal (${goalMin}′)` : `Within ${goalMin}′ Limit`))} <span class="q-count">${nGoal}</span>
    </button>
    <button class="quick-chip ${state.fQuick==='direct'?'on':''}" data-qfilter="direct">
      🚅 ${esc(t('direct'))} <span class="q-count">${nDirect}</span>
    </button>
    <button class="quick-chip ${state.fQuick==='under100k'?'on':''}" data-qfilter="under100k">
      ≤ ¥100k <span class="q-count">${nUnder100}</span>
    </button>
    <button class="quick-chip ${state.fQuick==='family'?'on':''}" data-qfilter="family">
      2LDK+ ${esc(LANG.cur==='ja'?'ファミリー':'Family')} <span class="q-count">${nFamily}</span>
    </button>
    ${(state.fStation!=='all' || state.fPocket!=='all' || state.fLayout!=='all' || state.fTier!=='all' || state.fQuick!=='all' || state.sort!=='goal') ?
      `<button class="quick-chip" data-qfilter="clear" style="margin-left:auto;color:var(--shu);border-color:var(--shu)">
        ✕ ${esc(LANG.cur==='ja'?'リセット':'Clear filters')}
      </button>` : ''}
  </div>

  <!-- Detailed Dropdowns Bar -->
  <div class="bar">
    <select id="fstation" aria-label="${esc(t('f_station'))}">
      <option value="all">${esc(t('f_station'))}: ${esc(t('f_all'))} (${allHomes.length})</option>
      ${stList.map(s=>{
        const cnt = stCounts[s.id] || 0;
        return `<option value="${s.id}" ${state.fStation===s.id?'selected':''}>${esc(LANG.cur==='ja'?s.ja:s.en)} (${cnt})</option>`;
      }).join('')}
    </select>
    <select id="fpocket" aria-label="Pocket">
      <option value="all">${esc(LANG.cur==='ja'?'街角: 全て':'Pocket: All')} (${activePockets().length})</option>
      ${activePockets().map(p => `<option value="${p.id}" ${state.fPocket===p.id?'selected':''}>🏮 ${esc(LANG.cur==='ja'?p.name.ja:p.name.en)}</option>`).join('')}
    </select>
    <select id="flayout" aria-label="${esc(t('f_layout'))}">
      <option value="all">${esc(t('f_layout'))}: ${esc(t('f_all'))}</option>
      ${layoutOptions().map(v=>`<option ${state.fLayout===v?'selected':''}>${v}</option>`).join('')}
    </select>
    <select id="ftier" aria-label="${esc(t('f_tier'))}">
      <option value="all">${esc(t('f_tier'))}: ${esc(t('f_all'))}</option>
      <option value="LIVE" ${state.fTier==='LIVE'?'selected':''}>${esc(t('tier_live'))}</option>
      <option value="FILLED" ${state.fTier==='FILLED'?'selected':''}>${esc(LANG.cur==='ja'?'⚪ 成約参考のみ':'⚪ Leased Reference only')}</option>
      <option value="LUXURY" ${state.fTier==='LUXURY'?'selected':''}>${esc(t('tier_luxury'))}</option>
    </select>
    <select id="fsort" aria-label="${esc(t('f_sort'))}">
      ${[['goal',t('sort_goal')],['rent',t('sort_rent')],['size',t('sort_size')],['pocket',LANG.cur==='ja'?'街角順':'By Pocket']]
        .concat(state.taste?[['radio',t('sort_radio')]]:[])
        .map(([v,lab])=>`<option value="${v}" ${state.sort===v?'selected':''}>${esc(t('f_sort'))}: ${esc(lab)}</option>`).join('')}
    </select>
    <span class="count">${hs.length} ${esc(t('n_homes'))}</span>
  </div>
  ${hs._crossMatch ? `
    <div class="cross-match-banner">
      <div>
        🌐 <b>${esc(LANG.cur==='ja'?'他路線で見つかった物件':'Found in Another Living Corridor')}:</b>
        ${esc(LANG.cur==='ja'?'現在選択中の路線外ですが、検索条件に一致した物件を表示しています。':'This listing matches your search in another living corridor.')}
      </div>
      <button type="button" class="quick-chip on" data-corridor-switch="all" style="font-size:12px;padding:4px 10px;cursor:pointer">
        ${esc(LANG.cur==='ja'?'全路線を表示する':'Switch to All Corridors')} →
      </button>
    </div>` : ''}
  <p class="note"><b>${hs.length}</b> ${esc(t('n_homes'))} ${state.fStation!=='all'||state.fPocket!=='all'||state.fQuick!=='all'||state.fTier!=='all'?'matching filter':'across corridor'} · ${nLive} <b>LIVE</b> · ${nRep} REP · ${esc(LANG.cur==='ja'?'取得':'fetched')} ${FETCHED}</p>
  <div class="grid">${hs.map(card).join('')}</div>`;
}
function rentLine(l){
  let s = `<span class="rentline">${yen(l.rent)}`;
  if (l.rentMax) s += `<small>–${yen(l.rentMax)}</small>`;
  s += `<small>${esc(t('rent_mo'))}${l.mgmt?` +${man(l.mgmt)} ${esc(t('mgmt'))}`:''}</small></span>`;
  return s;
}
function card(l){
  const st = activeStations().find(s => s.id === l.st) || (typeof S_IDX !== 'undefined' && STATIONS[S_IDX[l.st]]) || { en:l.st, ja:l.st, num:'' };
  const c = calcCommute(l.st, state.dest);
  if (l.approx) c.approxMark = '≈';
  const gd = c.median - activeGoalMin();
  const loved = state.loved.has(l.id);
  const listedName = l.listed ? tx(l.listed.st) : '';
  const listedDiff = l.listed && listedName !== (LANG.cur==='ja'?st.ja:st.en);
  const isFilled = l.status === 'FILLED';
  return `<button class="card ${isFilled?'is-filled':''}" data-case="${l.id}" aria-label="${esc(tx(l.name))}">
    <div class="cardtop">
      <div class="madori">${madori(l)}</div>
      <div>${rentLine(l)}<div class="factline">${esc(l.layout)}${l.m2?` · ${l.m2}${l.m2Max?'–'+l.m2Max:''}m²`:''}${l.built?` · ${esc(l.built)}`:''}</div></div>
      ${dial(c)}
    </div>
    ${((typeof HERO_VISUALS !== 'undefined') && HERO_VISUALS[l.id]) ? bldgStrip(l.id, 'card') : essStrip(l.st, 'card')}
    <div class="cardmid">
      <div class="stline">${esc(LANG.cur==='ja'?st.ja:st.en)} <span class="ja">${esc(LANG.cur==='ja'?st.en:st.ja)}</span>${l.listed?` <span class="ja">· ${listedDiff?esc(listedName)+' ':''}${l.listed.walk?l.listed.walk+'′':''}</span>`:''}</div>
      <div class="factline">${esc(tx(l.name))}</div>
      <div class="commline">
        <span class="badge ${isFilled?'b-filled':(l.tier==='LIVE'?'b-live':'b-rep')}">${esc(isFilled ? (LANG.cur==='ja'?'成約参考':'LEASED REF') : (l.tier==='LIVE'?t('live_badge'):t('rep_badge')))}</span>
        ${l.en_agent?`<span class="badge b-en">${esc(t('en_badge'))}</span>`:''}
        ${l.rent>=300000?`<span class="badge b-luxury">${esc(t('luxury_badge'))}</span>`:''}
        <span class="badge ${c.direct?'b-direct':'b-transfer'}">${esc(c.direct?t('direct'):t('transfer')+' ×'+c.transfers)}</span>
        <span class="badge b-goal">${gd>0?'+':''}${gd.toFixed(1)}′</span>
        <span class="badge b-rep">p90 ${c.p90}′</span>
        ${noiseSummary(l.st)?`<span class="badge b-transfer" title="${esc(tx(noiseSummary(l.st)))}">⚠ ${esc(t('noise_chip'))}</span>`:''}
      </div>
    </div>
    ${(() => {
      const pkt = pocketForListing(l);
      if (!pkt) return '';
      return `<div class="card-pocket-bar" data-pocket="${pkt.id}" title="${esc(tx(pkt.name))}">
        <span class="pkt-badge">🏮 ${esc(tx(pkt.name))}</span>
        <span class="pkt-gem">${esc(tx(pkt.gem))}</span>
        <span class="pkt-link">${esc(LANG.cur==='ja'?'街角カルテ':'Pocket')} →</span>
      </div>`;
    })()}
    ${(() => {
      const v = l.vitals;
      if (!v) return '';
      const hbText = v.heartbeat_age_min < 60 ? (v.heartbeat_age_min + 'm') : (Math.round(v.heartbeat_age_min/60) + 'h');
      return `<div class="card-vitals-bar" title="MIMIC-III Telemetry · ${esc(v.velocity_tier)}">
        <span class="vitals-chip-tag"><span class="vitals-dot"></span>${esc(v.velocity_icon)} <b>${v.days_on_market}d</b> ${esc(LANG.cur==='ja'?'掲載経過':'on market')}</span>
        <span class="vitals-chip-pace">${esc(v.velocity_tier === 'High Velocity' ? (LANG.cur==='ja'?'⚡ 高回転':'⚡ Fast') : (LANG.cur==='ja'?'⏱️ 標準':'⏱️ Standard'))} · ${esc(LANG.cur==='ja'?'巡回':'Pulse')} ${hbText} ${esc(LANG.cur==='ja'?'前':'ago')}</span>
      </div>`;
    })()}
    ${matchLine(qMatch('listing', l).reasons)}
    <div class="cardacts">
      <span class="mini">${esc(t('case_btn'))}</span>
      <span class="mini ${loved?'loved':''}" data-love="${l.id}">♥ ${esc(t('love_btn'))}</span>
      <span class="mini" data-area="${l.st}">${esc(t('area_btn'))}: ${esc(LANG.cur==='ja'?st.ja:st.en)}</span>
    </div>
  </button>`;
}

/* ————— case sheet ————— */
function openCase(id){
  const allH = getAllCorridorHomes();
  const l = allH.find(h => h.id===id) || (typeof HOMES !== 'undefined' && HOMES.find(h => h.id===id));
  if (!l) return;
  const st = getAllCorridorStations().find(s => s.id === l.st) || activeStations().find(s => s.id === l.st) || { en:l.st, ja:l.st, num:'' };
  const eff = (l.deposit_mo!=null||l.key_mo!=null||l.deposit_yen!=null||l.key_yen!=null) ? effCost(l) : null;
  const dList = activeDests();
  const commRows = dList.map(d => {
    const c = calcCommute(l.st, d.id);
    return `<tr><td>${esc(tx(d))}</td><td>${c.walkOnly?esc(t('walkonly')):(l.approx?'≈':'')+c.median+'′'}</td><td>${c.walkOnly?'—':c.p90+'′'}</td>
      <td>${c.walkOnly?'':`<span class="badge ${c.direct?'b-direct':'b-transfer'}">${esc(c.direct?t('direct'):t('transfer')+' ×'+c.transfers)}</span>`}</td></tr>`;
  }).join('');
  const a = areaFor(l.st) || {};
  const dep = l.deposit_mo!=null ? (l.deposit_mo===0?'0':l.deposit_mo+' mo') : l.deposit_yen!=null ? yen(l.deposit_yen) : '—';
  const key = l.key_mo!=null ? (l.key_mo===0?'0':l.key_mo+' mo') : l.key_yen!=null ? yen(l.key_yen) : '—';
  $('#overlay').innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(tx(l.name))}">
    <button type="button" class="sheet-close" data-close="1" aria-label="${esc(t('close'))}">✕</button>
    <h2>${esc(tx(l.name))} <span class="badge ${l.tier==='LIVE'?'b-live':'b-rep'}">${esc(l.tier==='LIVE'?t('live_badge'):t('rep_badge'))}</span>${l.en_agent?` <span class="badge b-en">${esc(t('en_badge'))}</span>`:''}</h2>
    <p class="jah">${esc(ty(l.name)||'')} · ${esc(LANG.cur==='ja'?st.ja:st.en)}${l.listed?` · ${esc(tx(l.listed.st))}${l.listed.walk?' '+l.listed.walk+'′':''}${l.listed.line?' · '+esc(l.listed.line):''}`:''}</p>
    <div class="shadowbox-container" id="caseShadowboxViewport">
      <div class="shadowbox-badge">🏮 LIVING 3D SHADOWBOX · 和紙立体図 <i data-bldginfo="${l.id}" role="button" tabindex="0" style="margin-left:6px;cursor:pointer;font-style:normal" aria-label="${esc(t('ess_title'))}">ⓘ</i></div>
      <div class="shadowbox-controls">
        <button type="button" class="shadowbox-btn" data-sb-tod="morning">朝</button>
        <button type="button" class="shadowbox-btn" data-sb-tod="day">昼</button>
        <button type="button" class="shadowbox-btn active" data-sb-tod="dusk">夕</button>
        <button type="button" class="shadowbox-btn" data-sb-tod="night">夜</button>
      </div>
    </div>
    ${essStrip(l.st, true)}
    <div class="costgrid">
      <div class="fact"><div class="k">${esc(LANG.cur==='ja'?'家賃':'Rent')}</div><div class="v">${yen(l.rent)}${l.rentMax?'–'+yen(l.rentMax):''}</div></div>
      <div class="fact"><div class="k">${esc(t('mgmt'))}</div><div class="v">${l.mgmt?yen(l.mgmt):'—'}</div></div>
      <div class="fact"><div class="k">${esc(t('deposit'))}</div><div class="v">${dep}</div></div>
      <div class="fact"><div class="k">${esc(t('key'))}</div><div class="v">${key}</div></div>
      <div class="fact"><div class="k">${esc(t('area_m2'))}</div><div class="v">${l.m2?l.m2+(l.m2Max?'–'+l.m2Max:'')+'m²':'—'}</div></div>
      <div class="fact"><div class="k">${esc(t('floor_age'))}</div><div class="v">${esc(l.built||'—')}</div></div>
      ${eff!=null?`<div class="fact" style="border-color:var(--shu)"><div class="k" style="color:var(--shu)">${esc(t('eff_cost'))}</div><div class="v">${yen(eff)}</div><div class="k" style="text-transform:none;letter-spacing:.3px">${esc(t('eff_note'))}</div></div>`:''}
    </div>
    ${(() => {
      const v = l.vitals;
      if (!v) return '';
      const hbText = v.heartbeat_age_min < 60 ? (v.heartbeat_age_min + 'm') : (Math.round(v.heartbeat_age_min/60) + 'h');
      return `<div class="sect">
        <div class="vitals-dossier-card">
          <div class="vitals-dossier-header">
            <span class="vitals-dossier-tag">🩺 CLINICAL LISTING VITALS · 物件カルテ</span>
            <span class="vitals-pulse-badge">🟢 HTTP 200 · ${esc(LANG.cur==='ja'?'巡回検知済み':'Heartbeat Active')} (${hbText} ${esc(LANG.cur==='ja'?'前':'ago')})</span>
          </div>
          <div class="vitals-grid">
            <div class="v-cell">
              <div class="vk">${esc(LANG.cur==='ja'?'市場掲載期間 (DoM)':'Days on Market')}</div>
              <div class="vv">${v.days_on_market} <small>${esc(LANG.cur==='ja'?'日':'days')}</small></div>
              <div class="vn">${esc(LANG.cur==='ja'?'初検知':'First Seen')}: ${l.first_seen ? l.first_seen.split('T')[0] : '—'}</div>
            </div>
            <div class="v-cell">
              <div class="vk">${esc(LANG.cur==='ja'?'成約予測日数':'Est. Days till Leased')}</div>
              <div class="vv">${v.expected_time_to_off_market_days} <small>${esc(LANG.cur==='ja'?'日':'days')}</small></div>
              <div class="vn">${esc(v.velocity_icon)} ${esc(v.velocity_tier)}</div>
            </div>
            <div class="v-cell">
              <div class="vk">${esc(LANG.cur==='ja'?'空室残存確率 S(t)':'Survival Probability')}</div>
              <div class="vv">${v.survival_probability_pct}%</div>
              <div class="vn">${esc(LANG.cur==='ja'?'カプランマイヤー推計':'Kaplan-Meier model')}</div>
            </div>
            <div class="v-cell">
              <div class="vk">${esc(LANG.cur==='ja'?'構造・仕様判定':'Structure Vital')}</div>
              <div class="vv">${esc(l.structure || 'RC')}</div>
              <div class="vn">SHA256: <code>${(l.fingerprint || 'fp').slice(0,8)}</code></div>
            </div>
          </div>
          <div class="vitals-desc-note">ℹ️ <b>${esc(LANG.cur==='ja'?'エリア成約ペース':'Corridor Velocity')}:</b> ${esc(v.pocket_velocity_desc)}</div>
        </div>
      </div>`;
    })()}
    <div class="sect"><h3>${esc(t('sheet_commute'))}</h3>
      <table class="commtable"><tr><th>${esc(t('dest'))}</th><th>${esc(t('med'))}</th><th>${esc(t('p90'))}</th><th></th></tr>${commRows}</table>
      <p class="provrow" style="margin-top:7px">${esc(t('typ_verify'))} · ${esc(LANG.cur==='ja'?'p90＝中央値+運転間隔×0.4+乗換×4分':'p90 = median + headway·0.4 + 4′·transfer')}${l.stNote?` · ${esc(tx(l.stNote))}`:''}</p>
    </div>
    ${(() => {
      const pkt = pocketForListing(l);
      if (!pkt) return '';
      const radarMini = pkt.ax ? `<div class="commline" style="margin-top:8px">
        <span class="badge b-rep">🤫 ${esc(LANG.cur==='ja'?'静寂':'Quiet')} ${pkt.ax.quiet}/5</span>
        <span class="badge b-rep">🍜 ${esc(LANG.cur==='ja'?'食文化':'Food')} ${pkt.ax.food}/5</span>
        <span class="badge b-rep">🌿 ${esc(LANG.cur==='ja'?'緑道':'Green')} ${pkt.ax.green}/5</span>
        <span class="badge b-rep">🏮 ${esc(LANG.cur==='ja'?'風情':'Retro')} ${pkt.ax.old ?? pkt.ax.retro ?? 3}/5</span>
      </div>` : '';
      return `<div class="sect">
        <div class="pocket-dossier-box">
          <div class="pocket-dossier-header">
            <span class="pocket-dossier-tag" style="font-weight:700;color:var(--shu)">🏮 NEIGHBORHOOD POCKET · 街角カルテ</span>
            <button type="button" class="mini" data-pocket="${pkt.id}" style="margin-left:auto;cursor:pointer">
              ${esc(LANG.cur==='ja'?'この街角を詳しく見る':'Explore Pocket Dossier')} →
            </button>
          </div>
          <h4 style="margin:6px 0 4px;font-size:16px">${esc(tx(pkt.name))} <small style="font-weight:normal;color:var(--muted)">${esc(ty(pkt.name))}</small></h4>
          <p style="margin:0;font-size:13.5px;color:var(--ink)">${esc(tx(pkt.gem))}</p>
          ${pkt.noiseWatch ? `<p class="note" style="color:var(--warn);margin:8px 0 0">⚠ <b>${esc(LANG.cur==='ja'?'環境留意点':'Environmental Watch')}:</b> ${esc(tx(pkt.noiseWatch))}</p>` : ''}
          ${radarMini}
        </div>
      </div>`;
    })()}
    ${a.char ? `<div class="sect"><h3>${esc(t('sheet_area'))} — ${esc(LANG.cur==='ja'?st.ja:st.en)}</h3>
      <p style="margin:0 0 10px">${esc(tx(a.char)||'')}</p>
      <div class="commline">
        ${a.quiet?`<span class="badge b-rep" title="${esc(t('noise_scale'))}">${esc(LANG.cur==='ja'?'夜':'quiet')} ${a.quiet.v}/5 <i class="tierchip tc-P">P</i></span>`:''}
        ${a.air?`<span class="badge b-rep">${esc(LANG.cur==='ja'?'空気':'air')} ${'●'.repeat(a.air.band)}${'○'.repeat(3-a.air.band)} <i class="tierchip tc-P">P</i></span>`:''}
        ${a.uber?`<span class="badge b-rep">Uber Eats: ${esc(a.uber.thin?t('uber_thin'):t('uber_yes'))} <i class="tierchip tc-E">E</i></span>`:''}
        ${a.people?`<span class="badge b-rep">${esc(LANG.cur==='ja'?'外国人比率':'foreign share')} ${esc(a.people.foreign)} <i class="tierchip tc-E">E</i></span>`:''}
        ${a.noise?`<span class="badge b-transfer">⚠ ${esc(t('noise_chip'))} ×${a.noise.length} <i class="tierchip tc-E">E</i></span>`:''}
      </div>
      ${a.noise?`<p class="note" style="color:var(--warn);margin:10px 0 0">⚠ ${esc(tx(noiseSummary(l.st)))}</p>`:''}
      ${a.senses?`<p class="note" style="margin:10px 0 0">👃 ${senseHtml(a.senses)}</p>`:''}
      <p style="margin:10px 0 0"><span class="mini" data-area="${l.st}">${esc(LANG.cur==='ja'?'街ファイルを開く':'Open the full area file')} →</span></p>
    </div>` : ''}
    <div class="sect">
      <details class="ledger"><summary>${esc(t('sheet_ledger'))}</summary><div class="schema">${esc(l.tier==='LIVE'
        ? `source: ${l.srcName} · fetched ${FETCHED} · rent quoted exactly as listed${l.urlNote?`\nurl: ward list page (${tx(l.urlNote)})`:`\nurl: listing detail page`}${l.stNote?`\nstation note: ${tx(l.stNote)}`:''}\ncommute: typical-scheduled model (tier E) — ODPT adapter queued\narea file: per-field tiers V/S/P/E/Q — see area sheet`
        : `REP stand-in (tier S): rent = ${(activeWards()[st.ward]||(typeof WARDS!=='undefined'&&WARDS[st.ward])||{}).en || st.ward} ${layoutClass(l)} market rate — ${tx(SOUBA_NOTE)}\n${tx(l.repNote)}\nretired automatically when a live pull covers this station`)}</div></details>
    </div>
    <div class="sect"><h3>${esc(t('sheet_note'))}</h3>
      <p style="margin:0">${esc(l.tier==='LIVE'
        ? (LANG.cur==='ja' ? '家賃は募集原文の引用。空室は動くので、内見は出典リンクから直接どうぞ。'
                           : 'Rent figures are quoted verbatim from the listing. Availability moves fast — book the viewing through the source link below.')
        : (LANG.cur==='ja' ? 'これは相場が上着を着た代役カード。実在の物件ではありません — この駅のライブ取得が入り次第、引退します。'
                           : 'This card is the market rate wearing a coat — not a real home. It retires the moment a live pull covers this station.'))}</p>
    </div>
    <div class="sheetacts">
      <a class="cta" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(t('open_src'))} ↗</a>
      ${l.mapUrl ? `<a class="cta cta-maps" href="${esc(l.mapUrl)}" target="_blank" rel="noopener">Google Maps 📍</a>` : ''}
      <span class="cta ghost" data-love="${l.id}">♥ ${esc(t('love_btn'))}</span>
      <span class="cta ghost" data-close="1">${esc(t('close'))}</span>
    </div>
  </div>`;
  $('#overlay').hidden = false; kickVideos();
  if (typeof KantoShadowbox !== 'undefined' && KantoShadowbox.mount) {
    const sb = KantoShadowbox.mount('caseShadowboxViewport', l, { timeOfDay: 'dusk' });
    const sbBtns = $('#overlay').querySelectorAll('[data-sb-tod]');
    sbBtns.forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        sbBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (sb && sb.setTimeOfDay) sb.setTimeOfDay(btn.dataset.sbTod);
      });
    });
  }
}

/* ————— area sheet ————— */
function tierChip(tier, extra){
  return `<i class="tierchip tc-${tier}" title="${esc(t('tier_'+tier))}${extra?' · '+esc(extra):''}">${tier}</i>`;
}
function afact(label, tier, body, qnote){
  return `<div class="afact"><div class="ak">${esc(label)} ${tierChip(tier)}${qnote?tierChip('Q',qnote):''}</div><div class="av">${body}</div></div>`;
}
function openArea(sid){
  const a = areaFor(sid);
  if (!a) return;
  const st = a.st; const w = a.ward;
  const c = calcCommute(sid, state.dest);
  const dList = (typeof activeDests === 'function') ? activeDests() : (typeof DESTS !== 'undefined' ? DESTS : []);
  const dObj = dList.find(d=>d.id===state.dest) || dList[0] || { en: state.dest, ja: state.dest };
  const destName = tx(dObj);
  const soubaRows = Object.entries(w.souba).map(([k,v]) => `<tr><td>${k}</td><td>${yen(v)}</td></tr>`).join('');
  const svcClass = st.tier===3 ? (LANG.cur==='ja'?'快特停車':'ltd-express stop') : st.tier===2 ? (LANG.cur==='ja'?'特急停車':'express stop') : (LANG.cur==='ja'?'普通のみ':'local only');
  $('#overlay').innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(st.en)}">
    <button type="button" class="sheet-close" data-close="1" aria-label="${esc(t('close'))}">✕</button>
    <h2>${esc(LANG.cur==='ja'?st.ja:st.en)} <span class="ja" style="font-size:15px">${esc(LANG.cur==='ja'?st.en:st.ja)} · ${st.num}</span></h2>
    <p class="jah">${esc(tx(w))}${ty(w)?' '+esc(ty(w)):''} · ${esc(svcClass)}</p>
    ${essStrip(sid, true)}
    <p style="margin:4px 0 14px">${esc(tx(a.char)||'')}</p>
    <div class="areagrid">
      ${afact(t('area_rail'), 'E', `${esc(svcClass)} · ${esc(LANG.cur==='ja'?'日中間隔':'daytime headway')} ~${st.hw}′ · → ${esc(destName)}: <b>${c.walkOnly?esc(t('walkonly')):c.median+'′ '+esc(t('med'))+' · '+c.p90+'′ p90'}</b>${st.airport?` · ✈ ${esc(LANG.cur==='ja'?'空港線分岐':'airport line junction')}`:''}${st.junction?` · ${esc(t('corr_through'))}`:''}`, 'ODPT')}
      ${a.quiet?afact(t('area_quiet'), 'P', `<b>${a.quiet.v}/5</b> — ${esc(tx(a.quiet.why))}<br><small>${esc(t('noise_scale'))} · ${esc(LANG.cur==='ja'?'式：基準3、通過・幹線・工場・夜街・街宣・混雑で−、寺社・運河・裏路地で+':'formula: base 3 · − express trains, trunk roads, industry, nightlife, sound trucks, tourist crowding · + temple, canal, residential back-grid insulation')}</small>`):''}
      ${a.crime?afact(t('area_safety'), 'E', esc(tx(a.crime)), LANG.cur==='ja'?'警察オープンデータ':'police open data'):''}
      ${a.noise?afact(t('area_noisewatch'), 'E', a.noise.map(ev=>{
        const typeLab = (typeof NOISE_TYPE_LABELS !== 'undefined' && NOISE_TYPE_LABELS[ev.type]) ? tx(NOISE_TYPE_LABELS[ev.type]) : ev.type;
        return `<b>${esc(typeLab)}</b> · <span style="color:var(--muted)">${esc(tx(ev.when))}</span><br>${esc(tx(ev))}${ev.tip?`<br><small style="color:var(--shu);display:block;margin-top:2px">💡 ${esc(tx(ev.tip))}</small>`:''}<br><small style="color:var(--muted)">${esc(ev.src||'—')}</small>`;
      }).join('<hr style="border:none;border-top:1px solid var(--line);margin:8px 0">')+`<br><small>${esc(tx(NOISE_REPORT))}</small>`, LANG.cur==='ja'?'苦情データ':'complaint data'):''}
      ${a.air?afact(t('area_air'), 'P', `${'●'.repeat(a.air.band)}${'○'.repeat(3-a.air.band)} — ${esc(tx(a.air))}`, 'Soramame'):''}
      ${a.senses?afact(t('area_feel'), 'E', senseHtml(a.senses), LANG.cur==='ja'?'気象庁+MLIT混雑率':'JMA weather + MLIT congestion'):''}
      ${a.people?afact(t('area_people'), 'E', `${a.people.foreign?`<b>${esc(LANG.cur==='ja'?'外国人比率':'foreign residents')} ${esc(a.people.foreign)}</b> · `:''}${esc(tx(a.people))}`, 'e-Stat'):''}
      ${afact(LANG.cur==='ja'?'家賃相場':'Rent market', 'S', `<table class="commtable" style="font-size:12.5px">${soubaRows}</table><small><a href="${esc(w.src)}" target="_blank" rel="noopener">${esc(tx(SOUBA_NOTE))} ↗</a></small>`)}
      ${a.style?afact(LANG.cur==='ja'?'物件の作風':'Rental style', 'E', esc(tx(a.style))):''}
      ${a.landmarks?afact(LANG.cur==='ja'?'ランドマーク':'Landmarks', 'E', esc(tx(a.landmarks))):''}
      ${a.food?afact(t('area_food'), 'E', `${esc(tx(a.food))}${a.coffee?`<br><small>☕ ${esc(tx(a.coffee))}</small>`:''}`):''}
      ${a.grocery?afact(t('area_daily'), 'E', `${esc(tx(a.grocery))}${a.grocerPlus?`<br><b>◎ ${esc(LANG.cur==='ja'?(a.grocerPlus.ja||a.grocerPlus.v):a.grocerPlus.v)}</b> <small>${esc(t('grocer_note'))}</small>`:''}<br><small>Uber Eats: ${esc(a.uber && a.uber.thin?t('uber_thin'):t('uber_yes'))}</small>`):''}
      ${a.hobby?afact(t('area_hobby'), 'E', esc(tx(a.hobby))):''}
      ${a.photoOps?afact(t('area_photo'), 'E', `${esc(tx(a.photoOps))}<br><small>${esc(t('golden_label'))} ${goldenHour().start}–${goldenHour().end} <i class="tierchip tc-P" title="${esc(LANG.cur==='ja'?'太陽計算（NOAA近似・東京湾岸・±3分）':'computed (NOAA approx, Tokyo bay, ±3min)')}">P</i></small>`):''}
    </div>
    <p class="provrow" style="margin-top:12px">${['V','S','P','E','Q'].map(x=>`${tierChip(x)} ${esc(t('tier_'+x))}`).join(' · ')}</p>
    <div class="sheetacts">
      <span class="cta" data-homesat="${sid}">${esc(LANG.cur==='ja'?'この駅の物件を見る':'See homes at this station')} →</span>
      <span class="cta ghost" data-close="1">${esc(t('close'))}</span>
    </div>
  </div>`;
  $('#overlay').hidden = false; kickVideos();
}

/* ————— tikki radio ————— */
function radioDeck(){
  const allH = activeHomes();
  const live = allH.filter(l => l.tier==='LIVE' && l.rent);
  for (let i = live.length-1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [live[i],live[j]] = [live[j],live[i]]; }
  return live.slice(0, 14);
}
function radioView(){
  if (!state.radio) state.radio = { deck: radioDeck(), i: 0, taste: {}, judged: 0, shownAt: 0, timer: null, lastLearn: '' };
  const r = state.radio;
  if (r.i >= r.deck.length){
    const dims = Object.entries(state.taste || r.taste).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,3);
    return `<p class="kick">${esc(t('radio_kick'))}</p><h1>${esc(t('radio_h1'))}</h1>
      <div class="panel" style="max-width:540px"><h3>${esc(t('radio_tuned_panel'))}</h3>
      ${dims.length?dims.map(([d,v])=>`<div class="srow"><span class="lab">${esc(dimLabel(d))}</span><b>${'▮'.repeat(Math.min(5,Math.max(1,Math.ceil(v))))}</b></div>`).join(''):`<p class="provrow">—</p>`}
      <p style="margin-top:10px">${esc(t('radio_empty'))}</p>
      <p style="margin-top:12px"><span class="cta" data-radiorestart="1">${esc(t('radio_restart'))}</span>
      <span class="cta ghost" data-gohomes="1">${esc(t('nav_homes'))} →</span></p></div>`;
  }
  const l = r.deck[r.i];
  const st = activeStations().find(s => s.id === l.st) || (typeof STATIONS !== 'undefined' && typeof S_IDX !== 'undefined' && STATIONS[S_IDX[l.st]]) || { en:l.st, ja:l.st, num:'' };
  const c = calcCommute(l.st, state.dest);
  if (l.approx) c.approxMark = '≈';
  const a = areaFor(l.st);
  const curGoal = activeGoalMin();
  const gd = c.median - curGoal;
  const tuning = r.judged < 2;
  return `<p class="kick">${esc(t('radio_kick'))}</p>
  <h1>${esc(t('radio_h1'))}</h1><p class="sub">${esc(t('radio_sub'))}</p>
  ${tuning?`<p class="note" style="color:var(--warn)"><b>${esc(t('radio_tuning'))}</b> · ${r.judged+1}/2</p>`:`<p class="note">${r.i+1} / ${r.deck.length}${r.lastLearn?` · <b>${esc(t('radio_learned'))}</b> ${esc(r.lastLearn)}`:''}</p>`}
  <div class="deckwrap"><div class="deckcard">
    <div class="cardtop">
      <div class="madori" style="width:110px;height:110px">${madori(l)}</div>
      <div>${rentLine(l)}<div class="factline">${esc(l.layout)}${l.m2?` · ${l.m2}m²`:''}${l.built?` · ${esc(l.built)}`:''}</div>
        <div class="stline" style="margin-top:6px">${esc(LANG.cur==='ja'?st.ja:st.en)} <span class="ja">${esc(LANG.cur==='ja'?st.en:st.ja)}</span></div>
        <div class="factline">${esc(tx(l.name))} · ${esc(l.srcName)}</div></div>
      ${dial(c)}
    </div>
    ${((typeof HERO_VISUALS !== 'undefined') && HERO_VISUALS[l.id]) ? bldgStrip(l.id, 'card') : essStrip(l.st, 'card')}
    <div class="commline" style="padding:12px 16px 14px">
      <span class="badge b-live">${esc(t('live_badge'))}</span>
      ${l.en_agent?`<span class="badge b-en">${esc(t('en_badge'))}</span>`:''}
      <span class="badge ${c.direct?'b-direct':'b-transfer'}">${esc(c.direct?t('direct'):t('transfer')+' ×'+c.transfers)}</span>
      ${a.quiet?`<span class="badge b-rep">${esc(LANG.cur==='ja'?'夜':'quiet')} ${a.quiet.v}/5</span>`:''}
      ${noiseSummary(l.st)?`<span class="badge b-transfer" title="${esc(tx(noiseSummary(l.st)))}">⚠ ${esc(t('noise_chip'))}</span>`:''}
      <span class="badge b-goal">${gd>0?'+':''}${gd.toFixed(1)}′</span>
    </div>
    <div class="stamp" id="stamp" hidden></div>
  </div>
  <div class="verbbar">
    <span class="verb v-pass" data-verdict="pass">✕ ${esc(t('pass'))}</span>
    <span class="verb v-case" data-case="${l.id}">${esc(t('open_case'))}</span>
    <span class="verb v-love" data-verdict="love">♥ ${esc(t('love'))}</span>
  </div>
  <p class="provrow" style="text-align:center;margin-top:8px">${esc(LANG.cur==='ja'?'← スキップ · → 好き · スペースで調書':'← skip · → love · space = case file')}</p></div>`;
}
function judge(verdict){
  const r = state.radio; if (!r || r.i >= r.deck.length || r.timer) return;
  const l = r.deck[r.i];
  const dt = performance.now() - r.shownAt;
  const w = dt < 2500 ? 1 : dt < 8000 ? 0.7 : 0.4;
  const oriented = r.judged >= 2;
  if (oriented){
    const dims = dimsFor(l);
    for (const d of dims) r.taste[d] = (r.taste[d]||0) + (verdict==='love' ? w : -0.6*w);
    r.lastLearn = dims.slice(0,3).map(d => (verdict==='love'?'+':'−') + dimLabel(d)).join(' · ');
    state.taste = r.taste;
  } else r.lastLearn = '';
  if (verdict==='love') state.loved.add(l.id);
  r.judged++;
  const stamp = $('#stamp');
  if (stamp){
    stamp.hidden = false;
    stamp.className = 'stamp ' + (verdict==='love'?'st-love':'st-pass');
    stamp.textContent = verdict==='love' ? t('love')+' ♥' : t('pass')+' ✕';
  }
  r.timer = setTimeout(() => { r.timer = null; r.i++; r.shownAt = performance.now(); render(); }, 720);
}

/* ————— render / routing ————— */
function setView(v){
  if (state.radio && state.radio.timer){ clearTimeout(state.radio.timer); state.radio.timer = null; }  // R1 lesson
  state.view = v;
  if (location.hash !== '#'+v) history.replaceState(null, '', '#'+v);
  render();
}
function render(){
  applyChrome();
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.v === state.view));
  const m = $('#main');
  if (state.view === 'homes') m.innerHTML = homesView();
  else if (state.view === 'lines') {
    m.innerHTML = linesView();
    const topo = document.querySelector('.topo');
    if (topo && state.topoSelectedStation) {
      const TT = topoT();
      const stList = activeStations();
      const sIdx = stList.findIndex(s => s.id === state.topoSelectedStation);
      if (sIdx !== -1) {
        const [px] = bez(TT[sIdx]);
        const scale = (topo.scrollWidth || 800) / 1160;
        topo.scrollLeft = Math.max(0, px * scale - topo.clientWidth / 2);
      }
    }
  }
  else if (state.view === 'pockets'){ m.innerHTML = pocketsView(); if (state.pk) state.pk.shownAt = performance.now(); }
  else if (state.view === 'radio'){ m.innerHTML = radioView(); if (state.radio) state.radio.shownAt = performance.now(); }
  else {
    m.innerHTML = corridorView();
    const sc = $('.corrscroll');
    if (sc){  // center the map on the station closest to the goal
      let bi = 0, bv = Infinity;
      const stns = activeStations();
      const curGoal = activeGoalMin();
      stns.forEach((s,i) => {
        const c = calcCommute(s.id, state.dest);
        if (!c.walkOnly && Math.abs(c.median - curGoal) < bv){ bv = Math.abs(c.median - curGoal); bi = i; }
      });
      sc.scrollLeft = Math.max(0, (30 + bi*56) - sc.clientWidth/2);
    }
  }
  bindCardVideos();
}
function toast(msg){
  const el = $('#toast'); el.textContent = msg; el.hidden = false;
  if (state.toastT) clearTimeout(state.toastT);
  state.toastT = setTimeout(() => { el.hidden = true; state.toastT = null; }, 2400);
}

/* ————— events: one delegated listener ————— */
document.addEventListener('click', e => {
  const ov = $('#overlay');
  if (e.target === ov){ if (typeof KantoShadowbox !== 'undefined') KantoShadowbox.unmount(); ov.hidden = true; return; }
  const el = e.target.closest('[data-v],[data-case],[data-essinfo],[data-area],[data-love],[data-close],[data-verdict],[data-radiorestart],[data-gohomes],[data-homesat],[data-tgroup],[data-tline],[data-tstation],[data-tstation-clear],[data-bldginfo],[data-essplay],[data-pq],[data-pkstart],[data-pkskip],[data-pkredo],[data-pocket],[data-qfilter],[data-stfilter],[data-corridor-switch],[data-fservice],[data-stn-snap],[data-filter-stn],[data-open-dossier],#langbtn');
  if (!el) return;
  if (el.id === 'langbtn'){ LANG.cur = LANG.cur === 'en' ? 'ja' : 'en'; render(); return; }
  if (el.dataset.qfilter){
    e.preventDefault();
    const qf = el.dataset.qfilter;
    if (qf === 'clear'){
      state.fStation = 'all'; state.fPocket = 'all'; state.fLayout = 'all'; state.fTier = 'all'; state.fQuick = 'all'; state.sort = 'goal';
    } else {
      state.fQuick = (state.fQuick === qf ? 'all' : qf);
      if (state.fQuick === 'luxury') state.fTier = 'LUXURY';
      else if (state.fQuick === 'live') state.fTier = 'LIVE';
      else if (state.fQuick === 'filled') state.fTier = 'FILLED';
      else if (state.fTier === 'LUXURY' || state.fTier === 'LIVE' || state.fTier === 'FILLED') state.fTier = 'all';
    }
    render(); return;
  }
  if (el.dataset.stfilter){
    e.preventDefault();
    const sid = el.dataset.stfilter;
    state.fStation = (state.fStation === sid ? 'all' : sid);
    render(); return;
  }
  if (el.dataset.v){ e.preventDefault(); setView(el.dataset.v); return; }
  if (el.dataset.close){ if (typeof KantoShadowbox !== 'undefined') KantoShadowbox.unmount(); ov.hidden = true; return; }
  if (el.dataset.essinfo){ e.stopPropagation(); e.preventDefault(); openEssInfo(el.dataset.essinfo); return; }
  if (el.dataset.essplay){
    e.stopPropagation(); e.preventDefault();
    const sid = el.dataset.essplay;
    const wrap = el.closest('[data-esswrap]');
    if (wrap){
      const wm = wrap.querySelector('.wm') ? wrap.querySelector('.wm').outerHTML : '';
      wrap.innerHTML = `<video autoplay muted loop playsinline><source src="essence/${sid}_live.webm" type="video/webm"><source src="essence/${sid}_live.mp4" type="video/mp4"></video>` + wm;
      kickVideos();
    }
    return;
  }
  if (el.dataset.bldginfo){ e.stopPropagation(); e.preventDefault(); openBldgInfo(el.dataset.bldginfo); return; }
  if (el.dataset.tgroup){ state.topoGroup = el.dataset.tgroup; state.topoLine = null; render(); return; }
  if (el.dataset.tline){ state.topoLine = el.dataset.tline; render(); return; }
  if (el.dataset.openDossier){
    e.stopPropagation(); e.preventDefault();
    openArea(el.dataset.openDossier);
    return;
  }
  if (el.dataset.tstation){
    e.stopPropagation(); e.preventDefault();
    const stn = el.dataset.tstation;
    if (state.topoSelectedStation === stn){
      // Second click: pull up the dossier card!
      openArea(stn);
      return;
    }
    // First click: select and actively light up the station & explore connections
    state.topoSelectedStation = stn;
    state.topoLine = null;
    render();
    return;
  }
  if (el.dataset.tstationClear){
    e.stopPropagation(); e.preventDefault();
    state.topoSelectedStation = null;
    state.topoLine = null;
    render();
    return;
  }
  if (el.dataset.pq){ pkAnswer(el.dataset.pq); return; }
  if (el.dataset.pkstart){ state.pk = { i:0, u:{}, touched:new Set(), done:false, skipped:false, shownAt: performance.now() }; render(); return; }
  if (el.dataset.pkskip){ if (state.pk) state.pk.skipped = true; render(); return; }
  if (el.dataset.pkredo){ state.pk = { i:0, u:{}, touched:new Set(), done:false, skipped:false, shownAt: performance.now() }; render(); return; }
  if (el.dataset.pocket){ e.stopPropagation(); e.preventDefault(); openPocket(el.dataset.pocket); return; }
  if (el.dataset.love){
    e.stopPropagation(); e.preventDefault();
    const id = el.dataset.love;
    state.loved.has(id) ? state.loved.delete(id) : state.loved.add(id);
    if (state.loved.has(id)) toast(t('toast_love'));
    if (ov.hidden) render(); else el.classList.toggle('loved');
    return;
  }
  if (el.dataset.corridorSwitch){
    e.stopPropagation(); e.preventDefault();
    switchCorridor(el.dataset.corridorSwitch);
    return;
  }
  if (el.dataset.fservice){
    e.stopPropagation(); e.preventDefault();
    state.fService = el.dataset.fservice;
    render();
    return;
  }
  if (el.dataset.stnSnap){
    e.stopPropagation(); e.preventDefault();
    const stn = el.dataset.stnSnap;
    if (state.activeStnDrawer === stn){
      // Second click: pull up the dossier card!
      openArea(stn);
      return;
    }
    // First click: select and actively light up the station
    state.activeStnDrawer = stn;
    render();
    return;
  }
  if (el.dataset.filterStn){
    e.stopPropagation(); e.preventDefault();
    state.fStation = el.dataset.filterStn;
    setView('homes');
    return;
  }
  if (el.dataset.openDossier){
    e.stopPropagation(); e.preventDefault();
    openArea(el.dataset.openDossier);
    return;
  }
  if (el.dataset.area){ e.stopPropagation(); e.preventDefault(); openArea(el.dataset.area); return; }
  if (el.dataset.homesat){ ov.hidden = true; state.fStation = el.dataset.homesat; setView('homes'); return; }
  if (el.dataset.verdict){ judge(el.dataset.verdict); return; }
  if (el.dataset.case){ e.stopPropagation(); e.preventDefault(); openCase(el.dataset.case); return; }
  if (el.dataset.radiorestart){ state.radio = null; render(); return; }
  if (el.dataset.gohomes){ if (state.taste) state.sort = 'radio'; setView('homes'); return; }
});
document.addEventListener('change', e => {
  if (e.target.id === 'goalpick'){
    state.customGoalMin = parseFloat(e.target.value) || 26.5;
    toast((LANG.cur === 'ja' ? '通勤目標: ' : 'Commute goal: ') + state.customGoalMin + '′');
    render();
    return;
  }
  if (e.target.id === 'dest'){
    state.dest = e.target.value;
    const destObj = activeDests().find(d => d.id === state.dest);
    if (destObj) toast(t('toast_dest') + tx(destObj));
    render();
    return;
  }
  if (e.target.id === 'topostation'){
    state.topoSelectedStation = e.target.value || null;
    state.topoLine = null;
    render();
    if (state.topoSelectedStation){
      setTimeout(() => {
        const insp = document.getElementById('station-inspector');
        if (insp) insp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
    return;
  }
  if (e.target.id === 'fstation'){ state.fStation = e.target.value; render(); return; }
  if (e.target.id === 'fpocket'){ state.fPocket = e.target.value; render(); return; }
  if (e.target.id === 'flayout'){ state.fLayout = e.target.value; render(); return; }
  if (e.target.id === 'ftier'){ state.fTier = e.target.value; render(); return; }
  if (e.target.id === 'fsort'){ state.sort = e.target.value; render(); return; }
  if (e.target.id === 'tline'){ state.topoLine = e.target.value || null; render(); return; }
  if (e.target.id === 'pkmax'){ state.pkMax = Math.max(10, Math.min(90, +e.target.value || 35)); render(); return; }
  if (e.target.id === 'pkbudget'){ state.pkBudget = +e.target.value; render(); return; }
  if (e.target.id === 'pklayout'){ state.pkLayout = e.target.value; render(); return; }
});
let qT = null;
document.addEventListener('input', e => {
  if (e.target.id === 'q'){
    clearTimeout(qT);
    qT = setTimeout(() => { state.q = e.target.value; if (['homes','pockets','corridor'].includes(state.view)){ const f = document.activeElement; render(); if (f && f.id==='q'){ const el=$('#q'); el.focus(); el.value = state.q; el.setSelectionRange(el.value.length, el.value.length); } } }, 180);
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#overlay').hidden){ if (typeof KantoShadowbox !== 'undefined') KantoShadowbox.unmount(); $('#overlay').hidden = true; return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.getAttribute && e.target.getAttribute('role') === 'button' && e.target.tabIndex >= 0){
    e.preventDefault();
    e.target.click();
    return;
  }
  if (state.view === 'radio' && $('#overlay').hidden){
    if (e.key === 'ArrowLeft'){ judge('pass'); }
    else if (e.key === 'ArrowRight'){ judge('love'); }
    else if (e.key === ' '){ e.preventDefault(); const r = state.radio; if (r && r.deck[r.i]) openCase(r.deck[r.i].id); }
  }
});

/* ————— corridor switcher & initialization ————— */
function switchCorridor(cid){
  if (!CORRIDORS[cid]) return;
  state.corridor = cid;
  const cData = getActiveCorridor();
  const dList = (cData && cData.dests) ? cData.dests : DESTS;
  state.dest = dList[0] ? dList[0].id : (cid === 'keikyu' ? 'yokohama' : 'shibuya');
  state.fStation = 'all';
  state.activeStnDrawer = null;
  state.fService = 'all';
  state.topoSelectedStation = null;
  state.topoLine = null;
  state.topoGroup = 'all';

  const url = new URL(location.href);
  url.searchParams.set('c', cid);
  history.replaceState(null, '', url.toString());

  const pick = document.getElementById('corridorpick');
  if (pick) pick.value = cid;
  const tag = document.getElementById('brandtag');
  if (tag) tag.textContent = CORRIDORS[cid].tag + ' · rentals';
  document.title = 'HomeTikki · ' + CORRIDORS[cid].name.toUpperCase();

  applyChrome();
  toast((LANG.cur === 'ja' ? '沿線切替：' : 'Switched Corridor: ') + (LANG.cur === 'ja' ? CORRIDORS[cid].ja : CORRIDORS[cid].name));
  render();
}

(function initCorridorPicker(){
  const param = new URLSearchParams(location.search).get('c') || 'keikyu';
  state.corridor = CORRIDORS[param] ? param : 'keikyu';
  const corr = CORRIDORS[state.corridor];
  const pick = document.getElementById('corridorpick');
  if (pick) {
    pick.value = state.corridor;
    pick.addEventListener('change', () => {
      switchCorridor(pick.value);
    });
  }
  const tag = document.getElementById('brandtag');
  if (tag) tag.textContent = corr.tag + ' · rentals';
  document.title = 'HomeTikki · ' + corr.name.toUpperCase();

  const cData = getActiveCorridor();
  const dList = (cData && cData.dests) ? cData.dests : DESTS;
  if (!dList.some(d => d.id === state.dest)){
    state.dest = dList[0] ? dList[0].id : 'yokohama';
  }
})();

/* ————— boot ————— */
(function boot(){
  const h = location.hash.replace('#','');
  if (['corridor','lines','homes','pockets','radio'].includes(h)) state.view = h;
  const stnParam = new URLSearchParams(location.search).get('stn');
  if (stnParam) {
    if (state.view === 'lines') state.topoSelectedStation = stnParam;
    if (state.view === 'corridor') state.activeStnDrawer = stnParam;
  }
  render();
  const caseId = new URLSearchParams(location.search).get('case') || (location.hash.match(/#case[=/]([\w-]+)/) || [])[1];
  if (caseId) {
    setTimeout(() => { openCase(caseId); }, 50);
  }
  const areaId = new URLSearchParams(location.search).get('area') || (location.hash.match(/#area[=/]([\w-]+)/) || [])[1];
  if (areaId) {
    setTimeout(() => { openArea(areaId); }, 50);
  }
})();
