/* HomeTikki · ODAKYU — data layer.
   Corridor: Shinjuku → Shin-Yurigaoka (Odakyu Odawara Line, practical Tokyo/Kanagawa range).
   Through-run: Tokyo Metro Chiyoda Line via Yoyogi-Uehara (no transfer).
   Key appeal: Shimokitazawa (music/vintage), Seijo, Komae, Machida corridor.
   Romancecar Ltd-exp to Odawara/Hakone also departs Shinjuku — not modeled here.
   Rail times: TYPICAL-SCHEDULED (tier E). Rent benchmarks: tier S, 2026-09-02. */

const GOAL_MIN     = 30;
const AMORT_MONTHS = 24;
const FETCHED      = '2026-09-02';
const CORRIDOR_ID  = 'odakyu';
const CORRIDOR_LINE_COLOR = '#0072bc';   /* Odakyu blue */

const WARDS = {
  shinjuku:  { en:'Shinjuku',     ja:'新宿区',
               souba:{ '1R':115000,'1K':117000,'1LDK':208000,'2LDK':313000 },
               src:'https://www.homes.co.jp/chintai/tokyo/shinjuku-city/price/' },
  shibuya:   { en:'Shibuya',      ja:'渋谷区',
               souba:{ '1R':142000,'1K':133000,'1LDK':253000,'2LDK':380000 },
               src:'https://www.homes.co.jp/chintai/tokyo/shibuya-city/price/' },
  setagaya:  { en:'Setagaya',     ja:'世田谷区',
               souba:{ '1R':97000,'1K':108000,'1LDK':175000,'2LDK':260000 },
               src:'https://www.homes.co.jp/chintai/tokyo/setagaya-city/price/' },
  komae:     { en:'Komae',        ja:'狛江市',
               souba:{ '1R':72000,'1K':82000,'1LDK':122000,'2LDK':172000 },
               src:'https://www.homes.co.jp/chintai/tokyo/komae-city/price/' },
  kawasaki_tama:{ en:'Tama-ku (Kawasaki)', ja:'多摩区（川崎市）',
               souba:{ '1R':66000,'1K':77000,'1LDK':114000,'2LDK':159000 },
               src:'https://www.homes.co.jp/chintai/kanagawa/kawasaki_tama-city/price/' },
  machida:   { en:'Machida',      ja:'町田市',
               souba:{ '1R':57000,'1K':67000,'1LDK':99000,'2LDK':140000 },
               src:'https://www.homes.co.jp/chintai/tokyo/machida-city/price/' },
};
const SOUBA_NOTE = {
  en:"LIFULL HOME'S ward market rate · walk<=10 basis · updated Fridays · fetched 2026-09-02",
  ja:"LIFULL HOME'S 家賃相場 · 徒歩10分内基準 · 毎週金曜更新 · 2026-09-02取得"
};

