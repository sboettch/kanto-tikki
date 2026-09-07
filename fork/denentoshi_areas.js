/* HomeTikki · DEN-EN-TOSHI — area character */
const AREA_WARD = {
  shibuya:  { en:'Shibuya ward',ja:'渋谷区', safetyNote:{en:'Well-managed despite high footfall.',ja:'人出が多いが整備された環境。'} },
  setagaya: { en:'Setagaya ward',ja:'世田谷区', safetyNote:{en:'Large residential ward. Generally quiet.',ja:'広大な住宅区。概ね静か。'} },
  takatsu:  { en:'Takatsu-ku (Kawasaki)',ja:'高津区（川崎市）', safetyNote:{en:'Suburban residential.',ja:'郊外住宅地。'} },
  miyamae:  { en:'Miyamae-ku (Kawasaki)',ja:'宮前区（川崎市）', safetyNote:{en:'Quiet suburban.',ja:'静かな郊外。'} },
  aoba:     { en:'Aoba-ku (Yokohama)',ja:'青葉区（横浜市）', safetyNote:{en:'Leafy hillside suburb.',ja:'丘陵の緑豊かな郊外。'} },
  yamato:   { en:'Yamato',ja:'大和市', safetyNote:{en:'Quiet outer suburb.',ja:'静かな外縁部郊外。'} },
};
const AREA_ST = {
  shibuya:        { char:{en:'Major hub. Loud and fast.',ja:'巨大ターミナル。騒がしく速い。'}, quiet:1, air:2, daily:5, people:5 },
  ikejiriohashi:  { char:{en:'Between Shibuya and Sangenjaya — quiet residential with good restaurants.',ja:'渋谷と三軒茶屋の間。静かな住宅地に良いレストランあり。'}, quiet:3, air:3, daily:3, people:3 },
  sangenjaya:     { char:{en:'Local shopping arcades, izakaya, tram connection. University-town energy without being touristy.',ja:'商店街・居酒屋・世田谷線乗換。学生街の活気があって観光地ではない。'}, quiet:2, air:3, daily:5, people:4 },
  komazawa:       { char:{en:'Komazawa Olympic Park — jogging loops, dog walks, open air. Quiet residential beyond the park.',ja:'駒沢オリンピック公園 — ジョギング、犬の散歩、開放的な芝生。公園の外は静かな住宅地。'}, quiet:3, air:4, daily:3, people:3 },
  sakurashinmachi:{ char:{en:'Sazae-san street art and the Hasegawa family museum. Quiet and residential.',ja:'サザエさんの街。長谷川町子美術館。静かな住宅地。'}, quiet:4, air:3, daily:3, people:2 },
  yoga:           { char:{en:'Headquarters of several major Japanese companies. Business feel with good daily shopping.',ja:'大企業の本社が点在。ビジネス街の雰囲気で日用品の買い物も便利。'}, quiet:3, air:3, daily:4, people:3 },
  futakotamagawa: { char:{en:'Tama River riverfront, Rise shopping complex, Rakuten HQ. Young professionals and families. Gentrified quickly.',ja:'多摩川河川敷、ライズ複合施設、楽天本社。若い共働き世帯と家族。急激に高級化。'}, quiet:2, air:4, daily:5, people:4 },
  futakoshinchi:  { char:{en:'Quiet first stop into Kawasaki from Futako-Tamagawa. Much cheaper.',ja:'川崎側への最初の駅。二子玉川よりずっと安い。'}, quiet:3, air:3, daily:3, people:2 },
  takatsu:        { char:{en:'Local shopping street, Mizonokuchi spillover. Good value.',ja:'地元商店街、溝の口の延長線上。コスパ良し。'}, quiet:3, air:3, daily:4, people:3 },
  mizonokuchi:    { char:{en:'JR Nambu connection. Active shotengai and nightlife strip. Biggest station in the outer Kawasaki stretch.',ja:'JR南武線乗換。活気ある商店街と飲食街。川崎郊外で最大の駅。'}, quiet:2, air:3, daily:5, people:4 },
  kajigaya:       { char:{en:'Residential, park-adjacent. Practical and quiet.',ja:'住宅地、公園隣接。実用的で静か。'}, quiet:4, air:3, daily:3, people:2 },
  miyamaedaira:   { char:{en:'Suburban residential. Hillside location. Quiet.',ja:'郊外住宅地。丘の中腹。静か。'}, quiet:4, air:4, daily:3, people:2 },
  miyazakidai:    { char:{en:'Quiet outer suburb. Cheaper than the Setagaya stations.',ja:'静かな郊外。世田谷より安い。'}, quiet:4, air:4, daily:3, people:2 },
  azamino:        { char:{en:'Yokohama subway connection gives dual access. Residential hills.',ja:'横浜市営地下鉄乗換でアクセス二重化。丘の住宅地。'}, quiet:3, air:4, daily:4, people:3 },
  eda:            { char:{en:'Quiet hillside residential.',ja:'静かな丘の住宅地。'}, quiet:4, air:4, daily:3, people:2 },
  ichigaooka:     { char:{en:'Residential. Central Aoba-ku. Practical daily life.',ja:'青葉区の中心的住宅地。日常使いに便利。'}, quiet:4, air:4, daily:4, people:3 },
  aobadai:        { char:{en:'Aoba-ku hub — best daily shopping in the outer belt. Good schools.',ja:'青葉区の生活拠点。外縁部で最も買い物が充実。学校も良い。'}, quiet:3, air:4, daily:5, people:3 },
  tana:           { char:{en:'Small residential stop. Very quiet.',ja:'小さな住宅駅。非常に静か。'}, quiet:5, air:4, daily:2, people:2 },
  nagatsuta:      { char:{en:'JR Yokohama Line connection. Outer hub. Good value.',ja:'JR横浜線乗換。郊外のハブ。コスパ良し。'}, quiet:3, air:4, daily:4, people:3 },
  tsukushino:     { char:{en:'Quiet residential end of the corridor.',ja:'沿線の静かな住宅端部。'}, quiet:5, air:4, daily:3, people:2 },
  suzukakedai:    { char:{en:'Tokyo Institute of Technology campus town. Academic feel.',ja:'東京工業大学キャンパスタウン。学術的な雰囲気。'}, quiet:4, air:4, daily:3, people:3 },
  minamimachida:  { char:{en:'Grand Berry Park outlet mall. Weekend shopping destination.',ja:'グランベリーパークアウトレット。週末の買い物目的地。'}, quiet:3, air:4, daily:4, people:3 },
  tsukimino:      { char:{en:'Quiet outer residential.',ja:'静かな外縁部住宅地。'}, quiet:5, air:4, daily:3, people:2 },
  chuorinkan:     { char:{en:'Terminus. Odakyu Enoshima connection. Suburban end of the line.',ja:'終点。小田急江ノ島線乗換。沿線の郊外端。'}, quiet:4, air:4, daily:4, people:3 },
};
const NOISE_EVENTS = {};
const NOISE_REPORT = { en:'No specific documented noise incidents on this corridor.',ja:'沿線固有の騒音記録なし。' };
