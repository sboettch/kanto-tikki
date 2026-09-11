/* HomeTikki · TŌYOKO — neighborhood pockets.
   Stubs — real pocket entries coming. Engine reads POCKETS array + PKQ array. */

const POCKETS = [
  { id:'daikanyama-ty', st:'daikanyama', en:'Daikanyama', ja:'代官山',
    gem:{en:'Log Road and Hillside Terrace — the definitive low-rise boutique strip.',ja:'ログロードとヒルサイドテラス — 低層ブティックの代表格。'},
    noiseWatch:null,
    ax:{ quiet:3, old:2, intl:4, food:4, refined:4, craft:3, green:3, photo:4, night:3 },
    access:{en:'Daikanyama station, Tokyu Toyoko, 2 min from Shibuya.',ja:'代官山駅（東急東横線）渋谷から2分。'} },
  { id:'nakameguro-ty', st:'nakameguro', en:'Nakameguro Canal', ja:'中目黒',
    gem:{en:'Meguro River canal path — cherry blossom in spring, year-round cafes and bars.',ja:'目黒川沿い — 春は桜、年中カフェとバーが続く。'},
    noiseWatch:{en:'Canal-side bars can get loud on weekend nights until around midnight.',ja:'週末深夜は川沿いのバーが混雑し騒がしくなる。'},
    ax:{ quiet:2, old:2, intl:4, food:5, refined:4, craft:3, green:3, photo:5, night:4 },
    access:{en:'Nakameguro station, Tokyu Toyoko + Hibiya Line.',ja:'中目黒駅（東急東横線・東京メトロ日比谷線）。'} },
  { id:'jiyugaoka-ty', st:'jiyugaoka', en:'Jiyugaoka', ja:'自由が丘',
    gem:{en:'Sweets Forest and pastry shops — the Paris pastry quarter of Tokyo.',ja:'スイーツフォレスト — 東京のパリ菓子街。'},
    noiseWatch:null,
    ax:{ quiet:2, old:2, intl:3, food:5, refined:4, craft:3, green:3, photo:4, night:2 },
    access:{en:'Jiyugaoka station, Tokyu Toyoko + Oimachi Line.',ja:'自由が丘駅（東急東横線・大井町線）。'} },
  { id:'denencho-ty', st:'denencho', en:'Den-en-chofu', ja:'田園調布',
    gem:{en:'1920s garden suburb — wide tree-lined avenues, preserved Taisho-era houses.',ja:'大正時代の田園住宅街 — 広い並木道と保存された旧建築。'},
    noiseWatch:null,
    ax:{ quiet:5, old:4, intl:2, food:2, refined:3, craft:2, green:5, photo:4, night:1 },
    access:{en:'Den-en-chofu station, Tokyu Toyoko + Meguro Line.',ja:'田園調布駅（東急東横線・目黒線）。'} },
  { id:'musashikosugi-ty', st:'musashikosugi', en:'Musashi-Kosugi', ja:'武蔵小杉',
    gem:{en:'Rakuten Crimson House HQ and the tower cluster — the tech corridor centre of gravity.',ja:'楽天クリムゾンハウス本社とタワー群 — テック界の重心。'},
    noiseWatch:{en:'Construction noise ongoing as new towers are still being built (2026).',ja:'新築タワーの建設工事音が継続中（2026年）。'},
    ax:{ quiet:2, old:1, intl:4, food:4, refined:3, craft:2, green:2, photo:2, night:3 },
    access:{en:'Musashi-Kosugi station, Tokyu Toyoko + JR Nanboku + Yokosuka Line.',ja:'武蔵小杉駅（東急東横線・JR南武線・横須賀線）。'} },
  { id:'hiyoshi-ty', st:'hiyoshi', en:'Hiyoshi', ja:'日吉',
    gem:{en:'Keio University campus, plus the 2023 Shin-Yokohama Line connection — Shinkansen access from home.',ja:'慶應義塾大学と2023年開業の新横浜線 — 自宅から新幹線アクセス。'},
    noiseWatch:null,
    ax:{ quiet:3, old:2, intl:2, food:3, refined:2, craft:2, green:3, photo:2, night:2 },
    access:{en:'Hiyoshi station, Tokyu Toyoko + Shin-Yokohama Line (2023).',ja:'日吉駅（東急東横線・新横浜線2023年開業）。'} },
  { id:'motomachi-ty', st:'motomachi', en:'Motomachi-Yamate', ja:'元町・山手',
    gem:{en:'Yokohama\'s historic international quarter — foreign consulates, Western houses, Chinatown, and the bluff parks above.',ja:'横浜の旧外国人居留地 — 領事館、西洋館、中華街、山手の丘の公園。'},
    noiseWatch:{en:'Chinatown busy at mealtimes and on weekends; quieter on the bluff itself.',ja:'中華街は食事時・週末に混雑。山手の丘は静か。'},
    ax:{ quiet:3, old:5, intl:5, food:5, refined:4, craft:3, green:4, photo:5, night:2 },
    access:{en:'Motomachi-Chukagai station (Minatomirai Line). 45 min from Shibuya.',ja:'元町・中華街駅（みなとみらい線）。渋谷から約45分。'} },
];

/* Quiz questions — same structure as keikyu PKQ */
const PKQ = [
  { q:{en:'Quiet back street or busy main street?',ja:'静かな裏道 or 賑やかな幹線道路？'}, ax:{ quiet:[1,0] } },
  { q:{en:'Old neighborhood feel or new construction?',ja:'昔ながらの雰囲気 or 新築？'}, ax:{ old:[1,0] } },
  { q:{en:'International vibe or local Japanese?',ja:'インターナショナルな雰囲気 or 地元の日本らしさ？'}, ax:{ intl:[1,0] } },
  { q:{en:'Lots of cafes and restaurants or basic daily shopping?',ja:'カフェ・飲食店が多い or 日用品中心？'}, ax:{ food:[1,0] } },
  { q:{en:'Weekend brunch district or every-day convenience?',ja:'週末のブランチスポット or 毎日使いの便利さ？'}, ax:{ refined:[1,0] } },
  { q:{en:'Green parks and trees or central density?',ja:'緑と公園 or 都心の密度？'}, ax:{ green:[1,0] } },
  { q:{en:'Photogenic streetscape or functional and plain?',ja:'フォトジェニックな街並み or 実用的でシンプル？'}, ax:{ photo:[1,0] } },
  { q:{en:'Night out options nearby or early to bed?',ja:'夜遊びの選択肢あり or 早寝の街？'}, ax:{ night:[1,0] } },
];

const POCKETS_R3 = POCKETS;
const PQ = PKQ;
