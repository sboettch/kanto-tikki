/* HomeTikki · ODAKYU — pockets */
const POCKETS = [
  { id:'shimokitazawa-od', st:'shimokitazawa', en:'Shimokitazawa', ja:'下北沢',
    gem:{en:'The closest thing Tokyo has to a self-contained indie neighbourhood — music, vintage, ramen, theatre, all walkable.',ja:'東京で最も自完結したインディ系の街 — 音楽・古着・ラーメン・演劇、全部歩いて完結。'},
    noiseWatch:{en:'Venue noise from live music clubs on weekend evenings until around midnight.',ja:'週末夜はライブハウスからの音が深夜まで続く。'},
    ax:{quiet:2,old:3,intl:3,food:5,refined:3,craft:5,green:2,photo:4,night:4},
    access:{en:'Shimokitazawa, Odakyu + Keio Inokashira Line.',ja:'下北沢駅（小田急線・京王井の頭線）。'} },
  { id:'seijogakuinmae-od', st:'seijogakuinmae', en:'Seijo', ja:'成城',
    gem:{en:'One of Tokyo\'s most prestigious old-money addresses. Wide, quiet, tree-lined. The Seijo Ishii flagship store originated here.',ja:'東京屈指の高級住宅地。広く静かな並木道。成城石井の本家がここにある。'},
    noiseWatch:null,
    ax:{quiet:5,old:3,intl:2,food:3,refined:4,craft:2,green:5,photo:3,night:1},
    access:{en:'Seijogakuin-mae, Odakyu main line.',ja:'成城学園前駅（小田急小田原線）。'} },
  { id:'komae-od', st:'komae', en:'Komae', ja:'狛江',
    gem:{en:'Tokyo\'s smallest city — everything about it is a bit more relaxed, a bit cheaper, a bit friendlier.',ja:'東京都最小の市 — 何もかもがちょっとゆったり、ちょっと安い、ちょっと親切。'},
    noiseWatch:null,
    ax:{quiet:4,old:2,intl:1,food:3,refined:2,craft:2,green:4,photo:2,night:2},
    access:{en:'Komae, Odakyu main line.',ja:'狛江駅（小田急小田原線）。'} },
  { id:'gotokuji-od', st:'gotokuji', en:'Gotokuji', ja:'豪徳寺',
    gem:{en:'Gotokuji temple — said to be the origin of the lucky cat figure. Quiet old-town streets with a distinctive local shrine culture.',ja:'豪徳寺 — 招き猫発祥の地とされる寺院。静かな下町の街並みと地元の神社文化。'},
    noiseWatch:null,
    ax:{quiet:4,old:5,intl:1,food:3,refined:2,craft:3,green:3,photo:4,night:1},
    access:{en:'Gotokuji, Odakyu main line. Tokyu Setagaya tram nearby.',ja:'豪徳寺駅（小田急線）。東急世田谷線が近い。'} },
];
const PKQ = [
  { q:{en:'Quiet residential or lively station area?',ja:'静かな住宅地 or 活気ある駅前？'}, ax:{quiet:[1,0]} },
  { q:{en:'Old-town character or modern and new?',ja:'昔ながらの雰囲気 or 新しくモダン？'}, ax:{old:[1,0]} },
  { q:{en:'International feel or local and Japanese?',ja:'国際的な雰囲気 or 地元らしさ？'}, ax:{intl:[1,0]} },
  { q:{en:'Good restaurants and cafes or everyday essentials?',ja:'飲食店・カフェ充実 or 日用品重視？'}, ax:{food:[1,0]} },
  { q:{en:'Dining out options or cooking at home?',ja:'外食派 or 自炊派？'}, ax:{refined:[1,0]} },
  { q:{en:'Nearby parks or central city density?',ja:'公園・緑 or 都心の密度？'}, ax:{green:[1,0]} },
  { q:{en:'Interesting streetscape or plain and practical?',ja:'個性的な街並み or シンプルで実用的？'}, ax:{photo:[1,0]} },
  { q:{en:'Things to do at night or quiet evenings?',ja:'夜の選択肢 or 静かな夜？'}, ax:{night:[1,0]} },
];

const POCKETS_R3 = POCKETS;
const PQ = PKQ;
