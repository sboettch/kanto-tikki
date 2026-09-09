/* HomeTikki · KANTO — Round 2 data layer.
   Corridor: EVERYTHING Ningyōchō → Yokohama on the through-run
   (Toei Asakusa line → Sengakuji junction → Keikyu main line). 33 stations.

   PROVENANCE TIERS used across the app:
     V  verified pull   — fetched this round, quoted exactly, source URL kept
     S  souba benchmark — LIFULL HOME'S ward market-rate pages (weekly Friday
                          update, basis: listings within 10-min station walk,
                          management fees excluded), fetched 2026-09-02
     P  proxy           — computed from structure; formula stated in UI
     E  editorial       — typical/known, flagged "verify"
     Q  queued          — needs an adapter (ODPT timetables, e-Stat, MPD open
                          data, Soramame AQ) — never faked in the meantime

   Rail times: TYPICAL-SCHEDULED (tier E) except the verified anchors below.
   Through-run existence is VERIFIED: "South-bound through services are
   diverted onto the Keikyu Main Line at Sengakuji Station"
   (asakusastation.com). Yokosuka-Chūō→Yokohama 27′/¥410 verified via
   trip.com in Round 1 (southern anchor, beyond this corridor's foot). */

const GOAL_MIN = 26.5;
const AMORT_MONTHS = 24;
const FETCHED = '2026-09-02';

/* ---------------- wards / rent markets (tier S) ---------------- */
const WARDS = {
  chuo:      { en:'Chūō',        ja:'中央区',   souba:{ '1R':156000,'1K':134300,'1DK':170100,'1LDK':234000,'2LDK':328200,'3LDK':429400 },
               src:'https://www.homes.co.jp/chintai/tokyo/chuo-city/price/' },
  minato:    { en:'Minato',      ja:'港区',     souba:{ '1R':177400,'1K':147000,'1LDK':292200,'2LDK':467000 },
               src:'https://www.homes.co.jp/chintai/tokyo/minato-city/price/' },
  shinagawa: { en:'Shinagawa',   ja:'品川区',   souba:{ '1R':121000,'1K':120000,'1DK':153700,'1LDK':210200,'2LDK':294800 },
               src:'https://www.homes.co.jp/chintai/tokyo/shinagawa-city/price/' },
  ota:       { en:'Ōta',         ja:'大田区',   souba:{ '1R':100400,'1K':105100,'1DK':136400,'1LDK':170100,'2LDK':229500 },
               src:'https://www.homes.co.jp/chintai/tokyo/ota-city/price/' },
  kawasaki:  { en:'Kawasaki-ku', ja:'川崎区',   souba:{ '1R':77900,'1K':93800,'1LDK':127200 },
               src:'https://www.homes.co.jp/chintai/kanagawa/kawasaki_kawasaki-city/price/' },
  tsurumi:   { en:'Tsurumi',     ja:'鶴見区',   souba:{ '1R':70500,'1K':91500,'1LDK':143000 },
               src:'https://www.homes.co.jp/chintai/kanagawa/yokohama_tsurumi-city/price/' },
  kanagawaku:{ en:'Kanagawa-ku', ja:'神奈川区', souba:{ '1R':76000,'1K':89500,'1DK':103100,'1LDK':157600,'2K':111300,'2DK':124000,'2LDK':206900,'3DK':190000,'3LDK':232100 },
               src:'https://www.homes.co.jp/chintai/kanagawa/yokohama_kanagawa-city/price/' },
  nishi:     { en:'Nishi',       ja:'西区',     souba:{ '1R':80900,'1K':90600,'1DK':129600,'1LDK':166200,'2DK':168100,'2LDK':238500,'3LDK':263400 },
               src:'https://www.homes.co.jp/chintai/kanagawa/yokohama_nishi-city/price/' },
};
const SOUBA_NOTE = { en:"LIFULL HOME'S ward market rate · walk≤10 basis · updated Fridays · fetched 2026-09-02",
                     ja:"LIFULL HOME'S 家賃相場 · 徒歩10分内基準 · 毎週金曜更新 · 2026-09-02取得" };

