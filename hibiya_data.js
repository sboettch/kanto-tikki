/* HomeTikki · HIBIYA — data layer.
   Corridor: Naka-Meguro → Kita-Senju (Tokyo Metro Hibiya Line, 20 stations).
   Through-run northeast: Tobu Skytree Line at Kita-Senju (Soka, Kasukabe, etc.)
   Note: Ningyocho (H-12) is the same physical station as on the keikyu corridor.
   PLAZA HOMES core territory: Hiroo, Roppongi, Ebisu, Toranomon.
   Rail times: TYPICAL-SCHEDULED (tier E). Rent benchmarks: tier S, 2026-09-02. */

const GOAL_MIN     = 30;
const AMORT_MONTHS = 24;
const FETCHED      = '2026-09-02';
const CORRIDOR_ID  = 'hibiya';
const CORRIDOR_LINE_COLOR = '#9fa0a0';   /* Hibiya silver-grey */

const WARDS = {
  meguro:    { en:'Meguro',    ja:'目黒区',
               souba:{ '1R':112000,'1K':121000,'1LDK':216000,'2LDK':324000 },
               src:'https://www.homes.co.jp/chintai/tokyo/meguro-city/price/' },
  shibuya:   { en:'Shibuya',  ja:'渋谷区',
               souba:{ '1R':142000,'1K':133000,'1LDK':253000,'2LDK':380000 },
               src:'https://www.homes.co.jp/chintai/tokyo/shibuya-city/price/' },
  minato:    { en:'Minato',   ja:'港区',
               souba:{ '1R':177400,'1K':147000,'1LDK':292200,'2LDK':467000 },
               src:'https://www.homes.co.jp/chintai/tokyo/minato-city/price/' },
  chuo:      { en:'Chuo',     ja:'中央区',
               souba:{ '1R':156000,'1K':134300,'1LDK':234000,'2LDK':328200 },
               src:'https://www.homes.co.jp/chintai/tokyo/chuo-city/price/' },
  taito:     { en:'Taito',    ja:'台東区',
               souba:{ '1R':88000,'1K':103000,'1LDK':170000,'2LDK':249000 },
               src:'https://www.homes.co.jp/chintai/tokyo/taito-city/price/' },
  arakawa:   { en:'Arakawa',  ja:'荒川区',
               souba:{ '1R':69000,'1K':81000,'1LDK':120000,'2LDK':178000 },
               src:'https://www.homes.co.jp/chintai/tokyo/arakawa-city/price/' },
  adachi:    { en:'Adachi',   ja:'足立区',
               souba:{ '1R':60000,'1K':72000,'1LDK':103000,'2LDK':147000 },
               src:'https://www.homes.co.jp/chintai/tokyo/adachi-city/price/' },
};
const SOUBA_NOTE = {
  en:"LIFULL HOME'S ward market rate · walk<=10 basis · updated Fridays · fetched 2026-09-02",
  ja:"LIFULL HOME'S 家賃相場 · 徒歩10分内基準 · 毎週金曜更新 · 2026-09-02取得"
};

