#!/usr/bin/env python3
"""kanto_suumo_scraper.py — SUUMO ward-page scraper (no browser needed).

SUUMO serves real listing HTML server-side — no JS rendering required.
Uses requests + BeautifulSoup with polite backoff.

Ward pages tried per station group:
  Minato-ku:   /chintai/tokyo/sc_minato/
  Shinagawa:   /chintai/tokyo/sc_shinagawa/
  Ota-ku:      /chintai/tokyo/sc_ota/
  Kawasaki:    /chintai/kanagawa/sc_kawasaki_kawasaki/
  Tsurumi:     /chintai/kanagawa/sc_yokohama_tsurumi/
  Kanagawa-ku: /chintai/kanagawa/sc_yokohama_kanagawa/
  Nishi-ku:    /chintai/kanagawa/sc_yokohama_nishi/

Each ward page is filtered by station keyword in the building's station field.
Results appended to kanto_scraped.json.

Usage:
  python3 kanto_suumo_scraper.py --only shimbashi,daimon,mita
  python3 kanto_suumo_scraper.py          # all 17 stations
"""
import re, json, time, random, sys, argparse
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("pip install requests beautifulsoup4 lxml"); sys.exit(1)

OUT_DIR  = Path(__file__).parent
OUT_JSON = OUT_DIR / "kanto_scraped.json"
OUT_JS   = OUT_DIR / "kanto_scraped_js.txt"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Referer': 'https://suumo.jp/',
}

# Station → (sid, ja keywords to match in station field, SUUMO ward URL, max pages)
STATIONS = [
    # sid           keywords to match in station access text              SUUMO ward URL                                              pages
    ('shimbashi',  ['新橋'],                                              'https://suumo.jp/chintai/tokyo/sc_minato/',                 3),
    ('daimon',     ['大門', '浜松町', '芝公園'],                           'https://suumo.jp/chintai/tokyo/sc_minato/',                 4),
    ('mita',       ['三田', '泉岳寺', '白金'],                             'https://suumo.jp/chintai/tokyo/sc_minato/',                 3),
    ('sengakuji',  ['泉岳寺', '三田', '高輪'],                             'https://suumo.jp/chintai/tokyo/sc_minato/',                 4),
    ('shinagawa',  ['品川'],                                              'https://suumo.jp/chintai/tokyo/sc_shinagawa/',              3),
    ('kitashina',  ['北品川', '新馬場', '青物横丁'],                        'https://suumo.jp/chintai/tokyo/sc_shinagawa/',              3),
    ('samezu',     ['鮫洲', '立会川', '大森海岸'],                          'https://suumo.jp/chintai/tokyo/sc_shinagawa/',              4),
    ('heiwajima',  ['平和島', '大森海岸', '大森'],                          'https://suumo.jp/chintai/tokyo/sc_ota/',                    4),
    ('rokugodote', ['六郷土手', '雑色', '糀谷'],                            'https://suumo.jp/chintai/tokyo/sc_ota/',                    4),
    ('hatcho',     ['八丁畷', '川崎', '鶴見'],                             'https://suumo.jp/chintai/kanagawa/sc_kawasakishikawasaki/', 3),
    ('ichiba',     ['市場', '鶴見', '国道'],                               'https://suumo.jp/chintai/kanagawa/sc_yokohamashitsurumi/',  3),
    ('kagetsu',    ['花月', '生麦', '鶴見'],                               'https://suumo.jp/chintai/kanagawa/sc_yokohamashitsurumi/',  3),
    ('namamugi',   ['生麦', '花月', '鶴見'],                               'https://suumo.jp/chintai/kanagawa/sc_yokohamashitsurumi/',  3),
    ('shinkoyasu', ['新子安', '子安', '東神奈川'],                          'https://suumo.jp/chintai/kanagawa/sc_yokohamashikanagawa/', 3),
    ('shimmachi',  ['新町', '東神奈川', '仲木戸'],                          'https://suumo.jp/chintai/kanagawa/sc_yokohamashikanagawa/', 3),
    ('hkanagawa',  ['東神奈川', '新子安', '仲木戸'],                        'https://suumo.jp/chintai/kanagawa/sc_yokohamashikanagawa/', 3),
    ('yokohama',   ['横浜', '神奈川'],                                     'https://suumo.jp/chintai/kanagawa/sc_yokohamashinishi/',    3),
]

sess = requests.Session()
sess.headers.update(HEADERS)

def get(url, retries=2):
    for i in range(retries + 1):
        try:
            r = sess.get(url, timeout=20)
            if r.status_code == 200:
                return r
            if r.status_code in (429, 503):
                wait = 15 + i * 20
                print(f"    rate-limited {r.status_code}, sleeping {wait}s…")
                time.sleep(wait)
            else:
                print(f"    HTTP {r.status_code}")
                return None
        except Exception as e:
            print(f"    error: {e}")
            time.sleep(5)
    return None

def _yen(txt):
    txt = txt or ''
    m = re.search(r'([\d,]+)\s*万', txt)
    if m: return int(m.group(1).replace(',','')) * 10000
    # bare number — only trust if already looks like monthly rent (>= 30000)
    m = re.search(r'([\d,]+)', txt)
    if m:
        v = int(m.group(1).replace(',',''))
        return v if v >= 30000 else None
    return None

def _m2(txt):
    m = re.search(r'([\d.]+)\s*m', txt or '')
    return float(m.group(1)) if m else None

def _walk(txt):
    # SUUMO access text: e.g. "東京メトロ銀座線「新橋」歩5分"
    m = re.search(r'歩\s*(\d+)\s*分', txt or '')
    if m: return int(m.group(1))
    m = re.search(r'徒歩\s*(\d+)\s*分', txt or '')
    if m: return int(m.group(1))
    m = re.search(r'walk\s*(\d+)', txt or '', re.I)
    if m: return int(m.group(1))
    return None

