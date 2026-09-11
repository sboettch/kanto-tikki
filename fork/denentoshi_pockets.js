/* HomeTikki · DEN-EN-TOSHI — pockets */
const POCKETS = [
  { id:'sangenjaya-dt', st:'sangenjaya', en:'Sangenjaya', ja:'三軒茶屋',
    gem:{en:'Carrot Tower and the Triangle commercial area — the most lively station on the line.',ja:'キャロットタワーと三角地帯 — 沿線で最も活気ある駅。'},
    noiseWatch:{en:'Izakaya strip along Triangle can be loud on weekday evenings and weekends.',ja:'三角地帯の居酒屋街は平日夜と週末に騒がしい。'},
    ax:{quiet:2,old:3,intl:2,food:5,refined:3,craft:3,green:2,photo:3,night:4},
    access:{en:'Sangenjaya station, Den-en-toshi Line + Tokyu Setagaya tram.',ja:'三軒茶屋駅（東急田園都市線・世田谷線）。'} },
  { id:'futakotamagawa-dt', st:'futakotamagawa', en:'Futako-Tamagawa', ja:'二子玉川',
    gem:{en:'Tama River banks and the Rise — Tokyo\'s best riverside park combined with high-end shopping.',ja:'多摩川河川敷とライズ — 東京最高の川沿い公園と高級ショッピングの組み合わせ。'},
    noiseWatch:null,
    ax:{quiet:2,old:1,intl:3,food:4,refined:5,craft:2,green:5,photo:4,night:3},
    access:{en:'Futako-Tamagawa, Den-en-toshi + Oimachi Line.',ja:'二子玉川駅（東急田園都市線・大井町線）。'} },
  { id:'mizonokuchi-dt', st:'mizonokuchi', en:'Mizonokuchi', ja:'溝の口',
    gem:{en:'The outer corridor\'s main hub — big shotengai, JR connection, affordable prices close to Tokyo.',ja:'外縁部の主要拠点 — 大型商店街、JR乗換、東京に近い割安価格。'},
    noiseWatch:{en:'Station area izakaya get noisy on weekend evenings.',ja:'駅周辺の居酒屋は週末夜に騒がしい。'},
    ax:{quiet:2,old:2,intl:1,food:4,refined:3,craft:2,green:2,photo:2,night:3},
    access:{en:'Mizonokuchi, Den-en-toshi + JR Nambu Line.',ja:'溝の口駅（東急田園都市線・JR南武線）。'} },
];
const PKQ = [
  { q:{en:'Quiet street or active neighbourhood?',ja:'静かな街 or 活気ある街？'}, ax:{quiet:[1,0]} },
  { q:{en:'Old-town feel or modern residential?',ja:'昔ながらの雰囲気 or 現代的な住宅地？'}, ax:{old:[1,0]} },
  { q:{en:'International or local Japanese?',ja:'国際的 or 地元の日本らしさ？'}, ax:{intl:[1,0]} },
  { q:{en:'Lots of restaurants and cafes or everyday shopping?',ja:'飲食店・カフェ多い or 日常の買い物重視？'}, ax:{food:[1,0]} },
  { q:{en:'Fine dining or practical and affordable?',ja:'高級飲食店 or リーズナブルで実用的？'}, ax:{refined:[1,0]} },
  { q:{en:'Parks and green space or urban convenience?',ja:'公園・緑 or 都市の利便性？'}, ax:{green:[1,0]} },
  { q:{en:'Photogenic streets or plain and functional?',ja:'映える街並み or シンプルで実用的？'}, ax:{photo:[1,0]} },
  { q:{en:'Evening options nearby or early nights?',ja:'夜の選択肢あり or 早寝？'}, ax:{night:[1,0]} },
];

const POCKETS_R3 = POCKETS;
const PQ = PKQ;