/* cumL = typical local minutes from Shinjuku */
const STATIONS = [
  { id:'shinjuku',       en:'Shinjuku',           ja:'新宿',         num:'OH01', ward:'shinjuku',  cumL:0,   tier:3, hw:3,
    note:{en:'major terminus — JR lines, multiple Metro lines, Toei Shinjuku/Oedo lines',ja:'JR・東京メトロ・都営地下鉄多数'} },
  { id:'minamishinjuku', en:'Minami-Shinjuku',    ja:'南新宿',       num:'OH02', ward:'shinjuku',  cumL:2,   tier:1, hw:6 },
  { id:'sangubashi',     en:'Sangubashi',          ja:'参宮橋',       num:'OH03', ward:'shibuya',   cumL:4,   tier:1, hw:6,
    note:{en:'Meiji Jingu Gaien nearby',ja:'明治神宮外苑近く'} },
  { id:'yoyogihachiman', en:'Yoyogi-Hachiman',     ja:'代々木八幡',   num:'OH04', ward:'shibuya',   cumL:6,   tier:1, hw:6 },
  { id:'yoyogiuehara',   en:'Yoyogi-Uehara',       ja:'代々木上原',   num:'OH05', ward:'shibuya',   cumL:8,   tier:3, hw:4,
    note:{en:'Chiyoda Line through-run — no transfer to Omote-Sando, Kasumigaseki, Toride',ja:'千代田線直通 — 表参道・霞が関・取手方面へ乗換不要'} },
  { id:'higashikitazawa', en:'Higashi-Kitazawa',   ja:'東北沢',       num:'OH06', ward:'setagaya',  cumL:10,  tier:1, hw:6 },
  { id:'shimokitazawa',  en:'Shimokitazawa',        ja:'下北沢',       num:'OH07', ward:'setagaya',  cumL:12,  tier:2, hw:5,
    note:{en:'also Keio Inokashira Line; indie music, vintage, theatre, ramen',ja:'京王井の頭線乗換。インディ音楽・古着・演劇・ラーメン'} },
  { id:'setagayadaita',  en:'Setagaya-Daita',       ja:'世田谷代田',   num:'OH08', ward:'setagaya',  cumL:14,  tier:1, hw:6 },
  { id:'umegaoka',       en:'Umegaoka',             ja:'梅ヶ丘',       num:'OH09', ward:'setagaya',  cumL:16,  tier:1, hw:6 },
  { id:'gotokuji',       en:'Gotokuji',             ja:'豪徳寺',       num:'OH10', ward:'setagaya',  cumL:18,  tier:1, hw:6,
    note:{en:'Gotokuji temple — lucky cat (maneki-neko) origin site',ja:'豪徳寺 — 招き猫発祥の地'} },
  { id:'kyodo',          en:'Kyodo',                ja:'経堂',         num:'OH11', ward:'setagaya',  cumL:20,  tier:2, hw:5 },
  { id:'seijogakuinmae', en:'Seijogakuin-mae',      ja:'成城学園前',   num:'OH12', ward:'setagaya',  cumL:23,  tier:3, hw:4,
    note:{en:'Seijo — one of Tokyo\'s top old-money residential areas',ja:'成城 — 東京屈指の高級住宅地'} },
  { id:'chitosefunabashi',en:'Chitose-Funabashi',   ja:'千歳船橋',     num:'OH13', ward:'setagaya',  cumL:26,  tier:1, hw:6 },
  { id:'soshigaya',      en:'Soshigaya-Okura',       ja:'祖師ヶ谷大蔵', num:'OH14', ward:'setagaya',  cumL:29,  tier:1, hw:6,
    note:{en:'Ultraman Museum — series was filmed in this neighbourhood',ja:'ウルトラマン商店街 — 撮影地'} },
  { id:'komae',          en:'Komae',                ja:'狛江',         num:'OH15', ward:'komae',     cumL:32,  tier:2, hw:5 },
  { id:'izumitamagawa',  en:'Izumi-Tamagawa',        ja:'和泉多摩川',   num:'OH16', ward:'komae',     cumL:35,  tier:1, hw:6 },
  { id:'noborito',       en:'Noborito',             ja:'登戸',         num:'OH17', ward:'kawasaki_tama',cumL:38,tier:3, hw:4,
    note:{en:'also JR Nambu Line; Doraemon Museum nearby',ja:'JR南武線乗換。藤子・F・不二雄ミュージアム近く'} },
  { id:'mukogaoka',      en:'Mukogaoka-Yuen',        ja:'向ヶ丘遊園',   num:'OH18', ward:'kawasaki_tama',cumL:41,tier:1, hw:6 },
  { id:'ikuta',          en:'Ikuta',                ja:'生田',         num:'OH19', ward:'kawasaki_tama',cumL:44,tier:1, hw:6 },
  { id:'yomiko',         en:'Yomiuri-Land-Mae',      ja:'読売ランド前', num:'OH20', ward:'kawasaki_tama',cumL:47,tier:1, hw:6 },
  { id:'tama',           en:'Tama',                 ja:'多摩',         num:'OH21', ward:'kawasaki_tama',cumL:50,tier:1, hw:6,
    note:{en:'also Odakyu Enoshima Line branches here toward Enoshima/Katase',ja:'江ノ島線分岐 — 片瀬江ノ島方面'} },
  { id:'karakida',       en:'Karakida',             ja:'唐木田',       num:'OH22', ward:'machida',   cumL:53,  tier:2, hw:5 },
  { id:'tsurukawa',      en:'Tsurukawa',            ja:'鶴川',         num:'OH23', ward:'machida',   cumL:55,  tier:2, hw:5 },
  { id:'machida',        en:'Machida',              ja:'町田',         num:'OH24', ward:'machida',   cumL:58,  tier:3, hw:4,
    note:{en:'also JR Yokohama Line; major shopping city, terminus for many',ja:'JR横浜線乗換。大型商業都市。多くの人の終点'} },
];
const S_IDX = Object.fromEntries(STATIONS.map((s,i) => [s.id, i]));