/* ---------------- stations, in through-run order ----------------
   cumL : cumulative TYPICAL local minutes from Ningyōchō (tier E)
   tier : 3 = Kaitoku/ltd-exp stop · 2 = Tokkyū stop · 1 = local only
          subway section (sub:true) — every pattern stops
   hw   : typical daytime headway, minutes (tier E)                   */
const STATIONS = [
  { id:'ningyocho',   en:'Ningyōchō',            ja:'人形町',       num:'A-14', ward:'chuo',      cumL:0,    tier:1, sub:true, hw:4 },
  { id:'nihombashi',  en:'Nihombashi',           ja:'日本橋',       num:'A-13', ward:'chuo',      cumL:2,    tier:1, sub:true, hw:4 },
  { id:'takaracho',   en:'Takaracho',            ja:'宝町',         num:'A-12', ward:'chuo',      cumL:4,    tier:1, sub:true, hw:4 },
  { id:'hgashiginza', en:'Higashi-ginza',        ja:'東銀座',       num:'A-11', ward:'chuo',      cumL:6,    tier:1, sub:true, hw:4 },
  { id:'shimbashi',   en:'Shimbashi',            ja:'新橋',         num:'A-10', ward:'minato',    cumL:8,    tier:1, sub:true, hw:4 },
  { id:'daimon',      en:'Daimon',               ja:'大門',         num:'A-09', ward:'minato',    cumL:10,   tier:1, sub:true, hw:4 },
  { id:'mita',        en:'Mita',                 ja:'三田',         num:'A-08', ward:'minato',    cumL:12,   tier:1, sub:true, hw:4 },
  { id:'sengakuji',   en:'Sengakuji',            ja:'泉岳寺',       num:'A-07', ward:'minato',    cumL:15,   tier:3, sub:true, hw:4, junction:true },
  { id:'shinagawa',   en:'Shinagawa',            ja:'品川',         num:'KK01', ward:'shinagawa', cumL:17,   tier:3, hw:4, note:{en:'station itself sits in Minato ward; Keikyu-side housing runs south into Shinagawa ward',ja:'駅自体は港区、住宅は品川区側へ'} },
  { id:'kitashina',   en:'Kitashinagawa',        ja:'北品川',       num:'KK02', ward:'shinagawa', cumL:19,   tier:1, hw:6 },
  { id:'shimbamba',   en:'Shimbamba',            ja:'新馬場',       num:'KK03', ward:'shinagawa', cumL:20.5, tier:1, hw:6 },
  { id:'aomono',      en:'Aomono-yokochō',       ja:'青物横丁',     num:'KK04', ward:'shinagawa', cumL:22,   tier:2, hw:5 },
  { id:'samezu',      en:'Samezu',               ja:'鮫洲',         num:'KK05', ward:'shinagawa', cumL:23.5, tier:1, hw:6 },
  { id:'tachiaigawa', en:'Tachiaigawa',          ja:'立会川',       num:'KK06', ward:'shinagawa', cumL:25,   tier:1, hw:6 },
  { id:'omorikaigan', en:'Ōmorikaigan',          ja:'大森海岸',     num:'KK07', ward:'ota',       cumL:27,   tier:1, hw:6 },
  { id:'heiwajima',   en:'Heiwajima',            ja:'平和島',       num:'KK08', ward:'ota',       cumL:28.5, tier:2, hw:5 },
  { id:'omorimachi',  en:'Ōmorimachi',           ja:'大森町',       num:'KK09', ward:'ota',       cumL:30,   tier:1, hw:6 },
  { id:'umeyashiki',  en:'Umeyashiki',           ja:'梅屋敷',       num:'KK10', ward:'ota',       cumL:31.5, tier:1, hw:6 },
  { id:'kamata',      en:'Keikyū Kamata',        ja:'京急蒲田',     num:'KK11', ward:'ota',       cumL:33.5, tier:3, hw:4, airport:true },
  { id:'zoshiki',     en:'Zōshiki',              ja:'雑色',         num:'KK18', ward:'ota',       cumL:35.5, tier:1, hw:6 },
  { id:'rokugodote',  en:'Rokugō-dote',          ja:'六郷土手',     num:'KK19', ward:'ota',       cumL:37,   tier:1, hw:6 },
  { id:'kawasaki',    en:'Keikyū Kawasaki',      ja:'京急川崎',     num:'KK20', ward:'kawasaki',  cumL:40,   tier:3, hw:4, daishi:true },
  { id:'hatcho',      en:'Hatchōnawate',         ja:'八丁畷',       num:'KK27', ward:'kawasaki',  cumL:42,   tier:1, hw:6 },
  { id:'ichiba',      en:'Tsurumi-ichiba',       ja:'鶴見市場',     num:'KK28', ward:'tsurumi',   cumL:43.5, tier:1, hw:6 },
  { id:'tsurumi',     en:'Keikyū Tsurumi',       ja:'京急鶴見',     num:'KK29', ward:'tsurumi',   cumL:45.5, tier:2, hw:5 },
  { id:'kagetsu',     en:'Kagetsu-sōji-mae',     ja:'花月総持寺',   num:'KK30', ward:'tsurumi',   cumL:47,   tier:1, hw:6 },
  { id:'namamugi',    en:'Namamugi',             ja:'生麦',         num:'KK31', ward:'tsurumi',   cumL:48.5, tier:1, hw:6 },
  { id:'shinkoyasu',  en:'Keikyū Shinkoyasu',    ja:'京急新子安',   num:'KK32', ward:'kanagawaku',cumL:50.5, tier:1, hw:6 },
  { id:'koyasu',      en:'Koyasu',               ja:'子安',         num:'KK33', ward:'kanagawaku',cumL:52,   tier:1, hw:6 },
  { id:'shimmachi',   en:'Kanagawa-shimmachi',   ja:'神奈川新町',   num:'KK34', ward:'kanagawaku',cumL:53.5, tier:2, hw:5 },
  { id:'hkanagawa',   en:'Keikyū Higashi-kanagawa', ja:'京急東神奈川', num:'KK35', ward:'kanagawaku', cumL:55.5, tier:1, hw:6 },
  { id:'kanagawa',    en:'Kanagawa',             ja:'神奈川',       num:'KK36', ward:'kanagawaku',cumL:57,   tier:1, hw:6 },
  { id:'yokohama',    en:'Yokohama',             ja:'横浜',         num:'KK37', ward:'nishi',     cumL:59,   tier:3, hw:4 },
];
const S_IDX = Object.fromEntries(STATIONS.map((s,i)=>[s.id,i]));

