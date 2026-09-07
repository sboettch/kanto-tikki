/* HomeTikki · DEN-EN-TOSHI — data layer.
   Corridor: Shibuya → Chuo-Rinkan (Tokyu Den-en-toshi Line, 24 stations).
   Through-run north: Hanzomon Line at Shibuya → Tobu Skytree Line east.
   Home of Rakuten, wide suburban parks, and a real rent gradient.
   Rail times: TYPICAL-SCHEDULED (tier E). Rent benchmarks: tier S, 2026-09-02. */

const GOAL_MIN     = 30;
const AMORT_MONTHS = 24;
const FETCHED      = '2026-09-02';
const CORRIDOR_ID  = 'denentoshi';
const CORRIDOR_LINE_COLOR = '#00a650';   /* Tokyu Den-en-toshi green */

const WARDS = {
  shibuya:   { en:'Shibuya',      ja:'渋谷区',
               souba:{ '1R':142000,'1K':133000,'1LDK':253000,'2LDK':380000 },
               src:'https://www.homes.co.jp/chintai/tokyo/shibuya-city/price/' },
  setagaya:  { en:'Setagaya',     ja:'世田谷区',
               souba:{ '1R':97000,'1K':108000,'1LDK':175000,'2LDK':260000 },
               src:'https://www.homes.co.jp/chintai/tokyo/setagaya-city/price/' },
  takatsu:   { en:'Takatsu-ku (Kawasaki)', ja:'高津区（川崎市）',
               souba:{ '1R':76000,'1K':91000,'1LDK':139000,'2LDK':195000 },
               src:'https://www.homes.co.jp/chintai/kanagawa/kawasaki_takatsu-city/price/' },
  miyamae:   { en:'Miyamae-ku (Kawasaki)', ja:'宮前区（川崎市）',
               souba:{ '1R':74000,'1K':87000,'1LDK':132000,'2LDK':185000 },
               src:'https://www.homes.co.jp/chintai/kanagawa/kawasaki_miyamae-city/price/' },
  aoba:      { en:'Aoba-ku (Yokohama)',    ja:'青葉区（横浜市）',
               souba:{ '1R':67000,'1K':80000,'1LDK':127000,'2LDK':182000 },
               src:'https://www.homes.co.jp/chintai/kanagawa/yokohama_aoba-city/price/' },
  yamato:    { en:'Yamato',        ja:'大和市',
               souba:{ '1R':58000,'1K':70000,'1LDK':105000,'2LDK':149000 },
               src:'https://www.homes.co.jp/chintai/kanagawa/yamato-city/price/' },
};
const SOUBA_NOTE = {
  en:"LIFULL HOME'S ward market rate · walk<=10 basis · updated Fridays · fetched 2026-09-02",
  ja:"LIFULL HOME'S 家賃相場 · 徒歩10分内基準 · 毎週金曜更新 · 2026-09-02取得"
};

