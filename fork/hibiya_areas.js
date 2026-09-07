/* HomeTikki · HIBIYA — area character. Stub with real per-station entries. */
const AREA_WARD = {
  meguro:  { en:'Meguro ward',ja:'目黒区', safetyNote:{en:'Quiet residential. Low crime.',ja:'静かな住宅地。犯罪率低。'} },
  shibuya: { en:'Shibuya ward',ja:'渋谷区', safetyNote:{en:'Well-managed despite high footfall.',ja:'人出が多いが整備された環境。'} },
  minato:  { en:'Minato ward',ja:'港区', safetyNote:{en:'Lowest crime rate in Tokyo. Expensive but safe.',ja:'都内最低犯罪率。高額だが安全。'} },
  chuo:    { en:'Chuo ward',ja:'中央区', safetyNote:{en:'Commercial core. Quiet at night outside entertainment areas.',ja:'商業中心地。繁華街外は夜静か。'} },
  taito:   { en:'Taito ward',ja:'台東区', safetyNote:{en:'Mixed — Ueno/Akihabara busy; back streets quiet.',ja:'上野・秋葉原は賑やか。裏道は静か。'} },
  arakawa: { en:'Arakawa ward',ja:'荒川区', safetyNote:{en:'Residential shitamachi. Generally quiet.',ja:'下町の住宅地。概ね静か。'} },
  adachi:  { en:'Adachi ward',ja:'足立区', safetyNote:{en:'Large residential ward. Busier near Kita-Senju hub.',ja:'大きな住宅区。北千住の周辺は賑やか。'} },
};
const AREA_ST = {
  nakameguro:   { char:{en:'Canal side cafes and bars. Shares Nakameguro station with the Tokyu Toyoko Line.',ja:'目黒川沿いのカフェとバー。東急東横線との乗換駅。'}, quiet:2, air:3, daily:3, people:4 },
  ebisu:        { char:{en:'Garden Place, Yebisu Beer Museum, upscale restaurants. JR cross-platform transfer.',ja:'ガーデンプレイス、エビスビール記念館、高級レストラン。JR乗換。'}, quiet:2, air:3, daily:4, people:4 },
  hiroo:        { char:{en:'The embassy quarter. National Azabu supermarket, Tokyo American Club, international schools. Expensive and quiet.',ja:'大使館街。ナショナル麻布、東京アメリカンクラブ、インターナショナルスクール。高額で静か。'}, quiet:4, air:3, daily:3, people:2 },
  roppongi:     { char:{en:'Art Triangle (Mori, National Art Center, Suntory Museum). Nightlife that goes until 5am. Loud on weekends.',ja:'アートトライアングル（森、国立新美術館、サントリー美術館）。週末は夜明けまで騒がしい。'}, quiet:1, air:2, daily:3, people:5 },
  kamiyacho:    { char:{en:'Government ministry back streets. Quiet during the week, deserted on weekends. Very safe.',ja:'官庁街の裏手。平日は静か、週末は閑散。非常に安全。'}, quiet:4, air:3, daily:2, people:2 },
  toranomonhills: { char:{en:'Toranomon Hills tower complex — offices, hotel, residences. New business district feel.',ja:'虎ノ門ヒルズ複合施設。オフィス・ホテル・レジデンス。新しいビジネス地区。'}, quiet:3, air:3, daily:3, people:3 },
  ginza:        { char:{en:'Flagship stores, galleries, the Kabukiza theatre around the corner at H-08. Expensive. Very safe.',ja:'ブランドフラッグシップ、ギャラリー、H-08歌舞伎座。高額。非常に安全。'}, quiet:2, air:2, daily:3, people:4 },
  higashiginza: { char:{en:'Kabukiza Theatre directly above the station. Tsukiji outer market nearby.',ja:'歌舞伎座が直上。築地場外市場が近い。'}, quiet:2, air:2, daily:3, people:3 },
  tsukiji:      { char:{en:'The outer market still runs seafood stalls and sushi counters. Tourist-busy mornings; quiet afternoons.',ja:'場外市場では海鮮屋台と寿司カウンターが現役。朝は観光客で賑わい、午後は静か。'}, quiet:2, air:3, daily:4, people:3 },
  hatchobori:   { char:{en:'Workaday office district. JR Keiyo connection. Quiet evenings.',ja:'実用的なオフィス街。JR京葉線乗換。夜は静か。'}, quiet:3, air:2, daily:3, people:3 },
  kayabacho:    { char:{en:'Tokyo Stock Exchange is here. Daytime financial district, very quiet evenings and weekends.',ja:'東京証券取引所がある。平日昼は金融街、夜と週末は閑散。'}, quiet:4, air:2, daily:3, people:2 },
  ningyocho:    { char:{en:'Old merchant quarter — sweetshop street, traditional crafts, the Amazake-yokocho alley. Connects to the Keikyu corridor (same station as Asakusa A-14).',ja:'人形町商店街、甘酒横丁。都営浅草線A-14との乗換 — 京急沿線に直結。'}, quiet:3, air:3, daily:4, people:3 },
  kodemmacho:   { char:{en:'Former Edo-era prison site (Kodenmacho prison). Now a quiet commercial-residential mix.',ja:'小伝馬町牢屋敷跡。現在は静かな商住混在地区。'}, quiet:3, air:3, daily:3, people:2 },
  akihabara:    { char:{en:'Electronics and anime district. Busy, loud, and very specific in character. Quieter side streets a block away.',ja:'電気街・アニメの聖地。賑やかで騒がしいが、一本裏道は静か。'}, quiet:1, air:2, daily:4, people:5 },
  nakaokachimachi: { char:{en:'Ameyokocho market entrance nearby. Practical and affordable.',ja:'アメ横の端。実用的で割安。'}, quiet:2, air:2, daily:4, people:4 },
  ueno:         { char:{en:'Ueno Park, museums, zoo, Ameyo-kocho market. Major JR hub. Loud during events, peaceful in the park.',ja:'上野公園、美術館・博物館群、動物園、アメ横。イベント時は騒がしいが公園は静か。'}, quiet:2, air:3, daily:5, people:5 },
  iriya:        { char:{en:'Old shitamachi residential. Known for morning glory festival in July. Quiet and local.',ja:'下町の住宅地。7月の朝顔市で有名。静かで地元色が強い。'}, quiet:4, air:3, daily:4, people:3 },
  minowa:       { char:{en:'Tokyo\'s last tram line (Arakawa Line / Sakura Tram) starts here. Quiet old-town character.',ja:'東京さくらトラム（荒川線）の始発駅。静かな下町。'}, quiet:4, air:3, daily:3, people:2 },
  minamishnju:  { char:{en:'Former Senju-Ohashi area. Rapid redevelopment underway. River views, affordable, transitional.',ja:'千住大橋エリア。急速な再開発が進む。川の眺め、割安、変化中。'}, quiet:3, air:3, daily:3, people:3 },
  kitasenju:    { char:{en:'Major northeast hub — JR Joban, Tobu Skytree, Tsukuba Express, two Metro lines. Theatre, art school (Tokyo University of the Arts annex), student energy.',ja:'北東部の大型ターミナル — JR常磐線、東武スカイツリー線、つくばエクスプレス、地下鉄2路線。劇場、東京芸術大学サテライト。学生の活気。'}, quiet:2, air:3, daily:5, people:4 },
};
const NOISE_EVENTS = {
  roppongi: { en:'Weekend nights until 4–5am — clubs along Roppongi-dori and Gaien-higashi-dori.',
              when:{en:'Fri–Sat nights year-round'}, source:'documented residential complaints (Minato ward)' },
  akihabara:{ en:'PA systems from electronics shops and occasional outdoor events. Daytime only.',
              when:{en:'Daily 10:00–20:00'}, source:'general knowledge' },
  ueno:     { en:'Ameyo-kocho market noise; major events in the park (hanami, concerts) can be very loud.',
              when:{en:'Hanami late March–April; weekend events year-round'}, source:'general knowledge' },
};
const NOISE_REPORT = { en:'Notable noise sources: Roppongi nightlife (weekends to dawn); Akihabara PA systems (daytime); Ueno events (seasonal). Hiroo, Kamiyacho, Kayabacho, Kodemmacho are notably quiet.',
                       ja:'主な騒音源：六本木の深夜ナイトライフ（週末）、秋葉原の呼び込み（昼間）、上野のイベント（季節）。広尾・神谷町・茅場町・小伝馬町は静か。' };
