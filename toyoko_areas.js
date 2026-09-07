/* HomeTikki · TŌYOKO — area character data.
   Stub — real entries being added. Engine reads AREA_WARD, AREA_ST, NOISE_EVENTS, NOISE_REPORT. */

const AREA_WARD = {
  shibuya:   { en:'Shibuya ward',    ja:'渋谷区', safetyNote:{en:'Low crime. Well-lit main streets.',ja:'治安良好。幹線道路は明るい。'}, souba:{en:'Highest ward rents in the corridor — 1K from ¥133k typical.',ja:'沿線最高家賃帯 — 1K相場¥133k〜。'} },
  meguro:    { en:'Meguro ward',     ja:'目黒区', safetyNote:{en:'Quiet residential. Consistent low crime.',ja:'静かな住宅地。犯罪率は低水準。'} },
  setagaya:  { en:'Setagaya ward',   ja:'世田谷区', safetyNote:{en:'Large, leafy residential ward. Generally quiet.',ja:'広大な住宅区。概ね静か。'} },
  ota:       { en:'Ota ward',        ja:'大田区', safetyNote:{en:'Workaday residential mixed with industrial south of the ward.',ja:'住工混在。区南部は工業地帯。'} },
  nakahara:  { en:'Nakahara-ku (Kawasaki)', ja:'中原区（川崎市）', safetyNote:{en:'Tower-mansion tech hub. Active main street near station.',ja:'タワマン・テック拠点。駅前は賑やか。'} },
  kohoku:    { en:'Kohoku-ku',       ja:'港北区', safetyNote:{en:'Suburban residential. Quiet back streets.',ja:'郊外住宅地。裏道は静か。'} },
  kanagawaku:{ en:'Kanagawa-ku',     ja:'神奈川区', safetyNote:{en:'Mixed residential and light commercial.',ja:'住商混在。'} },
  nishi:     { en:'Nishi-ku (Yokohama)', ja:'西区（横浜市）', safetyNote:{en:'Central Yokohama — busy but well-managed.',ja:'横浜中心部 — 賑やかだが整備された環境。'} },
  naka:      { en:'Naka-ku (Yokohama)',  ja:'中区（横浜市）', safetyNote:{en:'Historic foreign-settlement area. Touristy around Chinatown; quieter on the bluff.',ja:'旧外国人居留地。中華街周辺は観光客多いが、山手は静か。'} },
};