/* cumL = typical local minutes from Shibuya */
const STATIONS = [
  { id:'shibuya',       en:'Shibuya',              ja:'渋谷',           num:'DT01', ward:'shibuya',  cumL:0,   tier:3, hw:3 },
  { id:'ikejiriohashi', en:'Ikejiri-Ohashi',        ja:'池尻大橋',       num:'DT02', ward:'setagaya', cumL:3,   tier:1, hw:6 },
  { id:'sangenjaya',    en:'Sangenjaya',            ja:'三軒茶屋',       num:'DT03', ward:'setagaya', cumL:5,   tier:2, hw:5,
    note:{en:'also Tokyu Setagaya Line (tram)',ja:'東急世田谷線乗換'} },
  { id:'komazawa',      en:'Komazawa-daigaku',      ja:'駒沢大学',       num:'DT04', ward:'setagaya', cumL:8,   tier:1, hw:6 },
  { id:'sakurashinmachi',en:'Sakurashinmachi',      ja:'桜新町',         num:'DT05', ward:'setagaya', cumL:11,  tier:1, hw:6 },
  { id:'yoga',          en:'Yoga',                  ja:'用賀',           num:'DT06', ward:'setagaya', cumL:14,  tier:2, hw:5 },
  { id:'futakotamagawa',en:'Futako-Tamagawa',       ja:'二子玉川',       num:'DT07', ward:'setagaya', cumL:17,  tier:3, hw:4,
    note:{en:'also Tokyu Oimachi Line; Tama River riverfront, Rise shopping',ja:'東急大井町線乗換。多摩川河川敷、ライズ複合施設'} },
  { id:'futakoshinchi', en:'Futako-Shinchi',         ja:'二子新地',       num:'DT08', ward:'takatsu',  cumL:19,  tier:1, hw:6 },
  { id:'takatsu',       en:'Takatsu',               ja:'高津',           num:'DT09', ward:'takatsu',  cumL:21,  tier:1, hw:6 },
  { id:'mizonokuchi',   en:'Mizonokuchi',            ja:'溝の口',         num:'DT10', ward:'takatsu',  cumL:23,  tier:3, hw:4,
    note:{en:'also JR Nambu Line (Musashi-Mizonokuchi)',ja:'JR南武線（武蔵溝ノ口）乗換'} },
  { id:'kajigaya',      en:'Kajigaya',               ja:'梶が谷',         num:'DT11', ward:'miyamae',  cumL:26,  tier:1, hw:6 },
  { id:'miyamaedaira',  en:'Miyamaedaira',           ja:'宮前平',         num:'DT12', ward:'miyamae',  cumL:28,  tier:1, hw:6 },
  { id:'miyazakidai',   en:'Miyazakidai',            ja:'宮崎台',         num:'DT13', ward:'miyamae',  cumL:31,  tier:1, hw:6 },
  { id:'azamino',       en:'Azamino',                ja:'あざみ野',       num:'DT14', ward:'aoba',     cumL:34,  tier:2, hw:5,
    note:{en:'also Yokohama Municipal Subway Blue Line',ja:'横浜市営地下鉄ブルーライン乗換'} },
  { id:'eda',           en:'Eda',                    ja:'江田',           num:'DT15', ward:'aoba',     cumL:37,  tier:1, hw:6 },
  { id:'ichigaooka',    en:'Ichigao',                ja:'市が尾',         num:'DT16', ward:'aoba',     cumL:40,  tier:1, hw:6 },
  { id:'aobadai',       en:'Aobadai',                ja:'青葉台',         num:'DT17', ward:'aoba',     cumL:43,  tier:2, hw:5 },
  { id:'tana',          en:'Tana',                   ja:'田奈',           num:'DT18', ward:'aoba',     cumL:46,  tier:1, hw:6 },
  { id:'nagatsuta',     en:'Nagatsuta',              ja:'長津田',         num:'DT19', ward:'aoba',     cumL:48,  tier:3, hw:4,
    note:{en:'also JR Yokohama Line and Tokyu Kodomo-no-Kuni Line',ja:'JR横浜線・東急こどもの国線乗換'} },
  { id:'tsukushino',    en:'Tsukushino',             ja:'つくし野',       num:'DT20', ward:'aoba',     cumL:51,  tier:1, hw:6 },
  { id:'suzukakedai',   en:'Suzukakedai',            ja:'すずかけ台',     num:'DT21', ward:'yamato',   cumL:54,  tier:1, hw:6 },
  { id:'minamimachida', en:'Minami-Machida GP',      ja:'南町田グランベリーパーク', num:'DT22', ward:'yamato', cumL:57, tier:2, hw:5,
    note:{en:'Grand Berry Park outlet mall',ja:'グランベリーパークアウトレット'} },
  { id:'tsukimino',     en:'Tsukimino',              ja:'つきみ野',       num:'DT23', ward:'yamato',   cumL:60,  tier:1, hw:6 },
  { id:'chuorinkan',    en:'Chuo-Rinkan',            ja:'中央林間',       num:'DT24', ward:'yamato',   cumL:62,  tier:3, hw:4,
    note:{en:'also Odakyu Enoshima Line; Sōtetsu main line via Yamato',ja:'小田急江ノ島線・相鉄線（大和経由）乗換'} },
];
const S_IDX = Object.fromEntries(STATIONS.map((s,i) => [s.id, i]));