const CUM_TOKKYU = { shinjuku:0, yoyogiuehara:6, shimokitazawa:9, kyodo:15, seijogakuinmae:18, komae:24, noborito:30, machida:44 };
const CUM_KAISOKU = { shinjuku:0, yoyogiuehara:6, shimokitazawa:9, seijogakuinmae:18, komae:24, noborito:30, machida:44 };
function cumFor(st, table){ return table[st.id]; }

const DESTS = [
  { id:'shinjuku',      st:'shinjuku',       en:'Shinjuku',          ja:'新宿' },
  { id:'shimokitazawa', st:'shimokitazawa',  en:'Shimokitazawa',     ja:'下北沢' },
  { id:'yoyogiuehara',  st:'yoyogiuehara',   en:'Yoyogi-Uehara',     ja:'代々木上原' },
  { id:'seijogakuinmae',st:'seijogakuinmae', en:'Seijogakuin-mae',   ja:'成城学園前' },
  { id:'noborito',      st:'noborito',       en:'Noborito',          ja:'登戸' },
  { id:'machida',       st:'machida',        en:'Machida',           ja:'町田' },
];

function pairTime(a, b){
  let best = Math.abs(a.cumL - b.cumL), transfers = 0;
  for (const table of [CUM_TOKKYU, CUM_KAISOKU]){
    const ca=cumFor(a,table), cb=cumFor(b,table);
    if(ca!==undefined&&cb!==undefined){const v=Math.abs(ca-cb);if(v<best){best=v;transfers=0;}}
  }
  const dir=S_IDX[b.id]>S_IDX[a.id]?1:-1;
  for(const table of [CUM_TOKKYU,CUM_KAISOKU]){
    const cb=cumFor(b,table); if(cb===undefined) continue;
    for(let i=S_IDX[a.id]+dir;i>=0&&i<STATIONS.length;i+=dir){
      const m=STATIONS[i],cm=cumFor(m,table);
      if(cm!==undefined){const v=Math.abs(a.cumL-m.cumL)+3+Math.abs(cm-cb);if(v+0.001<best){best=v;transfers=1;}break;}
    }
  }
  return {mins:best,transfers};
}
function commute(stationId, destId){
  const a=STATIONS[S_IDX[stationId]]; if(!a) return {median:0,p90:0,transfers:0,direct:true,verified:false};
  const dest=DESTS.find(d=>d.id===destId)||DESTS[0];
  const b=STATIONS[S_IDX[dest.st]]; if(!b||a.id===b.id) return {median:0,p90:0,transfers:0,direct:true,verified:true,walkOnly:true};
  const leg=pairTime(a,b); const median=leg.mins+a.hw/2;
  return {median:r5(median),p90:r5(median+a.hw*0.4+4*leg.transfers),transfers:leg.transfers,direct:leg.transfers===0,verified:false};
}
function r5(x){ return Math.round(x*2)/2; }
function effCost(l){
  if(l.rent==null) return null;
  const dep=l.deposit_mo!=null?l.deposit_mo*l.rent:(l.deposit_yen||0);
  const key=l.key_mo!=null?l.key_mo*l.rent:(l.key_yen||0);
  return Math.round(l.rent+(l.mgmt||0)+(dep+key)/AMORT_MONTHS);
}

const ANCHORS = [
  { en:'Yoyogi-Uehara through-runs with Tokyo Metro Chiyoda Line — no transfer to Omotesando (C04), Kasumigaseki (C08), and northeast to Toride (JR Joban through-run).',
    ja:'代々木上原で千代田線に直通 — 表参道・霞が関・取手（JR常磐線）方面へ乗換不要。',
    src:'Odakyu Electric Railway route guide', tier:'V' },
  { en:'Shimokitazawa: compact music, vintage clothing, and theatre district. One of the most English-discussed Tokyo neighbourhoods.',
    ja:'下北沢：インディ音楽・古着・演劇の街。英語メディアでも最も取り上げられる東京の街の一つ。',
    src:'general knowledge', tier:'E' },
  { en:"Ward rent benchmarks: LIFULL HOME'S, weekly Friday update, walk<=10 basis, fetched 2026-09-02.",
    ja:"家賃相場：LIFULL HOME'S 週次金曜更新・徒歩10分内基準・2026-09-02取得。",
    src:'homes.co.jp', tier:'V' },
  { en:'Station minutes: typical-scheduled (tier E).', ja:'所要分数：標準値（E）。', src:'—', tier:'E' },
];
