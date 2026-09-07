/* HomeTikki · TŌYOKO — live listings.
   Scraper has not yet run for this corridor — stubs only.
   REP cards auto-generated from ward souba data below.
   To refresh: run kanto_scraper.py --corridor toyoko       */

const LIFULL = 'LIFULL';
const SUUMO  = 'SUUMO';

const LIVE = [
  {
    id: 'ty_hiyoshi_annex',
    name: { en: 'Park Heights Annex', ja: 'パークハイツアネックス' },
    st: 'hiyoshi',
    tier: 'LIVE',
    srcName: 'SUUMO / Google Maps',
    url: 'https://maps.app.goo.gl/cJMiGzpkunkw1E439?g_st=ac',
    rent: 68000,
    mgmt: 3000,
    layout: '1K',
    layoutNote: '1K (20.5m²)',
    m2: 20.5,
    built: '1981 · 2F 軽量鉄骨造',
    deposit_mo: 1,
    key_mo: 1,
    listed: {
      st: { en: 'Hiyoshi', ja: '日吉' },
      line: 'Tokyu Toyoko / Meguro / Shin-Yokohama',
      walk: 8
    },
    extra: {
      en: '8 min walk to Hiyoshi Stn · 7 min walk to Green Line Hiyoshihonchō · 44 min commute to Yokosuka-Chūō (1 transfer at Yokohama)',
      ja: '日吉駅徒歩8分・グリーンライン日吉本町駅徒歩7分 · 横浜乗換1回で横須賀中央へ44分（60分上限内）'
    },
    why: {
      en: 'Quiet residential hillside in Hiyoshihoncho 3-chome. 44 min one-transfer commute to Yokosuka naval/engineering hub via Yokohama Keikyu Kaitoku.',
      ja: '日吉本町3丁目の閑静な高台住宅街。横浜駅乗換で横須賀中央へ44分、エンジニア通勤の60分上限内に直結。'
    }
  }
];

const REP_STATIONS = [
  'shibuya','daikanyama','nakameguro','yutenji','gakugeidaigaku',
  'toritsu','jiyugaoka','denencho','tamagawa','musashikosugi',
  'motosumiyoshi','hiyoshi','tsunashima','myorenji','hakuraku',
  'higashihakuraku','yokohama','minatomirai','motomachi',
];
const REP = [];
for (const a of REP_STATIONS){
  const e = STATIONS[S_IDX[a]];
  if (!e) continue;
  const t = WARDS[e.ward];
  if (!t) continue;
  for (const layout of (a === 'yokohama' || a === 'shibuya' ? ['1K','1LDK'] : ['1K'])){
    if (t.souba[layout] == null) continue;
    REP.push({
      id: 'rp_ty_' + a + '_' + layout,
      name:{ en:`${e.en} ${layout} · at market`, ja:`${e.ja} ${layout} · 相場水準` },
      st: a, tier:'REP', srcName:'souba', url: t.src,
      rent: t.souba[layout], layout,
      listed:{ st:{ en:e.en, ja:e.ja }, line:'Tokyu Toyoko', walk:8 },
      repNote:{ en:`ward average for ${t.en} — no live listing yet`, ja:`${t.ja}相場 — 未取得` },
    });
  }
}
const HOMES = LIVE.concat(REP);
function layoutClass(l){ const e=(l.layout||'').split('–')[0].trim(); return e||'1K'; }