const CUM_TOKKYU = { shibuya:0, sangenjaya:4, yoga:12, futakotamagawa:15, mizonokuchi:20, azamino:28, nagatsuta:40, chuorinkan:52 };
const CUM_KAISOKU = { shibuya:0, sangenjaya:4, futakotamagawa:15, mizonokuchi:20, kajigaya:23, azamino:28, aobadai:36, nagatsuta:40, chuorinkan:52 };
function cumFor(st, table){ return table[st.id]; }

const DESTS = [
  { id:'shibuya',        st:'shibuya',       en:'Shibuya',           ja:'渋谷' },
  { id:'sangenjaya',     st:'sangenjaya',    en:'Sangenjaya',        ja:'三軒茶屋' },
  { id:'futakotamagawa', st:'futakotamagawa',en:'Futako-Tamagawa',   ja:'二子玉川' },
  { id:'mizonokuchi',    st:'mizonokuchi',   en:'Mizonokuchi',       ja:'溝の口' },
  { id:'nagatsuta',      st:'nagatsuta',     en:'Nagatsuta',         ja:'長津田' },
  { id:'chuorinkan',     st:'chuorinkan',    en:'Chuo-Rinkan',       ja:'中央林間' },
];

function pairTime(a, b){
  let best = Math.abs(a.cumL - b.cumL), transfers = 0;
  for (const table of [CUM_TOKKYU, CUM_KAISOKU]){
    const ca = cumFor(a, table), cb = cumFor(b, table);
    if (ca !== undefined && cb !== undefined){ const v = Math.abs(ca-cb); if (v<best){ best=v; transfers=0; } }
  }
  const dir = S_IDX[b.id] > S_IDX[a.id] ? 1 : -1;
  for (const table of [CUM_TOKKYU, CUM_KAISOKU]){
    const cb = cumFor(b, table); if (cb===undefined) continue;
    for (let i=S_IDX[a.id]+dir; i>=0&&i<STATIONS.length; i+=dir){
      const m=STATIONS[i], cm=cumFor(m, table);
      if (cm!==undefined){ const v=Math.abs(a.cumL-m.cumL)+3+Math.abs(cm-cb); if(v+0.001<best){best=v;transfers=1;} break; }
    }
  }
  return { mins: best, transfers };
}
function commute(stationId, destId){
  const a = STATIONS[S_IDX[stationId]]; if(!a) return {median:0,p90:0,transfers:0,direct:true,verified:false};
  const dest = DESTS.find(d=>d.id===destId)||DESTS[0];
  const b = STATIONS[S_IDX[dest.st]]; if(!b||a.id===b.id) return {median:0,p90:0,transfers:0,direct:true,verified:true,walkOnly:true};
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
  { en:'Den-en-toshi through-runs with the Hanzomon Line at Shibuya — no transfer to Omotesando, Nagatacho, Oshiage, and Tobu Skytree Line east.',
    ja:'渋谷で半蔵門線に直通 — 表参道・永田町・押上（東武スカイツリー線）へ乗換不要。',
    src:'Tokyu Corporation route guide', tier:'V' },
  { en:'Futako-Tamagawa is Rakuten\'s global headquarters (Crimson House) — major tech employment node.',
    ja:'二子玉川は楽天グループ本社（クリムゾンハウス）所在地。テック系雇用の拠点。',
    src:'Rakuten Group', tier:'V' },
  { en:"Ward rent benchmarks: LIFULL HOME'S, weekly Friday update, walk<=10 basis, fetched 2026-09-02.",
    ja:"家賃相場：LIFULL HOME'S 週次金曜更新・徒歩10分内基準・2026-09-02取得。",
    src:'homes.co.jp', tier:'V' },
  { en:'Station minutes: typical-scheduled (tier E).', ja:'所要分数：標準値（E）。', src:'—', tier:'E' },
];
