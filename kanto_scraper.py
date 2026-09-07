#!/usr/bin/env python3
"""kanto_scraper.py — polite multi-site listing puller for 17 REP stations.

Sites cycled (in order of preference per station):
  1. LIFULL HOME'S  (homes.co.jp)  — station slug search
  2. SUUMO          (suumo.jp)     — station area search
  3. AtHome         (athome.co.jp) — keyword search fallback

Output: kanto_scraped.json  (raw)
        kanto_scraped_js.txt (formatted JS records ready to paste into kanto_live.js)

Polite settings: 2–4s random delay between requests, 1 retry on 429/503.
"""
import time, random, json, re, sys
from urllib.parse import urlencode, quote
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("pip install requests beautifulsoup4 lxml")
    sys.exit(1)

# ── Target stations ──────────────────────────────────────────────────────────
TARGETS = [
    # id          Japanese name   LIFULL slug                          SUUMO station area
    ('shimbashi',  '新橋',        'tokyo/minato-city/shimbashi-station',      'sc_minato'),
    ('daimon',     '大門',        'tokyo/minato-city/daimon-station',         'sc_minato'),
    ('mita',       '三田',        'tokyo/minato-city/mita-station',           'sc_minato'),
    ('sengakuji',  '泉岳寺',     'tokyo/minato-city/sengakuji-station',      'sc_minato'),
    ('shinagawa',  '品川',        'tokyo/shinagawa-city/shinagawa-station',   'sc_shinagawa'),
    ('kitashina',  '北品川',      'tokyo/shinagawa-city/kitashinagawa-station','sc_shinagawa'),
    ('samezu',     '鮫洲',        'tokyo/shinagawa-city/samezu-station',      'sc_shinagawa'),
    ('heiwajima',  '平和島',      'tokyo/ota-city/heiwajima-station',         'sc_ota'),
    ('rokugodote', '六郷土手',    'tokyo/ota-city/rokugodote-station',        'sc_ota'),
    ('hatcho',     '八丁畷',      'kanagawa/kawasaki_kawasaki-city/hatchonawate-station', 'sc_kawasaki_kawasaki'),
    ('ichiba',     '市場',        'kanagawa/yokohama_tsurumi-city/ichiba-station',         'sc_yokohama_tsurumi'),
    ('kagetsu',    '花月総持寺',  'kanagawa/yokohama_tsurumi-city/kagetsuarai-station',    'sc_yokohama_tsurumi'),
    ('namamugi',   '生麦',        'kanagawa/yokohama_tsurumi-city/namamugi-station',       'sc_yokohama_tsurumi'),
    ('shinkoyasu', '新子安',      'kanagawa/yokohama_kanagawa-city/shinkoyasu-station',    'sc_yokohama_kanagawa'),
    ('shimmachi',  '新町',        'kanagawa/yokohama_kanagawa-city/shimmachi-station',     'sc_yokohama_kanagawa'),
    ('hkanagawa',  '東神奈川',    'kanagawa/yokohama_kanagawa-city/higashikanagawa-station','sc_yokohama_kanagawa'),
    ('yokohama',   '横浜',        'kanagawa/yokohama_nishi-city/yokohama-station',         'sc_yokohama_nishi'),
]

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/127.0.0.0 Safari/537.36'
    ),
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

sess = requests.Session()
sess.headers.update(HEADERS)

def polite_get(url, retries=2):
    for attempt in range(retries + 1):
        try:
            r = sess.get(url, timeout=15)
            if r.status_code == 200:
                return r
            if r.status_code in (429, 503):
                wait = 10 + attempt * 15
                print(f"    rate-limited ({r.status_code}), sleeping {wait}s…")
                time.sleep(wait)
            else:
                print(f"    HTTP {r.status_code} for {url}")
                return None
        except Exception as e:
            print(f"    error: {e}")
            time.sleep(5)
    return None

def sleep_polite():
    time.sleep(random.uniform(2.5, 4.5))


# ── LIFULL HOME'S scraper ────────────────────────────────────────────────────
def scrape_lifull(sid, slug, max_pages=2):
    results = []
    for page in range(1, max_pages + 1):
        url = f"https://www.homes.co.jp/chintai/{slug}/list/?page={page}"
        print(f"  [LIFULL] {sid} page {page}: {url}")
        r = polite_get(url)
        if not r:
            break
        soup = BeautifulSoup(r.text, 'html.parser')
        # LIFULL listing cards
        cards = soup.select('li.prg-cassetteItem')
        if not cards:
            # alternate selector
            cards = soup.select('.mod-mergeBuilding--collection')
        if not cards:
            print(f"    no cards found — page structure may have changed")
            break
        for card in cards:
            try:
                rec = _parse_lifull_card(card, sid)
                if rec:
                    results.append(rec)
            except Exception as e:
                print(f"    parse error: {e}")
        sleep_polite()
    return results

