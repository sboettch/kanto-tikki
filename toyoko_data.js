/* HomeTikki · TŌYOKO — data layer.
   Corridor: Shibuya → Yokohama → Motomachi-Chūkagai
   Tōkyū Tōyoko Line (17 stations) + Minatomirai Line (6 stations) = 23 stations.
   Through-run north: Fukutoshin Line at Shibuya.
   Through-run south: Minatomirai Line at Yokohama.

   Rail times: TYPICAL-SCHEDULED (tier E) unless noted.
   Rent benchmarks: tier S, fetched 2026-09-02. */

const GOAL_MIN    = 26.5;
const AMORT_MONTHS = 24;
const FETCHED     = '2026-09-02';
const CORRIDOR_ID = 'toyoko';
const CORRIDOR_LINE_COLOR = '#e6001e';

const WARDS = {
  shibuya:   { en:'Shibuya',    ja:'渋谷区',
               souba:{ '1R':142000,'1K':133000,'1LDK':253000,'2LDK':380000 },
               src:'https://www.homes.co.jp/chintai/tokyo/shibuya-city/price/' },
  meguro:    { en:'Meguro',     ja:'目黒区',
               souba:{ '1R':112000,'1K':121000,'1LDK':216000,'2LDK':324000 },
               src:'https://www.homes.co.jp/chintai/tokyo/meguro-city/price/' },
  setagaya:  { en:'Setagaya',   ja:'世田谷区',
               souba:{ '1R':97000,'1K':108000,'1LDK':175000,'2LDK':260000 },
               src:'https://www.homes.co.jp/chintai/tokyo/setagaya-city/price/' },
  ota:       { en:'Ōta',        ja:'大田区',
               souba:{ '1R':100400,'1K':105100,'1LDK':170100,'2LDK':229500 },
               src:'https://www.homes.co.jp/chintai/tokyo/ota-city/price/' },
  nakahara:  { en:'Nakahara-ku (Kawasaki)', ja:'中原区（川崎市）',
               souba:{ '1R':82000,'1K':95000,'1LDK':148000,'2LDK':213000 },
               src:'https://www.homes.co.jp/chintai/kanagawa/kawasaki_nakahara-city/price/' },
  kohoku:    { en:'Kohoku-ku',  ja:'港北区',
               souba:{ '1R':76000,'1K':90000,'1LDK':145000,'2LDK':205000 },
               src:'https://www.homes.co.jp/chintai/kanagawa/yokohama_kohoku-city/price/' },
  kanagawaku:{ en:'Kanagawa-ku',ja:'神奈川区',
               souba:{ '1R':76000,'1K':89500,'1LDK':157600,'2LDK':206900 },
               src:'https://www.homes.co.jp/chintai/kanagawa/yokohama_kanagawa-city/price/' },
  nishi:     { en:'Nishi-ku',   ja:'西区',
               souba:{ '1R':80900,'1K':90600,'1LDK':166200,'2LDK':238500 },
               src:'https://www.homes.co.jp/chintai/kanagawa/yokohama_nishi-city/price/' },
  naka:      { en:'Naka-ku',    ja:'中区',
               souba:{ '1R':87000,'1K':99000,'1LDK':170000,'2LDK':248000 },
               src:'https://www.homes.co.jp/chintai/kanagawa/yokohama_naka-city/price/' },
};
const SOUBA_NOTE = {
  en:"LIFULL HOME'S ward market rate · walk≤10 basis · updated Fridays · fetched 2026-09-02",
  ja:"LIFULL HOME'S 家賃相場 · 徒歩10分内基準 · 毎週金曜更新 · 2026-09-02取得"
};