/* cumL = typical local minutes from Naka-Meguro (tier E) */
const STATIONS = [
  { id:'nakameguro',  en:'Naka-Meguro',    ja:'中目黒',     num:'H-01', ward:'meguro',  cumL:0,   tier:3, hw:3,
    note:{en:'transfer to Tokyu Toyoko Line',ja:'東急東横線乗換'} },
  { id:'ebisu',       en:'Ebisu',          ja:'恵比寿',     num:'H-02', ward:'shibuya', cumL:3,   tier:2, hw:4,
    note:{en:'also JR Yamanote/Saikyo lines',ja:'JR山手線・埼京線乗換'} },
  { id:'hiroo',       en:'Hiroo',          ja:'広尾',       num:'H-03', ward:'minato',  cumL:6,   tier:1, hw:6,
    note:{en:'embassy district, National Azabu, PLAZA HOMES core',ja:'大使館街、ナショナル麻布、PLAZA HOMESの本拠地'} },
  { id:'roppongi',    en:'Roppongi',       ja:'六本木',     num:'H-04', ward:'minato',  cumL:9,   tier:2, hw:4,
    note:{en:'also Tokyo Metro Oedo Line',ja:'都営大江戸線乗換'} },
  { id:'kamiyacho',   en:'Kamiyacho',      ja:'神谷町',     num:'H-05', ward:'minato',  cumL:12,  tier:1, hw:6 },
  { id:'toranomonhills',en:'Toranomon Hills',ja:'虎ノ門ヒルズ',num:'H-06',ward:'minato', cumL:14,  tier:2, hw:4,
    note:{en:'opened 2020; Toranomon Hills business district',ja:'2020年開業。虎ノ門ヒルズビジネス地区'} },
  { id:'ginza',       en:'Ginza',          ja:'銀座',       num:'H-07', ward:'chuo',    cumL:17,  tier:3, hw:3,
    note:{en:'also Tokyo Metro Marunouchi and Ginza lines',ja:'東京メトロ丸ノ内線・銀座線乗換'} },
  { id:'higashiginza',en:'Higashi-Ginza',  ja:'東銀座',     num:'H-08', ward:'chuo',    cumL:19,  tier:1, hw:6,
    note:{en:'Kabukiza Theatre above the station',ja:'歌舞伎座が直上'} },
  { id:'tsukiji',     en:'Tsukiji',        ja:'築地',       num:'H-09', ward:'chuo',    cumL:21,  tier:1, hw:6,
    note:{en:'outer market still active; new Toyosu market 2018',ja:'場外市場は現役。豊洲市場は2018年移転'} },
  { id:'hatchobori',  en:'Hatchobori',     ja:'八丁堀',     num:'H-10', ward:'chuo',    cumL:23,  tier:1, hw:6,
    note:{en:'also JR Keiyo Line',ja:'JR京葉線乗換'} },
  { id:'kayabacho',   en:'Kayabacho',      ja:'茅場町',     num:'H-11', ward:'chuo',    cumL:25,  tier:2, hw:5,
    note:{en:'also Tokyo Metro Tozai Line; financial district',ja:'東西線乗換。金融街'} },
  { id:'ningyocho',   en:'Ningyocho',      ja:'人形町',     num:'H-12', ward:'chuo',    cumL:27,  tier:2, hw:5,
    note:{en:'also Toei Asakusa Line (A-14) — connects to the Keikyu corridor',ja:'都営浅草線（A-14）乗換 — 京急沿線へ直通'} },
  { id:'kodemmacho',  en:'Kodemmacho',     ja:'小伝馬町',   num:'H-13', ward:'chuo',    cumL:29,  tier:1, hw:6 },
  { id:'akihabara',   en:'Akihabara',      ja:'秋葉原',     num:'H-14', ward:'taito',   cumL:31,  tier:2, hw:5,
    note:{en:'also JR Sobu/Chuo and Tsukuba Express; electronics district',ja:'JR総武線・つくばエクスプレス乗換。電気街'} },
  { id:'nakaokachimachi',en:'Naka-Okachimachi',ja:'仲御徒町',num:'H-15',ward:'taito',   cumL:33,  tier:1, hw:6 },
  { id:'ueno',        en:'Ueno',           ja:'上野',       num:'H-16', ward:'taito',   cumL:35,  tier:3, hw:3,
    note:{en:'JR Yamanote/Utsunomiya/Keihin-Tohoku; Ueno Park, National Museum',ja:'JR山手線ほか多数。上野公園、国立博物館'} },
  { id:'iriya',       en:'Iriya',          ja:'入谷',       num:'H-17', ward:'taito',   cumL:37,  tier:1, hw:6 },
  { id:'minowa',      en:'Minowa',         ja:'三ノ輪',     num:'H-18', ward:'arakawa', cumL:39,  tier:1, hw:6,
    note:{en:'last surviving Tokyo tram (Arakawa Line) terminus nearby',ja:'都電荒川線（東京さくらトラム）乗換'} },
  { id:'minamishnju', en:'Minami-Senju',   ja:'南千住',     num:'H-19', ward:'arakawa', cumL:42,  tier:2, hw:5,
    note:{en:'JR Joban Line; rapid redevelopment area',ja:'JR常磐線乗換。再開発エリア'} },
  { id:'kitasenju',   en:'Kita-Senju',     ja:'北千住',     num:'H-20', ward:'adachi',  cumL:46,  tier:3, hw:3,
    note:{en:'major hub — JR Joban, Tobu Skytree, Tsukuba Express, Tokyo Metro Chiyoda; Tobu through-run continues north',ja:'JR常磐線・東武スカイツリー線・つくばエクスプレス・千代田線。東武線で北へ直通'} },
];
const S_IDX = Object.fromEntries(STATIONS.map((s,i) => [s.id, i]));

/* Express tables — Hibiya runs limited-express (S-Train) and regular service */
const CUM_RAPID = {
  nakameguro:0, ebisu:2, roppongi:7, toranomonhills:11, ginza:14,
  kayabacho:21, ningyocho:23, akihabara:26, ueno:30, minamishnju:35, kitasenju:38
};
function cumFor(st, table){ return table[st.id]; }