/* express cumulative tables (typical, tier E) — defined only at stops.
   Subway section: every pattern stops, so cum = cumL there. */
const CUM_TOKKYU  = { sengakuji:15, shinagawa:17, aomono:20, heiwajima:23.5, kamata:26, kawasaki:30, tsurumi:34, shimmachi:36.5, yokohama:39.5 };
const CUM_KAITOKU = { sengakuji:15, shinagawa:17, kamata:23.5, kawasaki:26.5, yokohama:33.5 };
function cumFor(st, table){
  if (st.sub) return st.cumL;              // every pattern stops on the subway leg
  return table[st.id];                     // undefined if the pattern skips it
}

/* ---------------- destinations ---------------- */
const DESTS = [
  { id:'yokohama',    st:'yokohama',    en:'Yokohama',        ja:'横浜' },
  { id:'shinagawa',   st:'shinagawa',   en:'Shinagawa',       ja:'品川' },
  { id:'nihombashi',  st:'nihombashi',  en:'Nihombashi',      ja:'日本橋' },
  { id:'shimbashi',   st:'shimbashi',   en:'Shimbashi',       ja:'新橋' },
  { id:'kawasaki',    st:'kawasaki',    en:'Keikyū Kawasaki', ja:'京急川崎' },
  { id:'yokosuka',    st:null,          en:'Yokosuka-Chūō',   ja:'横須賀中央', yk:true },
  { id:'yokosuka_jr', st:null,          en:'JR Yokosuka',     ja:'JR横須賀',  yk_jr:true },
  { id:'haneda',      st:null,          en:'Haneda Airport',  ja:'羽田空港', airport:true },
];