const STATIONS = [
  { id:'shibuya',        en:'Shibuya',           ja:'渋谷',           num:'TY01', ward:'shibuya',    cumL:0,  tier:3, hw:3 },
  { id:'daikanyama',     en:'Daikanyama',        ja:'代官山',         num:'TY02', ward:'shibuya',    cumL:2,  tier:1, hw:6 },
  { id:'nakameguro',     en:'Nakameguro',        ja:'中目黒',         num:'TY03', ward:'meguro',     cumL:4,  tier:3, hw:4 },
  { id:'yutenji',        en:'Yutenji',           ja:'祐天寺',         num:'TY04', ward:'meguro',     cumL:6,  tier:1, hw:6 },
  { id:'gakugeidaigaku', en:'Gakugei-daigaku',   ja:'学芸大学',       num:'TY05', ward:'meguro',     cumL:8,  tier:1, hw:6 },
  { id:'toritsu',        en:'Toritsu-daigaku',   ja:'都立大学',       num:'TY06', ward:'meguro',     cumL:10, tier:1, hw:6 },
  { id:'jiyugaoka',      en:'Jiyugaoka',         ja:'自由が丘',       num:'TY07', ward:'meguro',     cumL:12, tier:2, hw:5,
    note:{en:'transfer to Tokyu Oimachi Line',ja:'東急大井町線乗換'} },
  { id:'denencho',       en:'Den-en-chofu',      ja:'田園調布',       num:'TY08', ward:'setagaya',   cumL:14, tier:2, hw:5,
    note:{en:'transfer to Tokyu Meguro Line',ja:'東急目黒線乗換'} },
  { id:'tamagawa',       en:'Tamagawa',          ja:'多摩川',         num:'TY09', ward:'ota',        cumL:16, tier:1, hw:6,
    note:{en:'transfer to Tokyu Tamagawa Line',ja:'東急多摩川線乗換'} },
  { id:'musashikosugi',  en:'Musashi-Kosugi',    ja:'武蔵小杉',       num:'TY10', ward:'nakahara',   cumL:20, tier:3, hw:4,
    note:{en:'also JR Nanboku Rapid and Yokosuka Line',ja:'JR南武線・横須賀線乗換'} },
  { id:'motosumiyoshi',  en:'Motosumiyoshi',     ja:'元住吉',         num:'TY11', ward:'nakahara',   cumL:22, tier:1, hw:6 },
  { id:'hiyoshi',        en:'Hiyoshi',           ja:'日吉',           num:'TY12', ward:'kohoku',     cumL:24, tier:3, hw:4,
    note:{en:'connects to Tokyu/Sotetsu Shin-Yokohama Line (2023)',ja:'東急・相鉄新横浜線（2023年開業）乗換'} },
  { id:'tsunashima',     en:'Tsunashima',        ja:'綱島',           num:'TY13', ward:'kohoku',     cumL:27, tier:2, hw:5 },
  { id:'myorenji',       en:'Myorenji',          ja:'妙蓮寺',         num:'TY14', ward:'kohoku',     cumL:29, tier:1, hw:6 },
  { id:'hakuraku',       en:'Hakuraku',          ja:'白楽',           num:'TY15', ward:'kanagawaku', cumL:31, tier:1, hw:6 },
  { id:'higashihakuraku',en:'Higashi-Hakuraku',  ja:'東白楽',         num:'TY16', ward:'kanagawaku', cumL:33, tier:1, hw:6 },
  { id:'yokohama',       en:'Yokohama',          ja:'横浜',           num:'TY17', ward:'nishi',      cumL:35, tier:3, hw:3,
    note:{en:'connects to JR, Keikyu, Sotetsu, Subway Blue Line',ja:'JR・京急・相鉄・市営地下鉄乗換'} },
  /* Minatomirai Line */
  { id:'shintakashima',  en:'Shin-Takashima',    ja:'新高島',         num:'MM02', ward:'nishi',      cumL:37, tier:1, hw:6, mm:true },
  { id:'minatomirai',    en:'Minatomirai',       ja:'みなとみらい',   num:'MM03', ward:'nishi',      cumL:39, tier:3, hw:4, mm:true },
  { id:'bashamichi',     en:'Bashamichi',        ja:'馬車道',         num:'MM04', ward:'naka',       cumL:41, tier:1, hw:6, mm:true },
  { id:'nihonodori',     en:'Nihon-odori',       ja:'日本大通り',     num:'MM05', ward:'naka',       cumL:43, tier:1, hw:6, mm:true },
  { id:'motomachi',      en:'Motomachi-Chukagai',ja:'元町・中華街',   num:'MM06', ward:'naka',       cumL:45, tier:3, hw:4, mm:true,
    note:{en:'Yamate Bluff, international schools, Chinatown',ja:'山手・中華街・元町'} },
];
const S_IDX = Object.fromEntries(STATIONS.map((s,i) => [s.id, i]));

