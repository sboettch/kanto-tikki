/* HomeTikki · TŌYOKO — live listings.
   Scraper has not yet run for this corridor — stubs only.
   REP cards auto-generated from ward souba data below.
   To refresh: run kanto_scraper.py --corridor toyoko       */

const LIFULL = 'LIFULL';
const SUUMO  = 'SUUMO';

const LIVE = [];   /* will be populated by scraper */

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