def scrape_station(sid, keywords, base_url, max_pages=2):
    results = []
    seen_names = set()
    for page in range(1, max_pages + 1):
        url = base_url + (f'?page={page}' if page > 1 else '')
        print(f"  [SUUMO] {sid} p{page}: {url}")
        r = get(url)
        if not r:
            break
        soup = BeautifulSoup(r.text, 'html.parser')
        buildings = soup.select('.cassetteitem')
        if not buildings:
            print(f"    no buildings on page {page}")
            break

        matched_on_page = 0
        for bldg in buildings:
            # Building name
            name_el = bldg.select_one('.cassetteitem_content-title')
            name = name_el.get_text(strip=True) if name_el else ''

            # Station/access info for this building
            access_el = bldg.select_one('.cassetteitem_detail-col1')
            access_txt = access_el.get_text(' ', strip=True) if access_el else ''

            # Check if any keyword matches this building's station
            if not any(kw in access_txt for kw in keywords):
                continue

            # Walk time
            walk = _walk(access_txt)

            # Built/floors
            detail2 = bldg.select_one('.cassetteitem_detail-col2')
            built = detail2.get_text(strip=True) if detail2 else ''

            # Individual units within this building
            rows = bldg.select('tbody tr, .cassetteitem_other')
            if not rows:
                rows = bldg.select('tr')

            for row in rows[:4]:
                rent_el  = row.select_one('.cassetteitem_other-emphasis')
                layout_el = row.select_one('.cassetteitem_madori')
                m2_el    = row.select_one('.cassetteitem_menseki')
                link_el  = row.select_one('a[href*="/chintai/"]')

                rent_txt  = rent_el.get_text(strip=True) if rent_el else ''
                layout    = layout_el.get_text(strip=True) if layout_el else '1K'
                m2_txt    = m2_el.get_text(strip=True) if m2_el else ''
                href      = link_el['href'] if link_el else ''
                unit_url  = ('https://suumo.jp' + href) if href.startswith('/') else (href or url)

                rent = _yen(rent_txt)
                if not rent or rent < 40000:
                    continue

                key = (name[:30], rent, layout)
                if key in seen_names:
                    continue
                seen_names.add(key)

                results.append({
                    'src': 'SUUMO', 'sid': sid,
                    'name': name[:80],
                    'rent': rent,
                    'mgmt': None,
                    'layout': layout,
                    'm2': _m2(m2_txt),
                    'built': built[:30],
                    'walk': walk,
                    'st_txt': access_txt[:60],
                    'url': unit_url,
                })
                matched_on_page += 1
                if len(results) >= 8:
                    break
            if len(results) >= 8:
                break

        print(f"    matched {matched_on_page} units, {len(results)} total so far")
        if len(results) >= 8:
            break
        time.sleep(random.uniform(2.5, 4.0))

    return results


def format_js(results, start_id=34):
    lines = ['const SUUMO = "SUUMO";\nconst ATHOME = "AtHome";\nconst GAIJINPOT = "GaijinPot";\n']
    seen = set(); lv = start_id
    for r in results:
        key = (r['sid'], r['name'][:30])
        if key in seen: continue
        seen.add(key)
        rent = r['rent']
        if not rent or rent < 40000: continue
        walk   = r['walk'] or 8
        layout = r['layout'] or '1K'
        m2_s   = f", m2:{r['m2']}" if r.get('m2') else ''
        blt_s  = f", built:{json.dumps(r['built'])}" if r.get('built') else ''
        mg_s   = f", mgmt:{r['mgmt']}" if r.get('mgmt') else ''
        lines.append(
            f"{{ id:'lv{lv:02d}', name:{{en:{json.dumps(r['name'])}}}, st:{json.dumps(r['sid'])}, tier:'LIVE', srcName:SUUMO,\n"
            f"  url:{json.dumps(r['url'])}, rent:{rent}{mg_s}, layout:{json.dumps(layout)}{m2_s}{blt_s},\n"
            f"  listed:{{st:{{en:{json.dumps(r['st_txt'][:40] or r['sid'])}}}, walk:{walk}}} }},"
        )
        lv += 1
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--only', default=None, help='comma-separated station IDs')
    args = parser.parse_args()

    targets = STATIONS
    if args.only:
        only_ids = set(args.only.split(','))
        targets = [s for s in STATIONS if s[0] in only_ids]
        if not targets:
            print(f"No match for: {args.only}"); return

    new_results = []
    for sid, keywords, base_url, max_pages in targets:
        print(f"\n{'='*55}\n{sid}\n{'='*55}")
        got = scrape_station(sid, keywords, base_url, max_pages)
        print(f"  → {len(got)} listings for {sid}")
        new_results.extend(got)
        time.sleep(random.uniform(2.0, 3.5))

    # Append deduped results
    existing = []
    if OUT_JSON.exists():
        try: existing = json.loads(OUT_JSON.read_text())
        except: pass
    existing_keys = {(r['sid'], r['name'][:30]) for r in existing}
    added = [r for r in new_results if (r['sid'], r['name'][:30]) not in existing_keys]
    all_results = existing + added

    print(f"\n{'='*55}")
    print(f"This run: {len(new_results)} scraped, {len(added)} new → {len(all_results)} total")
    OUT_JSON.write_text(json.dumps(all_results, ensure_ascii=False, indent=2))
    OUT_JS.write_text(format_js(all_results))
    print(f"→ {OUT_JSON}")
    print("DONE")

if __name__ == '__main__':
    main()
