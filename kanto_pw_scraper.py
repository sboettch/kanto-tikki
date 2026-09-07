#!/usr/bin/env python3
"""kanto_pw_scraper.py — multi-source listing puller, one station at a time.

Sources cycled per station:
  1. LIFULL HOME'S  (homes.co.jp)      — most listings
  2. SUUMO          (suumo.jp)         — good station search
  3. GaijinPot      (apartments.gaijinpot.com) — English, low bot protection
  4. PLAZA HOMES    (realestate-tokyo.com)      — already our source, Minato/Shinagawa

Runs with headless=False (real visible browser) to bypass bot detection.
Results appended to kanto_scraped.json — safe to run one station at a time.

Usage:
  python3 kanto_pw_scraper.py --only shimbashi
  python3 kanto_pw_scraper.py --only daimon,mita,sengakuji
  python3 kanto_pw_scraper.py          # all 17
"""
import asyncio, json, re, random, sys
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("pip install playwright && python3 -m playwright install chromium")
    sys.exit(1)

OUT_DIR  = Path(__file__).parent
OUT_JSON = OUT_DIR / "kanto_scraped.json"
OUT_JS   = OUT_DIR / "kanto_scraped_js.txt"

TARGETS = [
    # sid           ja name       LIFULL slug                                         SUUMO station slug
    ('shimbashi',  '新橋',       'tokyo/minato-city/shimbashi-station',              'shinbashi'),
    ('daimon',     '大門',       'tokyo/minato-city/daimon-station',                 'daimon'),
    ('mita',       '三田',       'tokyo/minato-city/mita-station',                   'mita'),
    ('sengakuji',  '泉岳寺',    'tokyo/minato-city/sengakuji-station',              'sengakuji'),
    ('shinagawa',  '品川',       'tokyo/shinagawa-city/shinagawa-station',           'shinagawa'),
    ('kitashina',  '北品川',     'tokyo/shinagawa-city/kitashinagawa-station',       'kitashinagawa'),
    ('samezu',     '鮫洲',       'tokyo/shinagawa-city/samezu-station',              'samezu'),
    ('heiwajima',  '平和島',     'tokyo/ota-city/heiwajima-station',                 'heiwajima'),
    ('rokugodote', '六郷土手',   'tokyo/ota-city/rokugodote-station',                'rokugodote'),
    ('hatcho',     '八丁畷',     'kanagawa/kawasaki_kawasaki-city/hatchonawate-station', 'hachichonawate'),
    ('ichiba',     '市場',       'kanagawa/yokohama_tsurumi-city/ichiba-station',        'ichiba'),
    ('kagetsu',    '花月総持寺', 'kanagawa/yokohama_tsurumi-city/kagetsuarai-station',   'kagetsusoujiji'),
    ('namamugi',   '生麦',       'kanagawa/yokohama_tsurumi-city/namamugi-station',      'namamugi'),
    ('shinkoyasu', '新子安',     'kanagawa/yokohama_kanagawa-city/shinkoyasu-station',   'shinkoyasu'),
    ('shimmachi',  '新町',       'kanagawa/yokohama_kanagawa-city/shimmachi-station',    'shimmachi'),
    ('hkanagawa',  '東神奈川',   'kanagawa/yokohama_kanagawa-city/higashikanagawa-station', 'higashikanagawa'),
    ('yokohama',   '横浜',       'kanagawa/yokohama_nishi-city/yokohama-station',        'yokohama'),
]

# GaijinPot ward/area mapping
GP_AREAS = {
    'shimbashi': 'minato', 'daimon': 'minato', 'mita': 'minato', 'sengakuji': 'minato',
    'shinagawa': 'shinagawa', 'kitashina': 'shinagawa', 'samezu': 'shinagawa',
    'heiwajima': 'ota', 'rokugodote': 'ota',
    'hatcho': 'kawasaki', 'ichiba': 'tsurumi', 'kagetsu': 'tsurumi',
    'namamugi': 'tsurumi', 'shinkoyasu': 'kanagawa-ku', 'shimmachi': 'kanagawa-ku',
    'hkanagawa': 'kanagawa-ku', 'yokohama': 'nishi-ku',
}


# ── Helpers ──────────────────────────────────────────────────────────────────
def _yen(txt):
    m = re.search(r'([\d,]+)\s*万', txt or '')
    if m: return int(m.group(1).replace(',', '')) * 10000
    m = re.search(r'([\d,]+)', txt or '')
    if m:
        v = int(m.group(1).replace(',', ''))
        return v if v > 40000 else v * 1000
    return None

def _m2(txt):
    m = re.search(r'([\d.]+)\s*m', txt or '')
    return float(m.group(1)) if m else None

def _walk(txt):
    m = re.search(r'(\d+)\s*分', txt or '')
    if m: return int(m.group(1))
    m = re.search(r'(\d+)\s*min', txt or '')
    return int(m.group(1)) if m else None

async def _text(el, sel):
    f = await el.query_selector(sel)
    return (await f.inner_text()).strip() if f else ''

