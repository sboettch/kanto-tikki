/* HomeTikki · HIBIYA — live listings. Scraper not yet run; REP cards auto-generated. */
const LIFULL = 'LIFULL';
const LIVE = [];
const REP_STATIONS = ['nakameguro','ebisu','hiroo','roppongi','kamiyacho','toranomonhills',
  'ginza','higashiginza','tsukiji','hatchobori','kayabacho','ningyocho','kodemmacho',
  'akihabara','nakaokachimachi','ueno','iriya','minowa','minamishnju','kitasenju'];
const REP = [];
for (const a of REP_STATIONS){
  const e = STATIONS[S_IDX[a]]; if(!e) continue;
  const t = WARDS[e.ward]; if(!t) continue;
  for (const layout of (['roppongi','hiroo','ginza','ebisu'].includes(a)?['1K','1LDK']:['1K'])){
    if(t.souba[layout]==null) continue;
    REP.push({ id:'rp_hb_'+a+'_'+layout,
      name:{en:`${e.en} ${layout} · at market`,ja:`${e.ja} ${layout} · 相場水準`},
      st:a, tier:'REP', srcName:'souba', url:t.src, rent:t.souba[layout], layout,
      listed:{st:{en:e.en,ja:e.ja},line:'Hibiya',walk:8},
      repNote:{en:`${t.en} ward average — no live listing yet`,ja:`${t.ja}相場 — 未取得`} });
  }
}
const HOMES = LIVE.concat(REP);
function layoutClass(l){ return (l.layout||'').split('–')[0].trim()||'1K'; }