def _parse_lifull_card(card, sid):
    # Building name
    name_el = card.select_one('.bukkenName') or card.select_one('[class*="buildingName"]')
    name = name_el.get_text(strip=True) if name_el else ''

    # Rent
    rent_el = card.select_one('.priceLabel') or card.select_one('[class*="price"]')
    rent_txt = rent_el.get_text(strip=True) if rent_el else ''
    rent = _parse_yen(rent_txt)

    # Layout
    layout_el = card.select_one('[class*="layout"]') or card.select_one('[class*="madori"]')
    layout = layout_el.get_text(strip=True) if layout_el else ''

    # m2
    m2_el = card.select_one('[class*="m2"]') or card.select_one('[class*="menseki"]')
    m2_txt = m2_el.get_text(strip=True) if m2_el else ''
    m2 = _parse_m2(m2_txt)

    # Station/walk
    st_el = card.select_one('[class*="station"]') or card.select_one('[class*="access"]')
    st_txt = st_el.get_text(strip=True) if st_el else ''
    walk = _parse_walk(st_txt)

    # URL
    link_el = card.select_one('a[href*="/chintai/"]') or card.select_one('a[href]')
    href = link_el['href'] if link_el else ''
    full_url = ('https://www.homes.co.jp' + href) if href.startswith('/') else href

    # Built
    built_el = card.select_one('[class*="built"]') or card.select_one('[class*="chiku"]')
    built = built_el.get_text(strip=True) if built_el else ''

    if not name or not rent:
        return None
    return {
        'src': 'LIFULL',
        'sid': sid,
        'name': name,
        'rent': rent,
        'layout': layout or '1K',
        'm2': m2,
        'built': built,
        'walk': walk,
        'st_txt': st_txt[:80],
        'url': full_url,
    }


# ── SUUMO scraper ────────────────────────────────────────────────────────────
def scrape_suumo(sid, area, max_pages=2):
    results = []
    for page in range(1, max_pages + 1):
        url = f"https://suumo.jp/chintai/{area}/station/?page={page}"
        print(f"  [SUUMO] {sid} page {page}: {url}")
        r = polite_get(url)
        if not r:
            break
        soup = BeautifulSoup(r.text, 'html.parser')
        cards = soup.select('.cassetteitem')
        if not cards:
            print(f"    no SUUMO cards — may need JS")
            break
        for card in cards:
            try:
                rows = card.select('.cassetteitem_other')
                name_el = card.select_one('.cassetteitem_content-title')
                name = name_el.get_text(strip=True) if name_el else ''
                st_el = card.select_one('.cassetteitem_detail-col1')
                st_txt = st_el.get_text(strip=True) if st_el else ''
                walk = _parse_walk(st_txt)
                for row in rows[:3]:  # max 3 units per building
                    rent_el = row.select_one('.cassetteitem_other-emphasis')
                    rent_txt = rent_el.get_text(strip=True) if rent_el else ''
                    rent = _parse_yen(rent_txt)
                    layout_el = row.select_one('.cassetteitem_madori')
                    layout = layout_el.get_text(strip=True) if layout_el else ''
                    m2_el = row.select_one('.cassetteitem_menseki')
                    m2_txt = m2_el.get_text(strip=True) if m2_el else ''
                    m2 = _parse_m2(m2_txt)
                    link_el = row.select_one('a[href*="/chintai/"]')
                    href = link_el['href'] if link_el else ''
                    full_url = ('https://suumo.jp' + href) if href.startswith('/') else href
                    if not rent or not name:
                        continue
                    results.append({
                        'src': 'SUUMO',
                        'sid': sid,
                        'name': name,
                        'rent': rent,
                        'layout': layout or '1K',
                        'm2': m2,
                        'built': '',
                        'walk': walk,
                        'st_txt': st_txt[:80],
                        'url': full_url,
                    })
            except Exception as e:
                print(f"    parse err: {e}")
        sleep_polite()
    return results