async def _wait_cards(page, selectors, timeout=15000):
    for sel in selectors:
        try:
            await page.wait_for_selector(sel, timeout=timeout)
            cards = await page.query_selector_all(sel)
            if cards: return cards
        except: pass
    return []


# ── LIFULL ───────────────────────────────────────────────────────────────────
async def scrape_lifull(page, sid, slug, max_pages=2):
    results = []
    for pn in range(1, max_pages + 1):
        url = f"https://www.homes.co.jp/chintai/{slug}/list/?page={pn}"
        print(f"  [LIFULL] {sid} p{pn}")
        try:
            await page.goto(url, timeout=40000, wait_until='networkidle')
            await page.wait_for_timeout(random.randint(2000, 3500))
        except Exception as e:
            print(f"    nav err: {e}"); break

        cards = await _wait_cards(page, [
            '.prg-cassetteItem',
            '.mod-mergeBuilding--collection',
            '[class*="cassetteItem"]',
            '[class*="bukken"]',
        ], timeout=8000)

        if not cards:
            title = await page.title()
            print(f"    no cards (title: {title[:60]})")
            # Try waiting longer and scrolling
            await page.evaluate("window.scrollTo(0, 500)")
            await page.wait_for_timeout(3000)
            cards = await page.query_selector_all('[class*="cassetteItem"], [class*="bukken"], [class*="Item"]')
            if not cards:
                break

        for card in cards[:8]:
            try:
                name = await _text(card, '.bukkenName, [class*="buildingName"], [class*="bukkenName"], h2, h3')
                rent_txt = await _text(card, '[class*="priceLabel"], [class*="賃料"], [class*="price"]')
                layout   = await _text(card, '[class*="madori"], [class*="layout"]')
                m2_txt   = await _text(card, '[class*="menseki"], [class*="m2"]')
                st_txt   = await _text(card, '[class*="traffic"], [class*="station"], [class*="access"]')
                built    = await _text(card, '[class*="chiku"], [class*="築"]')
                mgmt_txt = await _text(card, '[class*="kanri"], [class*="管理"]')
                link_el  = await card.query_selector('a[href*="/chintai/"]')
                href     = await link_el.get_attribute('href') if link_el else ''
                full_url = ('https://www.homes.co.jp' + href) if href.startswith('/') else (href or url)
                rent = _yen(rent_txt)
                if not rent or not name or rent < 40000 or rent > 2000000: continue
                results.append({'src':'LIFULL','sid':sid,'name':name[:80],'rent':rent,
                    'mgmt':_yen(mgmt_txt),'layout':(layout or '1K').strip(),
                    'm2':_m2(m2_txt),'built':(built or '').strip()[:30],
                    'walk':_walk(st_txt),'st_txt':(st_txt or '')[:60],'url':full_url})
            except Exception as e:
                print(f"    card err: {e}")
        print(f"    → {len(results)} so far")
        await asyncio.sleep(random.uniform(2.0, 3.5))
    return results


# ── SUUMO ────────────────────────────────────────────────────────────────────
async def scrape_suumo(page, sid, suumo_slug):
    results = []
    # SUUMO station search — correct URL pattern
    url = f"https://suumo.jp/chintai/tokyo/station_{suumo_slug}/" if 'tokyo' in \
        next((t[2] for t in TARGETS if t[0]==sid), 'tokyo') else \
        f"https://suumo.jp/chintai/kanagawa/station_{suumo_slug}/"
    print(f"  [SUUMO] {sid}: {url}")
    try:
        await page.goto(url, timeout=35000, wait_until='networkidle')
        await page.wait_for_timeout(random.randint(2500, 4000))
    except Exception as e:
        print(f"    nav err: {e}"); return results

    cards = await _wait_cards(page, ['.cassetteitem', '[class*="cassette"]'], timeout=8000)
    if not cards:
        print(f"    no SUUMO cards"); return results

    for card in cards[:6]:
        try:
            name   = await _text(card, '.cassetteitem_content-title, [class*="content-title"]')
            st_txt = await _text(card, '.cassetteitem_detail-col1, [class*="detail-col1"]')
            rows   = await card.query_selector_all('.cassetteitem_other, [class*="item_other"]')
            for row in rows[:2]:
                rent_txt = await _text(row, '.cassetteitem_other-emphasis, [class*="emphasis"]')
                layout   = await _text(row, '.cassetteitem_madori, [class*="madori"]')
                m2_txt   = await _text(row, '.cassetteitem_menseki, [class*="menseki"]')
                link_el  = await row.query_selector('a[href*="/chintai/"]')
                href     = await link_el.get_attribute('href') if link_el else ''
                full_url = 'https://suumo.jp' + href if href.startswith('/') else href
                rent = _yen(rent_txt)
                if not rent or not name or rent < 40000: continue
                results.append({'src':'SUUMO','sid':sid,'name':name[:80],'rent':rent,
                    'mgmt':None,'layout':(layout or '1K').strip(),
                    'm2':_m2(m2_txt),'built':'','walk':_walk(st_txt),
                    'st_txt':(st_txt or '')[:60],'url':full_url})
        except: pass
    print(f"    → {len(results)} SUUMO results")
    await asyncio.sleep(random.uniform(2.0, 3.0))
    return results


