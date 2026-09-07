/* HomeTikki · DEN-EN-TOSHI — live listings stub */
const LIVE = [];
const REP_STATIONS = ['shibuya','ikejiriohashi','sangenjaya','komazawa','sakurashinmachi',
  'yoga','futakotamagawa','futakoshinchi','takatsu','mizonokuchi','kajigaya','miyamaedaira',
  'miyazakidai','azamino','eda','ichigaooka','aobadai','tana','nagatsuta','tsukushino',
  'suzukakedai','minamimachida','tsukimino','chuorinkan'];
const REP = [];
for (const a of REP_STATIONS){
  const e=STATIONS[S_IDX[a]]; if(!e) continue;
  const t=WARDS[e.ward]; if(!t) continue;
  for (const layout of (['shibuya','futakotamagawa','mizonokuchi'].includes(a)?['1K','1LDK']:['1K'])){
    if(t.souba[layout]==null) continue;
    REP.push({ id:'rp_dt_'+a+'_'+layout, name:{en:`${e.en} ${layout} · at market`,ja:`${e.ja} ${layout} · 相場水準`},
      st:a, tier:'REP', srcName:'souba', url:t.src, rent:t.souba[layout], layout,
      listed:{st:{en:e.en,ja:e.ja},line:'Den-en-toshi',walk:8},
      repNote:{en:`${t.en} average — no live listing yet`,ja:`${t.ja}相場 — 未取得`} });
  }
}
const HOMES = LIVE.concat(REP);
function layoutClass(l){ return (l.layout||'').split('–')[0].trim()||'1K'; }