/* ---------------- commute engine v2 ----------------
   Returns { median, p90, transfers, direct, verified, walkOnly?, note? }.
   Model, stated honestly:
   · direct local   = |cumL a−b|
   · direct express = |cum a−b| on any pattern stopping at BOTH ends
   · local + express hop = local leg to nearest express stop toward the
     destination + 3′ same-platform pad + express leg (counts 1 transfer)
   · wait = headway/2 folded into median
   · p90 = median + headway·0.4 + 4·transfers  ("consistent 29 direct
     beats fragile 26" — the p90 is what you plan around)
   · Haneda = leg to Keikyū Kamata + 11′ airport leg; through airport
     services exist from the subway side, so no transfer north of Kamata.
   All typical-scheduled (tier E) unless marked verified. */
function pairTime(a, b){                    // raw in-motion minutes a→b + transfers
  let best = Math.abs(a.cumL - b.cumL), transfers = 0;
  for (const table of [CUM_TOKKYU, CUM_KAITOKU]){
    const ca = cumFor(a, table), cb = cumFor(b, table);
    if (ca !== undefined && cb !== undefined){
      const v = Math.abs(ca - cb);
      if (v < best){ best = v; transfers = 0; }
    }
  }
  const dir = S_IDX[b.id] > S_IDX[a.id] ? 1 : -1;
  for (const table of [CUM_KAITOKU, CUM_TOKKYU]){
    const cb = cumFor(b, table);
    if (cb === undefined) continue;
    for (let i = S_IDX[a.id]+dir; i>=0 && i<STATIONS.length; i+=dir){
      const m = STATIONS[i];
      const cm = cumFor(m, table);
      if (cm !== undefined){
        const v = Math.abs(a.cumL - m.cumL) + 3 + Math.abs(cm - cb);
        if (v + 0.001 < best){ best = v; transfers = 1; }
        break;
      }
    }
  }
  return { mins: best, transfers };
}

