/* HomeTikki · ODAKYU — area character */
const AREA_WARD = {
  shinjuku:  { en:'Shinjuku ward',ja:'新宿区', safetyNote:{en:'Busy. Kabukicho is adjacent; streets are generally safe.',ja:'繁華街に近い。歌舞伎町に隣接するが概ね安全。'} },
  shibuya:   { en:'Shibuya ward',ja:'渋谷区', safetyNote:{en:'Well-managed.',ja:'整備された環境。'} },
  setagaya:  { en:'Setagaya ward',ja:'世田谷区', safetyNote:{en:'Large residential. Generally quiet.',ja:'広大な住宅区。概ね静か。'} },
  komae:     { en:'Komae',ja:'狛江市', safetyNote:{en:'Small, quiet residential city.',ja:'小さな静かな住宅都市。'} },
  kawasaki_tama:{ en:'Tama-ku (Kawasaki)',ja:'多摩区（川崎市）', safetyNote:{en:'Suburban residential.',ja:'郊外住宅地。'} },
  machida:   { en:'Machida',ja:'町田市', safetyNote:{en:'Active commercial city.',ja:'活気ある商業都市。'} },
};
const AREA_ST = {
  shinjuku:      { char:{en:'The largest station in the world by exits. Shopping, entertainment, offices, everything.',ja:'乗降者数世界最多クラス。買い物・娯楽・オフィス、なんでもある。'}, quiet:1, air:1, daily:5, people:5 },
  minamishinjuku:{ char:{en:'Quiet residential just 2 min from the noise of Shinjuku.',ja:'新宿の喧騒から2分の静かな住宅地。'}, quiet:3, air:2, daily:3, people:3 },
  sangubashi:    { char:{en:'Meiji Jingu Gaien nearby. Quiet residential.',ja:'明治神宮外苑近く。静かな住宅地。'}, quiet:3, air:3, daily:3, people:3 },
  yoyogihachiman:{ char:{en:'Yoyogi Park a short walk. Cafes and bakeries. Local feel.',ja:'代々木公園へ徒歩圏内。カフェとパン屋。地元感。'}, quiet:3, air:4, daily:3, people:3 },
  yoyogiuehara:  { char:{en:'Through-run to Chiyoda Line — one of Tokyo\'s most accessible under-the-radar locations. Expensive lately.',ja:'千代田線直通 — 知られざる最高の立地の一つ。最近高くなってきた。'}, quiet:3, air:3, daily:4, people:3 },
  higashikitazawa:{ char:{en:'Quiet corner between Shimokitazawa and Yoyogi-Uehara. Good cafes.',ja:'下北沢と代々木上原の静かな角。カフェ良し。'}, quiet:4, air:3, daily:3, people:2 },
  shimokitazawa: { char:{en:'Indie music venues, vintage clothing shops, theatre, ramen. Very walkable. One of the most distinctively Tokyo neighbourhoods.',ja:'インディ音楽、古着屋、演劇、ラーメン。徒歩で完結する。最も東京らしい街の一つ。'}, quiet:2, air:3, daily:4, people:4 },
  setagayadaita: { char:{en:'Quiet residential. New development underway after the Odakyu tracks went underground.',ja:'静かな住宅地。小田急地下化後に再開発が進む。'}, quiet:4, air:3, daily:3, people:2 },
  umegaoka:      { char:{en:'Residential with a local shopping street. Underrated.',ja:'商店街のある住宅地。過小評価されている。'}, quiet:4, air:3, daily:4, people:2 },
  gotokuji:      { char:{en:'Gotokuji temple — origin of the lucky cat. Tokyu Setagaya tram nearby. Old-town feel.',ja:'豪徳寺 — 招き猫発祥の地。東急世田谷線が近い。下町の雰囲気。'}, quiet:4, air:3, daily:3, people:3 },
  kyodo:         { char:{en:'Good daily shopping. Local residential. Better value than Sangenjaya.',ja:'日用品の買い物が便利。地元感。三軒茶屋よりコスパよし。'}, quiet:3, air:3, daily:4, people:3 },
  seijogakuinmae:{ char:{en:'Seijo — old-money residential, wide quiet streets, excellent greenery. The Seijo Ishii flagship is here.',ja:'成城 — 旧来の高所得層の街、広い静かな街路、豊かな緑。成城石井の旗艦店がある。'}, quiet:5, air:4, daily:3, people:2 },
  chitosefunabashi:{ char:{en:'Residential. Good supermarkets. Undervalued compared to neighbours.',ja:'住宅地。スーパー良し。隣駅に比べて割安。'}, quiet:4, air:3, daily:4, people:2 },
  soshigaya:     { char:{en:'Ultraman shopping street — the series was filmed here in the 1960s. Quiet residential with quirky character.',ja:'ウルトラマン商店街 — 1960年代に撮影地。穏やかな住宅地に独特の個性。'}, quiet:4, air:3, daily:3, people:2 },
  komae:         { char:{en:'Tokyo\'s smallest city. Quiet, friendly, practical. Tama River nearby.',ja:'東京都最小の市。静かで親切で実用的。多摩川が近い。'}, quiet:4, air:4, daily:4, people:2 },
  izumitamagawa: { char:{en:'Quiet riverside end of the line (for many). Affordable.',ja:'多摩川沿いの静かな終点（多くの人の）。割安。'}, quiet:4, air:4, daily:3, people:2 },
  noborito:      { char:{en:'JR connection. Doraemon Museum nearby. Active station area.',ja:'JR南武線乗換。藤子・F・不二雄ミュージアム近く。活気ある駅前。'}, quiet:3, air:4, daily:4, people:3 },
  mukogaoka:     { char:{en:'Residential. Former amusement park site being redeveloped.',ja:'住宅地。旧遊園地跡地が再開発中。'}, quiet:3, air:4, daily:3, people:2 },
  ikuta:         { char:{en:'Suburban residential. Quiet hills.',ja:'郊外住宅地。静かな丘。'}, quiet:4, air:4, daily:3, people:2 },
  yomiko:        { char:{en:'Yomiuri Land amusement park. Primarily residential.',ja:'読売ランド遊園地。主に住宅地。'}, quiet:4, air:4, daily:3, people:2 },
  tama:          { char:{en:'Odakyu Enoshima Line branches here. Outer suburb hub.',ja:'江ノ島線分岐。外縁部のハブ。'}, quiet:3, air:4, daily:3, people:3 },
  karakida:      { char:{en:'Quiet outer residential.',ja:'静かな外縁部住宅地。'}, quiet:4, air:4, daily:3, people:2 },
  tsurukawa:     { char:{en:'Quiet residential. Popular with families.',ja:'静かな住宅地。ファミリーに人気。'}, quiet:4, air:4, daily:3, people:2 },
  machida:       { char:{en:'Active commercial city with a big shotengai. JR Yokohama Line connection. Feels like its own city.',ja:'大型商店街のある活気ある商業都市。JR横浜線乗換。独立した都市の雰囲気。'}, quiet:2, air:3, daily:5, people:4 },
};
const NOISE_EVENTS = {};
const NOISE_REPORT = { en:'No specific documented noise events on this corridor.',ja:'沿線固有の騒音記録なし。' };