const AREA_ST = {
  shibuya:        { char:{en:'Major transfer hub and shopping center. Loud, fast, relentless.',ja:'巨大ターミナル。騒がしく速い。'}, quiet:1, air:2, daily:5, people:5 },
  daikanyama:     { char:{en:'Low-rise boutiques, third-wave coffee, gallery spaces. The Hillside Terrace sets the architectural tone. International feel without trying.',ja:'低層ブティック、スペシャルティコーヒー、ギャラリー。ヒルサイドテラスが街の基調。'}, quiet:3, air:3, daily:3, people:3 },
  nakameguro:     { char:{en:'Canal-side restaurants and bars under the cherry trees. Very popular on weekends. Quieter on weekday mornings.',ja:'目黒川沿いのレストランとバー。週末は大変混雑。平日朝は静か。'}, quiet:2, air:3, daily:3, people:4 },
  yutenji:        { char:{en:'Quiet side streets behind Nakameguro. Old shopping street (shotengai) still functioning. Good ramen.',ja:'中目黒の裏手。昔ながらの商店街が現役。ラーメンが良い。'}, quiet:3, air:3, daily:4, people:3 },
  gakugeidaigaku: { char:{en:'Low-key residential. Good cafes. Local izakaya strip. Students but not loud.',ja:'落ち着いた住宅街。カフェ良し。地元居酒屋あり。学生街だが騒がしくない。'}, quiet:4, air:3, daily:4, people:3 },
  toritsu:        { char:{en:'Quiet, well-kept residential. Less known than neighbouring Gakugei. Slightly cheaper.',ja:'静かで整った住宅街。学芸大学より知名度低め。家賃もやや安い。'}, quiet:4, air:3, daily:3, people:2 },
  jiyugaoka:      { char:{en:'French pastry shops, interior design stores, European street feel. Popular with families and visitors. Busy on weekends.',ja:'フランス菓子店、インテリアショップ、欧風の街並み。週末は観光客と家族連れで混雑。'}, quiet:2, air:3, daily:4, people:4 },
  denencho:       { char:{en:'Wide tree-lined streets, early 20th-century garden suburb. Quiet and expensive. Old-money residential feel.',ja:'並木道と大正・昭和初期の田園住宅。静かで高級。旧来の高所得層の街。'}, quiet:5, air:4, daily:3, people:2 },
  tamagawa:       { char:{en:'Riverside. Tama River banks are good for jogging and cycling. Otherwise workaday.',ja:'多摩川沿い。ジョギング・サイクリングに最適な河川敷。それ以外は普通の住宅地。'}, quiet:3, air:4, daily:3, people:3 },
  musashikosugi:  { char:{en:'High-rise tower cluster. Rakuten engineers, young professionals, international residents. The shotengai under the tracks contrasts sharply with the towers.',ja:'タワマン群。楽天エンジニアや外国人居住者が多い。高架下の商店街とタワーが対照的。'}, quiet:2, air:2, daily:5, people:4 },
  motosumiyoshi:  { char:{en:'Residential behind Musashi-Kosugi. Shotengai with a covered arcade. Practical and quiet.',ja:'武蔵小杉の裏手。アーケード商店街あり。実用的で静か。'}, quiet:4, air:3, daily:4, people:3 },
  hiyoshi:        { char:{en:'Keio University campus town. Lots of students, good cheap food, solid daily shopping. Access to Shin-Yokohama (Shinkansen) from 2023.',ja:'慶應義塾大学のキャンパスタウン。学生多く、安価な飲食店が充実。2023年から新横浜（新幹線）直通。'}, quiet:3, air:3, daily:4, people:4 },
  tsunashima:     { char:{en:'Suburban residential. Older shopping street. Good value for the Yokohama commute.',ja:'郊外住宅地。昭和風の商店街。横浜通勤には割安。'}, quiet:4, air:3, daily:4, people:3 },
  myorenji:       { char:{en:'Quiet residential. Less well-known than Tsunashima. Slightly better value.',ja:'静かな住宅地。綱島より知名度低め。コスパよし。'}, quiet:4, air:3, daily:3, people:2 },
  hakuraku:       { char:{en:'Old-town feel with a shotengai. One stop from Yokohama, significantly cheaper.',ja:'昔ながらの商店街。横浜まで1駅。家賃はかなり安い。'}, quiet:4, air:3, daily:4, people:3 },
  higashihakuraku:{ char:{en:'Quieter version of Hakuraku. Walk to Yokohama is possible.',ja:'白楽のさらに静かな版。横浜まで歩けなくもない。'}, quiet:4, air:3, daily:3, people:2 },
  yokohama:       { char:{en:'Central Yokohama. Major hub — JR, Keikyu, Sotetsu, subway. Office district. Expensive to live near but the rents drop fast just a few stops out.',ja:'横浜中心駅。JR・京急・相鉄・市営地下鉄。オフィス街。駅近は高いが数駅で家賃が急落。'}, quiet:1, air:2, daily:5, people:5 },
  shintakashima:  { char:{en:'Business district edge of MM21. Quiet for living, walkable to Minatomirai.',ja:'みなとみらい地区のオフィス寄りエリア。居住は静か、徒歩でMMまでアクセス可。'}, quiet:3, air:3, daily:3, people:3 },
  minatomirai:    { char:{en:'Landmark Tower, Queens Square, Cosmo World. Heavy tourism on weekends. Expensive. Spectacular harbour views.',ja:'ランドマークタワー、クイーンズスクエア、コスモワールド。週末は観光客多。高額。港の眺め抜群。'}, quiet:2, air:4, daily:3, people:4 },
  bashamichi:     { char:{en:'Old Western-style buildings, brick warehouses, independent restaurants. Quieter than the tourist core.',ja:'西洋風旧建築と赤レンガ倉庫。独立系レストランが点在。観光地中心部より静か。'}, quiet:3, air:4, daily:3, people:3 },
  nihonodori:     { char:{en:'Prefectural government offices, ginkgo-lined boulevard. Quiet on weekends.',ja:'神奈川県庁、イチョウ並木。週末は静か。'}, quiet:4, air:4, daily:2, people:2 },
  motomachi:      { char:{en:'Yamate Bluff above, Chinatown below, Motomachi shopping street between. International schools, embassies, old Western houses. The most Yokohama part of Yokohama.',ja:'山手の丘の上、中華街の隣、元町商店街の間。国際学校、領事館、旧西洋館。最もヨコハマらしいエリア。'}, quiet:3, air:4, daily:4, people:4 },
};

const NOISE_EVENTS = {};
const NOISE_REPORT = { en:'No documented noise incidents specific to this corridor — individual station notes above.',ja:'沿線固有の騒音記録なし。各駅のメモを参照。' };