const DESTS = [
  { id:'ginza',      st:'ginza',      en:'Ginza',          ja:'銀座' },
  { id:'roppongi',   st:'roppongi',   en:'Roppongi',       ja:'六本木' },
  { id:'hiroo',      st:'hiroo',      en:'Hiroo',          ja:'広尾' },
  { id:'ueno',       st:'ueno',       en:'Ueno',           ja:'上野' },
  { id:'ningyocho',  st:'ningyocho',  en:'Ningyocho',      ja:'人形町' },
  { id:'nakameguro', st:'nakameguro', en:'Naka-Meguro',    ja:'中目黒' },
  { id:'kitasenju',  st:'kitasenju',  en:'Kita-Senju',     ja:'北千住' },
];

function pairTime(a, b){
  let best = Math.abs(a.cumL - b.cumL), transfers = 0;
  const ca = cumFor(a, CUM_RAPID), cb = cumFor(b, CUM_RAPID);
  if (ca !== undefined && cb !== undefined){
    const v = Math.abs(ca - cb);
    if (v < best){ best = v; transfers = 0; }
  }
  const dir = S_IDX[b.id] > S_IDX[a.id] ? 1 : -1;
  const cbr = cumFor(b, CUM_RAPID);
  if (cbr !== undefined){
    for (let i = S_IDX[a.id]+dir; i>=0 && i<STATIONS.length; i+=dir){
      const m = STATIONS[i], cm = cumFor(m, CUM_RAPID);
      if (cm !== undefined){
        const v = Math.abs(a.cumL - m.cumL) + 3 + Math.abs(cm - cbr);
        if (v + 0.001 < best){ best = v; transfers = 1; }
        break;
      }
    }
  }
  return { mins: best, transfers };
}
function commute(stationId, destId){
  const a = STATIONS[S_IDX[stationId]];
  if (!a) return { median:0, p90:0, transfers:0, direct:true, verified:false };
  const dest = DESTS.find(d => d.id === destId) || DESTS[0];
  const b = STATIONS[S_IDX[dest.st]];
  if (!b || a.id === b.id) return { median:0, p90:0, transfers:0, direct:true, verified:true, walkOnly:true };
  const leg = pairTime(a, b);
  const median = leg.mins + a.hw/2;
  return { median:r5(median), p90:r5(median + a.hw*0.4 + 4*leg.transfers),
           transfers:leg.transfers, direct:leg.transfers===0, verified:false };
}
function r5(x){ return Math.round(x*2)/2; }
function effCost(l){
  if (l.rent == null) return null;
  const dep = l.deposit_mo != null ? l.deposit_mo * l.rent : (l.deposit_yen || 0);
  const key = l.key_mo     != null ? l.key_mo     * l.rent : (l.key_yen     || 0);
  return Math.round(l.rent + (l.mgmt||0) + (dep + key)/AMORT_MONTHS);
}

const ANCHORS = [
  { en:'Ningyocho (H-12) is the same station as Toei Asakusa A-14 — direct connection to the Keikyu corridor south to Yokohama and north to Asakusa.',
    ja:'人形町（H-12）は都営浅草線A-14と同一駅 — 京急沿線（横浜・浅草方面）へ直結。',
    src:'Tokyo Metro / Toei station maps', tier:'V' },
  { en:'Toranomon Hills station opened June 2020 — added H-06 stop in the Toranomon Hills redevelopment zone.',
    ja:'虎ノ門ヒルズ駅は2020年6月開業。虎ノ門ヒルズ再開発に合わせ新設。',
    src:'Tokyo Metro, 2020', tier:'V' },
  { en:'Kita-Senju through-runs with the Tobu Skytree Line — no transfer to Soka, Kasukabe and beyond.',
    ja:'北千住から東武スカイツリー線に直通 — 草加・春日部方面へ乗換不要。',
    src:'Tobu Railway', tier:'V' },
  { en:"Ward rent benchmarks: LIFULL HOME'S, weekly Friday update, walk<=10 basis, fetched 2026-09-02.",
    ja:"家賃相場：LIFULL HOME'S 週次金曜更新・徒歩10分内基準・2026-09-02取得。",
    src:'homes.co.jp', tier:'V' },
  { en:'Station minutes: typical-scheduled (tier E).',
    ja:'所要分数：標準値（E）。', src:'—', tier:'E' },
];
