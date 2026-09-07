#!/usr/bin/env node
/**
 * HomeTikki Kanto — Listing Scraper
 * Fetches LIFULL HOME'S ward list pages + PLAZA HOMES for the Keikyu corridor.
 * Outputs: kanto/kanto_live.js (overwrites)
 *
 * Usage:
 *   node kanto/scripts/scrape_kanto_live.js           # full run
 *   node kanto/scripts/scrape_kanto_live.js --dry-run  # validate only, no write
 *   node kanto/scripts/scrape_kanto_live.js --pages 1  # 1 page per ward (quick test)
 *   node kanto/scripts/scrape_kanto_live.js --list-only # skip detail page fetches
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dir, '..', '..');
const OUT   = join(ROOT, 'kanto', 'kanto_live.js');

const args    = process.argv.slice(2);
const DRY     = args.includes('--dry-run');
const PAGES   = parseInt(args[args.indexOf('--pages') + 1] || '3', 10);
const DETAIL  = !args.includes('--list-only');
const VERBOSE = args.includes('--verbose');

// ── Station name → corridor ID ──────────────────────────────────────
const ST_MAP = {
  '人形町':'ningyocho','浜町':'ningyocho','水天宮前':'ningyocho','馬喰町':'ningyocho',
  '日本橋':'nihombashi','茅場町':'nihombashi',
  '宝町':'takaracho','八丁堀':'takaracho',
  '東銀座':'hgashiginza','銀座':'hgashiginza','新富町':'hgashiginza',
  '新橋':'shimbashi',
  '大門':'daimon','浜松町':'daimon',
  '三田':'mita',
  '泉岳寺':'sengakuji',
  '品川':'shinagawa',
  '北品川':'kitashina',
  '新馬場':'shimbamba',
  '青物横丁':'aomono',
  '鮫洲':'samezu',
  '立会川':'tachiaigawa',
  '平和島':'heiwajima',
  '大森海岸':'omorikaigan',
  '大森町':'omorimachi',
  '梅屋敷':'umeyashiki','池上':'umeyashiki',
  '蒲田':'kamata','西馬込':'kamata','矢口渡':'kamata',
  '雑色':'zoshiki',
  '六郷土手':'rokugodote',
  '八丁畷':'hatcho',
  '市場':'ichiba','鶴見市場':'ichiba',
  '京急川崎':'kawasaki','川崎':'kawasaki',
  '港町':'kawasaki','鈴木町':'kawasaki','川崎大師':'kawasaki','小島新田':'kawasaki',
  '京急鶴見':'tsurumi','鶴見':'tsurumi',
  '花月総持寺':'kagetsu','花月園':'kagetsu',
  '生麦':'namamugi',
  '新子安':'shinkoyasu',
  '子安':'koyasu','大口':'koyasu',
  '神奈川新町':'shimmachi','仲木戸':'shimmachi',
  '東神奈川':'hkanagawa',
  '神奈川':'kanagawa','反町':'kanagawa',
  '横浜':'yokohama',
};

function stationToId(name) {
  if (!name) return null;
  for (const [k, v] of Object.entries(ST_MAP)) {
    if (name.includes(k)) return v;
  }
  return null;
}

// ── Ward list pages ──────────────────────────────────────────────────
const WARDS = [
  { key:'chuo',      url:'https://www.homes.co.jp/chintai/tokyo/chuo-city/list/' },
  { key:'shinagawa', url:'https://www.homes.co.jp/chintai/tokyo/shinagawa-city/list/' },
  { key:'ota',       url:'https://www.homes.co.jp/chintai/tokyo/ota-city/list/' },
  { key:'kawasaki',  url:'https://www.homes.co.jp/chintai/kanagawa/kawasaki_kawasaki-city/list/' },
  { key:'tsurumi',   url:'https://www.homes.co.jp/chintai/kanagawa/yokohama_tsurumi-city/list/' },
  { key:'kanagawa',  url:'https://www.homes.co.jp/chintai/kanagawa/yokohama_kanagawa-city/list/' },
  { key:'nishi',     url:'https://www.homes.co.jp/chintai/kanagawa/yokohama_nishi-city/list/' },
];

// ── Fetch ─────────────────────────────────────────────────────────────
let lastFetch = 0;
async function get(url) {
  const gap = 1500 - (Date.now() - lastFetch);
  if (gap > 0) await new Promise(r => setTimeout(r, gap));
  lastFetch = Date.now();
  if (VERBOSE) console.log(`    GET ${url}`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja,en-US;q=0.7,en;q=0.5',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ── Parse LIFULL list page ────────────────────────────────────────────
function parseListPage(html, wardKey) {
  const out = [];
  // Extract each listing anchor: href + building name + floor
  const re = /href="(https?:\/\/www\.homes\.co\.jp\/chintai\/(?:b-|room\/)[^"]+)"[^>]*>\s*(?:<[^>]*>)*\s*<span class="bukkenName">(.*?)<\/span>(?:[\s\S]*?<span class="bukkenRoom">(.*?)<\/span>)?/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1].split('?')[0];
    const name = m[2].replace(/<[^>]+>/g, '').trim();
    const room = (m[3] || '').replace(/<[^>]+>/g, '').trim();

    // Get 2kb of context after this match for spec data
    const ctx = html.slice(m.index, m.index + 2500);

    // Rent: "10.1万円"
    const rentM = ctx.match(/<span class="num">([\d.]+)<\/span>\s*万円/);
    if (!rentM) continue;
    const rent = Math.round(parseFloat(rentM[1]) * 10000);
    if (rent < 30000 || rent > 2000000) continue;

    // mgmt
    const mgmtM = ctx.match(/万円\s*[^\d<]*[\/／]\s*([\d,]+)\s*円/);
    const mgmt = mgmtM ? parseInt(mgmtM[1].replace(/,/g,''), 10) : null;

    // Traffic
    const trafficM = ctx.match(/<td[^>]*class="traffic"[^>]*>([\s\S]*?)<\/td>/);
    const trafficTxt = trafficM ? trafficM[1].replace(/<[^>]+>/g,' ').trim() : '';
    // Station: last station-like word before 徒歩
    const stM = trafficTxt.match(/([^\s　]+)\s*(?:駅)?\s*徒歩/);
    const stName = stM ? stM[1].replace(/駅$/,'').trim() : null;
    const corridorId = stationToId(stName);
    if (!corridorId) continue;

    const walkM = trafficTxt.match(/徒歩\s*(\d+)\s*分/);
    const walk = walkM ? parseInt(walkM[1],10) : 8;

    // Space: "23.22m² / 1K"
    const spaceM = ctx.match(/<td[^>]*class="space"[^>]*>([\s\S]*?)<\/td>/);
    const spaceTxt = spaceM ? spaceM[1].replace(/<[^>]+>/g,' ').trim() : '';
    const m2M = spaceTxt.match(/([\d.]+)\s*m/i);
    const m2 = m2M ? parseFloat(m2M[1]) : null;
    const layoutM = spaceTxt.match(/\b(\dL?[KDSR]+(?:[+-]\dL?[KDSR]+)?)\b/i);
    const layout = layoutM ? layoutM[1].toUpperCase() : null;

    // Line name
    const lineM = trafficTxt.match(/^([^\s　]+(?:線|号線))/);
    const lineName = lineM ? lineM[1] : (corridorId && ['ningyocho','nihombashi','takaracho','hgashiginza','shimbashi','daimon','mita','sengakuji'].includes(corridorId) ? 'Toei Asakusa' : 'Keikyu');

    out.push({ url, name, room, st:corridorId, stName, line:lineName, walk, rent, mgmt, m2, layout, _ward:wardKey, _approx: stName && !Object.keys(ST_MAP).some(k=>k===stName) });
  }
  return out;
}

// ── Detail page: deposit / key / built ───────────────────────────────
async function fetchDetail(url) {
  try {
    const html = await get(url);
    const d = {};

    const field = (label) => {
      const re = new RegExp(label + '[^<]*<\\/th>[\\s\\S]*?<td[^>]*>([\\s\\S]*?)<\\/td>');
      const m = html.match(re);
      return m ? m[1].replace(/<[^>]+>/g,'').trim() : null;
    };

    // mgmt
    const mgmtTxt = field('管理費');
    if (mgmtTxt) { const m=mgmtTxt.match(/([\d,]+)\s*円/); if(m) d.mgmt=parseInt(m[1].replace(/,/g,''),10); }

    // deposit
    const depTxt = field('敷金');
    if (depTxt) {
      const mo=depTxt.match(/([\d.]+)\s*[ヶヵか]月/), yen=depTxt.match(/([\d,]+)\s*円/);
      if(mo) d.deposit_mo=parseFloat(mo[1]);
      else if(yen) d.deposit_yen=parseInt(yen[1].replace(/,/g,''),10);
      else if(/なし|^0/.test(depTxt)) d.deposit_mo=0;
    }

    // key money
    const keyTxt = field('礼金');
    if (keyTxt) {
      const mo=keyTxt.match(/([\d.]+)\s*[ヶヵか]月/), yen=keyTxt.match(/([\d,]+)\s*円/);
      if(mo) d.key_mo=parseFloat(mo[1]);
      else if(yen) d.key_yen=parseInt(yen[1].replace(/,/g,''),10);
      else if(/なし|^0/.test(keyTxt)) d.key_mo=0;
    }

    // built + floor
    const builtTxt = field('築年月') || field('築年');
    const floorTxt = field('所在階') || field('階数');
    const yr = builtTxt && builtTxt.match(/(\d{4})/);
    const fl = floorTxt && floorTxt.match(/(\d+)/);
    const newBuild = builtTxt && builtTxt.includes('新築');
    const parts = [];
    if (newBuild) parts.push('new'); else if(yr) parts.push(yr[1]);
    if (fl) parts.push(fl[1]+'F');
    if (parts.length) d.built = parts.join(' · ');

    return d;
  } catch(e) {
    if(VERBOSE) console.warn(`    detail failed ${url}: ${e.message}`);
    return {};
  }
}

// ── PLAZA HOMES ───────────────────────────────────────────────────────
async function scrapePlaza() {
  const out = [];
  for (let p=1; p<=2; p++) {
    const html = await get(`https://www.realestate-tokyo.com/rent/?page=${p}`).catch(()=>'');
    const re = /href="(https:\/\/www\.realestate-tokyo\.com\/rent\/B[\w-]+\/[^"]+)"/g;
    const urls = new Set();
    let m;
    while ((m=re.exec(html))!==null) urls.add(m[1]);

    for (const url of urls) {
      try {
        const d = await get(url);
        const name = d.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g,'').trim();
        if (!name) continue;

        // Rent: "¥206,000 / month" or "206,000円/月"
        const rentM = d.match(/[¥￥]([\d,]+)\s*(?:\/\s*mo|per month)/i) ||
                      d.match(/([\d,]+)\s*円\s*[\/／]\s*月/);
        if (!rentM) continue;
        const rent = parseInt(rentM[1].replace(/,/g,''),10);
        if (rent<50000||rent>1500000) continue;

        // Station
        const stM = d.match(/([^\s<（\(]+駅?)\s*[\(（]?徒歩?\s*(\d+)\s*分/) ||
                    d.match(/(\d+)\s*min(?:utes?)?\s*(?:walk\s*from\s*)?([^\s<,]+\s*(?:Station|駅))/i);
        let stName, walk;
        if (stM) {
          if (stM[2] && /\d/.test(stM[2])) { walk=parseInt(stM[2],10); stName=stM[1]; }
          else if (stM[1] && /\d/.test(stM[1])) { walk=parseInt(stM[1],10); stName=stM[2]; }
          else { stName=stM[1]; walk=parseInt(stM[2]||'8',10); }
        }
        stName = (stName||'').replace(/駅$/,'').replace(/\s*Station$/i,'').trim();
        const corridorId = stationToId(stName);
        if (!corridorId) continue;

        const m2M = d.match(/([\d.]+)\s*(?:m²|sqm|㎡)/i);
        const layM = d.match(/\b(\dL?[KDSR]+(?:[-–]\dL?[KDSR]+)?)\b/i);

        out.push({
          url, name, st:corridorId, stName, walk:walk||8,
          rent, m2: m2M?parseFloat(m2M[1]):null,
          layout: layM?layM[1].toUpperCase():null,
          line:'Toei Asakusa / Keikyu', en_agent:true, _ward:'plaza',
        });
      } catch { /* skip */ }
    }
  }
  return out;
}