function keikyuCommute(stationId, destId){
  const a = (typeof S_IDX !== 'undefined' && STATIONS[S_IDX[stationId]]) || (typeof activeStations === 'function' && activeStations().find(s => s.id === stationId));
  if (!a) {
    return { median:25, p90:29, transfers:0, direct:true, verified:false, walkOnly:false };
  }
  const destList = (typeof activeDests === 'function') ? activeDests() : DESTS;
  const dest = destList.find(d=>d.id===destId) || DESTS.find(d=>d.id===destId) || DESTS[0];

  if (dest.airport){
    const kam = STATIONS[S_IDX['kamata']];
    const north = S_IDX[stationId] <= S_IDX['kamata'];
    const leg = a.id==='kamata' ? { mins:0, transfers:0 } : pairTime(a, kam);
    const transfers = leg.transfers + (north ? 0 : 1);
    const median = a.hw/2 + leg.mins + (north ? 0 : 3) + 11;
    return { median:r5(median), p90:r5(median + a.hw*0.4 + 4*transfers),
             transfers, direct:transfers===0, verified:false,
             note:{en:'via Keikyū Kamata · airport leg ~11′ typical',ja:'京急蒲田経由 · 空港線 約11分'} };
  }

  if (dest.yk){
    const ykn = STATIONS[S_IDX['yokohama']];
    const leg = a.id==='yokohama' ? { mins:0, transfers:0 } : pairTime(a, ykn);
    const isKaitokuStop = (typeof CUM_KAITOKU !== 'undefined' && CUM_KAITOKU[a.id] !== undefined);
    const transfers = isKaitokuStop ? 0 : Math.max(1, leg.transfers);
    const median = leg.mins + 27 + (isKaitokuStop ? 0 : 3) + a.hw/2;
    return { median:r5(median), p90:r5(median + a.hw*0.4 + 4*transfers),
             transfers, direct:transfers===0, verified:(a.id==='yokohama'),
             note:{en:'Keikyū Main Line Kaitoku · Yokohama 27′ anchor',ja:'京急本線快特 · 横浜から27分'} };
  }

  if (dest.yk_jr){
    const ykn = STATIONS[S_IDX['yokohama']];
    const leg = a.id==='yokohama' ? { mins:0, transfers:0 } : pairTime(a, ykn);
    const transfers = leg.transfers + 1;
    const median = leg.mins + 42 + 5 + a.hw/2;
    return { median:r5(median), p90:r5(median + a.hw*0.4 + 4*transfers),
             transfers, direct:false, verified:false,
             note:{en:'Yokohama transfer to JR Yokosuka Line (42′)',ja:'横浜駅乗換 JR横須賀線（42分）'} };
  }

  const b = (typeof S_IDX !== 'undefined' && STATIONS[S_IDX[dest.st || dest.id]]) || (typeof activeStations === 'function' && activeStations().find(s => s.id === (dest.st || dest.id)));
  if (!b) return { median:25, p90:29, transfers:0, direct:true, verified:false, walkOnly:false };
  if (a.id === b.id) return { median:0, p90:0, transfers:0, direct:true, verified:true, walkOnly:true };

  if (typeof S_IDX !== 'undefined' && S_IDX[a.id] !== undefined && S_IDX[b.id] !== undefined){
    const leg = pairTime(a, b);
    const median = leg.mins + a.hw/2;
    return { median:r5(median), p90:r5(median + a.hw*0.4 + 4*leg.transfers),
             transfers:leg.transfers, direct:leg.transfers===0, verified:false };
  }

  if (!fromCalc && typeof calcCommute === 'function') return calcCommute(a.id, b ? b.id : destId);
  return { median:25, p90:29, transfers:0, direct:true, verified:false, walkOnly:false };
}

function commute(stationId, destId, fromCalc){
  if (!fromCalc && typeof calcCommute === 'function' && typeof state !== 'undefined' && state.corridor && state.corridor !== 'keikyu'){
    return calcCommute(stationId, destId);
  }
  return keikyuCommute(stationId, destId, fromCalc);
}
function r5(x){ return Math.round(x*2)/2; }

/* effective monthly cost — canonical formula from the feature-mart plan */
function effCost(l){
  if (l.rent == null) return null;
  const dep = l.deposit_mo != null ? l.deposit_mo * l.rent : (l.deposit_yen || 0);
  const key = l.key_mo     != null ? l.key_mo     * l.rent : (l.key_yen     || 0);
  return Math.round(l.rent + (l.mgmt||0) + (dep + key)/AMORT_MONTHS);
}

/* verified anchors surfaced in the corridor panel */
const ANCHORS = [
  { en:'Through-run at Sengakuji: southbound Asakusa-line trains continue onto the Keikyu main line — one seat to Yokohama.',
    ja:'泉岳寺で直通：浅草線南行はそのまま京急本線へ — 横浜まで一本。',
    src:'asakusastation.com', tier:'V' },
  { en:'Yokosuka-Chūō → Yokohama 27 min · ¥410 (southern anchor, Round 1).',
    ja:'横須賀中央→横浜 27分・410円（第1ラウンドの南部アンカー）。',
    src:'trip.com', tier:'V' },
  { en:"Ward rent benchmarks: LIFULL HOME'S market-rate pages, 8 wards, weekly Friday update, walk≤10 basis, fetched 2026-09-02.",
    ja:'家賃相場：LIFULL HOME\'S 8区、毎週金曜更新、徒歩10分内基準、2026-09-02取得。',
    src:'homes.co.jp', tier:'V' },
  { en:'Express stop set & station-to-station minutes: typical-scheduled — ODPT timetable adapter queued.',
    ja:'優等停車駅・駅間分数：標準値 — ODPT時刻表アダプタ待ち。',
    src:'—', tier:'E' },
];