const CUM_TOKKYU = {
  shibuya:0, jiyugaoka:10, musashikosugi:16, hiyoshi:21, yokohama:30, minatomirai:34, motomachi:40
};
const CUM_KAISOKU = {
  shibuya:0, nakameguro:3, jiyugaoka:9, denencho:12, musashikosugi:16,
  hiyoshi:21, tsunashima:24, yokohama:30, minatomirai:34, motomachi:40
};
function cumFor(st, table){ return table[st.id]; }

const DESTS = [
  { id:'shibuya',      st:'shibuya',      en:'Shibuya',             ja:'渋谷' },
  { id:'nakameguro',   st:'nakameguro',   en:'Nakameguro',          ja:'中目黒' },
  { id:'yokohama',     st:'yokohama',     en:'Yokohama',            ja:'横浜' },
  { id:'motomachi',    st:'motomachi',    en:'Motomachi-Chukagai',  ja:'元町・中華街' },
  { id:'musashikosugi',st:'musashikosugi',en:'Musashi-Kosugi',      ja:'武蔵小杉' },
  { id:'hiyoshi',      st:'hiyoshi',      en:'Hiyoshi',             ja:'日吉' },
];

function pairTime(a, b){
  let best = Math.abs(a.cumL - b.cumL), transfers = 0;
  for (const table of [CUM_TOKKYU, CUM_KAISOKU]){
    const ca = cumFor(a, table), cb = cumFor(b, table);
    if (ca !== undefined && cb !== undefined){
      const v = Math.abs(ca - cb);
      if (v < best){ best = v; transfers = 0; }
    }
  }
  const dir = S_IDX[b.id] > S_IDX[a.id] ? 1 : -1;
  for (const table of [CUM_TOKKYU, CUM_KAISOKU]){
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
  { en:'Tokyu Toyoko Line runs through to Tokyo Metro Fukutoshin Line at Shibuya — one seat north to Ikebukuro, Shinjuku-sanchome, and Kotake-Mukaihara (then Tobu Tojo / Seibu Ikebukuro lines).',
    ja:'渋谷で東横線と副都心線は直通 — 池袋・新宿三丁目・小竹向原（東武東上線・西武池袋線）へ一本。',
    src:'Tokyu Corporation route guide', tier:'V' },
  { en:'Minatomirai Line: 6 stations from Yokohama to Motomachi-Chukagai, no transfer at Yokohama.',
    ja:'みなとみらい線：横浜から元町・中華街まで6駅、横浜駅での乗換不要。',
    src:'Yokohama Minatomirai Railway', tier:'V' },
  { en:'Hiyoshi connects to the Tokyu/Sotetsu Shin-Yokohama Line (opened 2023) — direct to Shin-Yokohama Shinkansen and Sotetsu main line.',
    ja:'日吉から東急・相鉄新横浜線（2023年開業）で新横浜（新幹線）・相鉄線直通。',
    src:'Tokyu Corporation, 2023', tier:'V' },
  { en:"Ward rent benchmarks: LIFULL HOME'S, weekly Friday update, walk<=10 basis, fetched 2026-09-02.",
    ja:"家賃相場：LIFULL HOME'S 週次金曜更新・徒歩10分内基準・2026-09-02取得。",
    src:'homes.co.jp', tier:'V' },
  { en:'Express stop set and station minutes: typical-scheduled (tier E).',
    ja:'優等停車駅・駅間分数：標準値（E）。', src:'—', tier:'E' },
];