# ── GaijinPot ────────────────────────────────────────────────────────────────
async def scrape_gaijinpot(page, sid):
    area = GP_AREAS.get(sid, '')
    if not area: return []
    pref = 'kanagawa' if sid in ('hatcho','ichiba','kagetsu','namamugi','shinkoyasu','shimmachi','hkanagawa','yokohama') else 'tokyo'
    url = f"https://apartments.gaijinpot.com/rent/en/list?pref={pref}&ward={area}&station={sid}"
    print(f"  [GaijinPot] {sid}: {url}")
    results = []
    try:
        await page.goto(url, timeout=30000, wait_until='networkidle')
        await page.wait_for_timeout(random.randint(2000, 3000))
    except Exception as e:
        print(f"    nav err: {e}"); return results

    cards = await _wait_cards(page, [
        '.property-card', '[class*="PropertyCard"]', '[class*="listing-card"]',
        'article[class*="property"]'
    ], timeout=8000)

    for card in cards[:6]:
        try:
            name     = await _text(card, 'h2, h3, [class*="title"], [class*="name"]')
            rent_txt = await _text(card, '[class*="price"], [class*="rent"]')
            layout   = await _text(card, '[class*="layout"], [class*="type"]')
            m2_txt   = await _text(card, '[class*="size"], [class*="area"]')
            st_txt   = await _text(card, '[class*="station"], [class*="access"]')
            link_el  = await card.query_selector('a')
            href     = await link_el.get_attribute('href') if link_el else ''
            full_url = ('https://apartments.gaijinpot.com' + href) if href.startswith('/') else href
            rent = _yen(rent_txt)
            if not rent or not name or rent < 40000: continue
            results.append({'src':'GaijinPot','sid':sid,'name':name[:80],'rent':rent,
                'mgmt':None,'layout':(layout or '').strip(),'m2':_m2(m2_txt),
                'built':'','walk':_walk(st_txt),'st_txt':(st_txt or '')[:60],'url':full_url})
        except: pass
    print(f"    → {len(results)} GaijinPot results")
    await asyncio.sleep(random.uniform(1.5, 2.5))
    return results


# ── JS formatter ─────────────────────────────────────────────────────────────
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
        src    = {'LIFULL':'LIFULL','SUUMO':'SUUMO','GaijinPot':'GAIJINPOT'}.get(r['src'],'LIFULL')
        m2_s   = f", m2:{r['m2']}" if r.get('m2') else ''
        blt_s  = f", built:{json.dumps(r['built'])}" if r.get('built') else ''
        mg_s   = f", mgmt:{r['mgmt']}" if r.get('mgmt') else ''
        lines.append(
            f"{{ id:'lv{lv:02d}', name:{{en:{json.dumps(r['name'])}}}, st:{json.dumps(r['sid'])}, tier:'LIVE', srcName:{src},\n"
            f"  url:{json.dumps(r['url'])}, rent:{rent}{mg_s}, layout:{json.dumps(layout)}{m2_s}{blt_s},\n"
            f"  listed:{{st:{{en:{json.dumps(r['st_txt'][:40] or r['sid'])}}}, walk:{walk}}} }},"
        )
        lv += 1
    return '\n'.join(lines)


# ── Main ─────────────────────────────────────────────────────────────────────
async def main():
    import argparse
    parser = argparse.ArgumentParser(description="Multi-source Kanto listing puller")
    parser.add_argument('--only', default=None, help='comma-separated station IDs')
    parser.add_argument('--headless', action='store_true', help='run headless (default: visible browser)')
    args = parser.parse_args()

    targets = TARGETS
    if args.only:
        only_ids = set(args.only.split(','))
        targets = [t for t in TARGETS if t[0] in only_ids]
        if not targets:
            print(f"No matching stations: {args.only}"); return

    new_results = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=args.headless,   # False by default = real visible window
            args=['--no-sandbox', '--disable-blink-features=AutomationControlled'],
            slow_mo=50,
        )
        ctx = await browser.new_context(
            locale='ja-JP',
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0 Safari/537.36',
        )
        page = await ctx.new_page()
        await page.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>undefined})")

        for sid, ja, slug, suumo_slug in targets:
            print(f"\n{'='*55}\n{sid} ({ja})\n{'='*55}")

            got = await scrape_lifull(page, sid, slug, max_pages=2)
            print(f"  LIFULL: {len(got)}")
            new_results.extend(got)

            if len(got) < 3:
                got2 = await scrape_suumo(page, sid, suumo_slug)
                new_results.extend(got2)

            if len([r for r in new_results if r['sid']==sid]) < 3:
                got3 = await scrape_gaijinpot(page, sid)
                new_results.extend(got3)

            total_this_sid = len([r for r in new_results if r['sid']==sid])
            print(f"  → {total_this_sid} total for {sid}")
            await asyncio.sleep(random.uniform(1.5, 3.0))

        await browser.close()

    # Append to accumulated JSON (dedup by sid+name)
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
    asyncio.run(main())
