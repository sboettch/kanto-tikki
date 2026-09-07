/* HomeTikki · HIBIYA — neighborhood pockets. Stubs. */
const POCKETS = [
  { id:'hiroo-hb', st:'hiroo', en:'Hiroo', ja:'広尾',
    gem:{en:'National Azabu supermarket and the embassy grid — Tokyo\'s most international daily-life neighbourhood.',ja:'ナショナル麻布と大使館エリア — 東京で最も国際色豊かな日常生活。'},
    noiseWatch:null,
    axes:{ quiet:4, old:2, intl:5, food:4, dining:5, craft:2, green:3, photo:3, night:2 },
    access:{en:'Hiroo station, Hibiya Line. 6 min from Naka-Meguro.',ja:'広尾駅（日比谷線）。中目黒から6分。'} },
  { id:'roppongi-hb', st:'roppongi', en:'Roppongi', ja:'六本木',
    gem:{en:'Mori Art Museum (54th floor) and the Art Triangle — world-class contemporary art, open until 10pm.',ja:'森美術館（54階）とアートトライアングル — 世界レベルの現代アートが夜10時まで。'},
    noiseWatch:{en:'Club district along Roppongi-dori is loud Fri–Sat until dawn.',ja:'六本木通りのクラブ街は金土の夜明けまで騒がしい。'},
    axes:{ quiet:1, old:1, intl:5, food:4, dining:5, craft:3, green:2, photo:4, night:5 },
    access:{en:'Roppongi station, Hibiya Line + Toei Oedo Line.',ja:'六本木駅（日比谷線・都営大江戸線）。'} },
  { id:'ningyocho-hb', st:'ningyocho', en:'Ningyocho', ja:'人形町',
    gem:{en:'Amazake-yokocho alley and old Edo sweetshop street. Also connects directly to the Keikyu corridor.',ja:'甘酒横丁と江戸時代からの人形町商店街。京急沿線への直通接続もあり。'},
    noiseWatch:null,
    axes:{ quiet:3, old:5, intl:2, food:4, dining:3, craft:4, green:2, photo:4, night:2 },
    access:{en:'Ningyocho station, Hibiya Line + Toei Asakusa Line (A-14).',ja:'人形町駅（日比谷線・都営浅草線A-14）。'} },
  { id:'ueno-hb', st:'ueno', en:'Ueno', ja:'上野',
    gem:{en:'The museum cluster — Tokyo National Museum, Western Art Museum, Science Museum, and Ueno Zoo — all in one park.',ja:'東京国立博物館、国立西洋美術館、国立科学博物館、上野動物園 — すべて一つの公園に。'},
    noiseWatch:{en:'Hanami season (late March–April) brings huge crowds and all-day noise around the park.',ja:'花見シーズン（3月下旬〜4月）は公園周辺が一日中混雑し騒がしい。'},
    axes:{ quiet:2, old:4, intl:3, food:4, dining:3, craft:3, green:4, photo:4, night:3 },
    access:{en:'Ueno station, Hibiya Line + JR Yamanote and multiple others.',ja:'上野駅（日比谷線・JR山手線ほか）。'} },
  { id:'kitasenju-hb', st:'kitasenju', en:'Kita-Senju', ja:'北千住',
    gem:{en:'The north hub — major arts and theatre scene, student energy from the Tokyo University of the Arts annex, and Tobu connection north.',ja:'北部の拠点 — 芸術・演劇シーン、東京芸術大学サテライトの学生気質、東武線で北へ直通。'},
    noiseWatch:{en:'Station area busy at commute hours; quieter 2–3 blocks from the tracks.',ja:'通勤時間帯の駅周辺は混雑。線路から2〜3ブロック離れると静か。'},
    axes:{ quiet:2, old:3, intl:2, food:4, dining:3, craft:3, green:2, photo:3, night:3 },
    access:{en:'Kita-Senju, Hibiya Line + JR Joban + Tobu Skytree + Tsukuba Express.',ja:'北千住駅（日比谷線・JR常磐線・東武スカイツリー線・つくばエクスプレス）。'} },
];
const PKQ = [
  { q:{en:'Quiet street or busy area?',ja:'静かな街 or 賑やかなエリア？'}, axes:{ quiet:[1,0] } },
  { q:{en:'Old Edo character or modern city feel?',ja:'江戸の面影 or 現代都市の雰囲気？'}, axes:{ old:[1,0] } },
  { q:{en:'International neighbourhood or local Japanese?',ja:'国際的な街 or 地元の日本らしさ？'}, axes:{ intl:[1,0] } },
  { q:{en:'Restaurant and cafe density or everyday shopping?',ja:'飲食店・カフェ密度 or 日常の買い物？'}, axes:{ food:[1,0] } },
  { q:{en:'Fine dining options nearby or simple and local?',ja:'高級飲食店が近い or シンプルでローカル？'}, axes:{ dining:[1,0] } },
  { q:{en:'Green parks or central urban density?',ja:'緑と公園 or 都心の密度？'}, axes:{ green:[1,0] } },
  { q:{en:'Photogenic streets or plain and functional?',ja:'フォトジェニックな街並み or 実用的でシンプル？'}, axes:{ photo:[1,0] } },
  { q:{en:'Active nightlife nearby or early nights?',ja:'夜の選択肢あり or 早寝の街？'}, axes:{ night:[1,0] } },
];

const POCKETS_R3 = POCKETS;
const PQ = PKQ;