// ── Dedup ─────────────────────────────────────────────────────────────
function dedup(arr) {
  const seen = new Map();
  return arr.filter(l => {
    const k = `${l.name}|${l.st}|${Math.round(l.rent/5000)*5000}`;
    if (seen.has(k)) return false;
    seen.set(k, true);
    return true;
  });
}

// ── Serialize ─────────────────────────────────────────────────────────
const ALL_ST = ['ningyocho','nihombashi','takaracho','hgashiginza','shimbashi','daimon','mita','sengakuji','shinagawa','kitashina','shimbamba','aomono','samezu','tachiaigawa','heiwajima','omorikaigan','omorimachi','umeyashiki','kamata','zoshiki','rokugodote','hatcho','ichiba','kawasaki','tsurumi','kagetsu','namamugi','shinkoyasu','koyasu','shimmachi','hkanagawa','kanagawa','yokohama'];

function serialize(listings) {
  const date = new Date().toISOString().slice(0,10);
  const lines = [
`/* HomeTikki · KANTO — LIVE listings.
   Auto-generated by kanto/scripts/scrape_kanto_live.js
   ${listings.length} listings · pulled ${date}
   Sources: LIFULL HOME'S ward /list/ pages · PLAZA HOMES realestate-tokyo.com
   Rents quoted exactly as listed.
   deposit/key: _mo = months of rent; _yen = fixed yen; null = not stated. */

const LIFULL = "LIFULL HOME'S";
const PLAZA  = 'PLAZA HOMES';
const H = 'https://www.homes.co.jp';

const LIVE = [`];

  // Group by ward
  const byWard = {};
  for (const l of listings) {
    const w = l._ward||l.st;
    (byWard[w]||(byWard[w]=[])).push(l);
  }

  let n = 1;
  for (const [ward, wl] of Object.entries(byWard)) {
    lines.push(`/* ————— ${ward} ————— */`);
    for (const l of wl) {
      const id = `lv${String(n++).padStart(2,'0')}`;
      const src = l.en_agent ? 'PLAZA' : 'LIFULL';
      const ea  = l.en_agent ? ', en_agent:true' : '';
      const approx = l._approx ? ', approx:true' : '';

      let s = `{ id:${JSON.stringify(id)}, name:{en:${JSON.stringify(l.name)}}, st:${JSON.stringify(l.st)}, tier:'LIVE', srcName:${src}${ea},\n`;
      s += `  url:${JSON.stringify(l.url)},\n`;
      const specParts = [`rent:${l.rent}`];
      if (l.mgmt)   specParts.push(`mgmt:${l.mgmt}`);
      if (l.layout) specParts.push(`layout:${JSON.stringify(l.layout)}`);
      if (l.m2)     specParts.push(`m2:${l.m2}`);
      if (l.built)  specParts.push(`built:${JSON.stringify(l.built)}`);
      s += `  ${specParts.join(', ')},\n`;
      if (l.deposit_mo  !== undefined) s += `  deposit_mo:${l.deposit_mo},\n`;
      if (l.deposit_yen !== undefined) s += `  deposit_yen:${l.deposit_yen},\n`;
      if (l.key_mo      !== undefined) s += `  key_mo:${l.key_mo},\n`;
      if (l.key_yen     !== undefined) s += `  key_yen:${l.key_yen},\n`;
      s += `  listed:{st:{en:${JSON.stringify(l.stName||l.st)},ja:${JSON.stringify(l.stName||l.st)}}, line:${JSON.stringify(l.line||'Keikyu')}, walk:${l.walk||8}}${approx} },`;
      lines.push(s);
    }
  }

  lines.push(`];`);

  const covered = new Set(listings.map(l=>l.st));
  const repSt = ALL_ST.filter(s=>!covered.has(s));

  lines.push(`
/* ————— REP stand-ins for stations with no live pull yet (tier S) —————
   rent = the ward souba figure itself; the card says exactly that. */
const REP_STATIONS = ${JSON.stringify(repSt)};
const REP = [];
for (const sid of REP_STATIONS){
  const st = STATIONS[S_IDX[sid]];
  const w = WARDS[st.ward];
  for (const lay of (sid==='yokohama'||sid==='shinagawa' ? ['1K','1LDK'] : ['1K'])){
    if (w.souba[lay] == null) continue;
    REP.push({ id:'rp_'+sid+'_'+lay, name:{en:\`\${st.en} \${lay} · at market\`, ja:\`\${st.ja} \${lay} · 相場水準\`},
      st:sid, tier:'REP', srcName:'souba', url:w.src, rent:w.souba[lay], layout:lay,
      listed:{st:{en:st.en, ja:st.ja}, line: st.sub?'Toei Asakusa':'Keikyu', walk:8},
      repNote:{en:\`stand-in at the \${w.en} \${lay} market rate — no live pull for this station yet\`,
               ja:\`\${w.ja}の\${lay}相場そのまま — この駅は未取得\`} });
  }
}

const HOMES = LIVE.concat(REP);
function layoutClass(l){
  const s = (l.layout||'').split('–')[0].trim();
  if (s==='1BR') return '1LDK'; if (s==='2BR') return '2LDK';
  return s || '1K';
}`);

  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log(`🏡 HomeTikki Kanto scraper — ${DRY?'DRY RUN':'LIVE'} · ${PAGES} pages/ward · detail:${DETAIL}`);
  const all = [];

  for (const ward of WARDS) {
    console.log(`  📋 ${ward.key}…`);
    for (let p=1; p<=PAGES; p++) {
      const url = p===1 ? ward.url : `${ward.url}?page=${p}`;
      try {
        const html = await get(url);
        const cards = parseListPage(html, ward.key);
        if (VERBOSE || cards.length) console.log(`     page ${p}: ${cards.length} corridor hits`);

        if (DETAIL) {
          for (const c of cards) {
            const extra = await fetchDetail(c.url);
            Object.assign(c, extra);
          }
        }
        all.push(...cards);
        if (cards.length < 3) break; // end of results
      } catch(e) {
        console.warn(`     ⚠ page ${p}: ${e.message}`);
        break;
      }
    }
  }

  console.log(`  🏢 PLAZA HOMES…`);
  const plaza = await scrapePlaza().catch(e => { console.warn(`  ⚠ PLAZA: ${e.message}`); return []; });
  console.log(`     ${plaza.length} on corridor`);
  all.push(...plaza);

  const valid = dedup(all).filter(l => l.rent>=30000 && l.st);
  const repNeeded = ALL_ST.filter(s => !valid.some(l=>l.st===s));

  console.log(`\n✅ ${valid.length} unique valid listings`);
  if (repNeeded.length) console.log(`  REP fill: ${repNeeded.join(', ')}`);

  if (DRY) {
    console.log('\n🔍 DRY RUN — no file written. Sample output:\n');
    console.log(serialize(valid).slice(0, 1200));
    return;
  }

  writeFileSync(OUT, serialize(valid), 'utf8');
  console.log(`\n💾 → ${OUT} (${valid.length} listings)`);
}

main().catch(e => { console.error(e); process.exit(1); });