# ── AtHome fallback ──────────────────────────────────────────────────────────
def scrape_athome(sid, ja_name):
    results = []
    url = f"https://www.athome.co.jp/chintai/list/?ENSEN_NAME={quote(ja_name)}&STATION_NAME={quote(ja_name)}"
    print(f"  [AtHome] {sid}: {url}")
    r = polite_get(url)
    if not r:
        return results
    soup = BeautifulSoup(r.text, 'html.parser')
    cards = soup.select('.object-items__item') or soup.select('[class*="PropertyCard"]')
    for card in cards[:10]:
        try:
            name_el = card.select_one('[class*="name"]') or card.select_one('h3')
            name = name_el.get_text(strip=True) if name_el else ''
            rent_el = card.select_one('[class*="price"]') or card.select_one('[class*="rent"]')
            rent_txt = rent_el.get_text(strip=True) if rent_el else ''
            rent = _parse_yen(rent_txt)
            layout_el = card.select_one('[class*="layout"]') or card.select_one('[class*="madori"]')
            layout = layout_el.get_text(strip=True) if layout_el else '1K'
            link_el = card.select_one('a')
            href = link_el['href'] if link_el else ''
            full_url = ('https://www.athome.co.jp' + href) if href.startswith('/') else href
            if not rent or not name:
                continue
            results.append({
                'src': 'AtHome',
                'sid': sid,
                'name': name,
                'rent': rent,
                'layout': layout,
                'm2': None,
                'built': '',
                'walk': None,
                'st_txt': '',
                'url': full_url,
            })
        except Exception as e:
            print(f"    parse err: {e}")
    sleep_polite()
    return results


# ── Helpers ──────────────────────────────────────────────────────────────────
def _parse_yen(txt):
    txt = re.sub(r'[^\d,万円]', '', txt)
    m = re.search(r'([\d,]+)万', txt)
    if m:
        return int(m.group(1).replace(',', '')) * 10000
    m = re.search(r'([\d,]+)', txt)
    if m:
        v = int(m.group(1).replace(',', ''))
        return v if v > 10000 else v * 1000
    return None

def _parse_m2(txt):
    m = re.search(r'([\d.]+)\s*m', txt)
    return float(m.group(1)) if m else None

def _parse_walk(txt):
    m = re.search(r'(\d+)\s*分', txt)
    return int(m.group(1)) if m else None


# ── JS formatter ─────────────────────────────────────────────────────────────
LV_START = 34  # next listing ID after lv33

def format_js(results, start_id=LV_START):
    lines = []
    seen = set()
    lv = start_id
    for r in results:
        key = (r['sid'], r['name'][:30])
        if key in seen:
            continue
        seen.add(key)
        rent = r['rent']
        if not rent or rent < 40000 or rent > 800000:
            continue
        walk = r['walk'] or 8
        layout = r['layout'] or '1K'
        m2_str = f", m2:{r['m2']}" if r['m2'] else ''
        built_str = f", built:{json.dumps(r['built'])}" if r['built'] else ''
        name_clean = r['name'].replace("'", "\\'")[:60]
        src_const = 'LIFULL' if r['src'] == 'LIFULL' else ("SUUMO" if r['src'] == 'SUUMO' else "ATHOME")
        lines.append(
            f"{{ id:'lv{lv:02d}', name:{{en:{json.dumps(name_clean)}}}, st:{json.dumps(r['sid'])}, "
            f"tier:'LIVE', srcName:{src_const},\n"
            f"  url:{json.dumps(r['url'])}, rent:{rent}, layout:{json.dumps(layout)}{m2_str}{built_str},\n"
            f"  listed:{{st:{{en:{json.dumps(r['st_txt'][:40])}}}, walk:{walk}}} }},"
        )
        lv += 1
    return '\n'.join(lines)


# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    all_results = []
    for sid, ja, lifull_slug, suumo_area in TARGETS:
        print(f"\n{'='*60}")
        print(f"Station: {sid} ({ja})")
        print(f"{'='*60}")

        got = scrape_lifull(sid, lifull_slug, max_pages=2)
        print(f"  → LIFULL: {len(got)} listings")
        all_results.extend(got)

        # Always also try SUUMO for diversity
        got2 = scrape_suumo(sid, suumo_area, max_pages=1)
        print(f"  → SUUMO: {len(got2)} listings")
        all_results.extend(got2)

        # AtHome as fallback if we got nothing
        if len(got) + len(got2) == 0:
            got3 = scrape_athome(sid, ja)
            print(f"  → AtHome: {len(got3)} listings (fallback)")
            all_results.extend(got3)

        print(f"  subtotal: {len(all_results)} total so far")
        sleep_polite()

    print(f"\n{'='*60}")
    print(f"Total scraped: {len(all_results)}")

    # Save raw JSON
    out_json = '/Volumes/T9/makingpancakes/context/bayarearealestate/claude/hometikki-fork/kanto/kanto_scraped.json'
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"Raw JSON → {out_json}")

    # Save formatted JS
    out_js = '/Volumes/T9/makingpancakes/context/bayarearealestate/claude/hometikki-fork/kanto/kanto_scraped_js.txt'
    js_text = format_js(all_results)
    # Prepend the constants SUUMO/ATHOME need
    header = "const SUUMO = 'SUUMO';\nconst ATHOME = 'AtHome';\n\n"
    with open(out_js, 'w', encoding='utf-8') as f:
        f.write(header + js_text)
    print(f"JS records → {out_js}")
    print(f"\nNext: review kanto_scraped.json, then paste selected records into kanto_live.js")

if __name__ == '__main__':
    main()
