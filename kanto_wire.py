#!/usr/bin/env python3
"""kanto_wire.py — post-process scraped listings and wire into kanto_live.js.

Reads kanto_scraped_clean.json, fixes walk time extraction from the SUUMO
access text stored in 'built', assigns lv34+ IDs, and appends to kanto_live.js.
Also writes a FACTS snippet for portrait_gen.py.
"""
import json, re
from pathlib import Path

KANTO = Path(__file__).parent
LIVE_JS = KANTO / 'kanto_live.js'
CLEAN_JSON = KANTO / 'kanto_scraped_clean.json'

# ── Parse walk from SUUMO access text ────────────────────────────────────────
def extract_walk(txt):
    """Pull the shortest walk time from a SUUMO multi-line access string."""
    if not txt:
        return None
    times = re.findall(r'歩\s*(\d+)\s*分', txt)
    if not times:
        times = re.findall(r'徒歩\s*(\d+)\s*分', txt)
    return min(int(t) for t in times) if times else None

def extract_built_year(txt):
    """Extract year from SUUMO 築年数 text like '2019年築' or '築15年'."""
    m = re.search(r'(\d{4})\s*年\s*築', txt or '')
    if m: return int(m.group(1))
    m = re.search(r'築\s*(\d+)\s*年', txt or '')
    if m:
        import datetime
        return datetime.datetime.now().year - int(m.group(1))
    return None

def extract_floors(txt):
    m = re.search(r'(\d+)\s*階\s*建', txt or '')
    return int(m.group(1)) if m else None

# ── Load and process ──────────────────────────────────────────────────────────
data = json.loads(CLEAN_JSON.read_text())

# Fix walk + built from 'built' field which actually has the access text
for r in data:
    if r['walk'] is None:
        # Try from built field (which has access text) and st_txt
        w = extract_walk(r.get('built','')) or extract_walk(r.get('st_txt',''))
        r['walk'] = w
    # Extract real year from built if it looks like a year text
    if r.get('built'):
        yr = extract_built_year(r['built'])
        fl = extract_floors(r['built'])
        r['_year'] = yr
        r['_floors'] = fl
    else:
        r['_year'] = None
        r['_floors'] = None

# Deduplicate by (sid, name, rent)
seen = set()
clean = []
for r in data:
    key = (r['sid'], r['name'][:30], r['rent'])
    if key not in seen:
        seen.add(key)
        clean.append(r)

print(f"Deduped: {len(data)} → {len(clean)}")

# ── Generate JS listing records ───────────────────────────────────────────────
LUXURY_THRESHOLD = 300000

lines = []
lv = 34
for r in clean:
    name_j  = json.dumps(r['name'])
    walk    = r['walk'] or 8
    layout  = r['layout'] or '1K'
    rent    = r['rent']
    m2      = r.get('m2')
    yr      = r.get('_year')
    fls     = r.get('_floors')

    m2_s  = f", m2:{m2}" if m2 else ''
    blt_s = f", built:'{yr}'" if yr else ''
    fl_s  = f", floors:{fls}" if fls else ''
    lux_s = ", luxury:true" if rent >= LUXURY_THRESHOLD else ''

    # st_txt: prefer the built field for real station name, fall back to sid
    st_display = json.dumps(r.get('st_txt','')[:40] or r['sid'])

    lines.append(
        f"{{ id:'lv{lv:02d}', name:{{en:{name_j}, ja:{name_j}}}, st:{json.dumps(r['sid'])}, tier:'LIVE', srcName:SUUMO,\n"
        f"  url:{json.dumps(r['url'])}, rent:{rent}, layout:{json.dumps(layout)}{m2_s}{blt_s}{fl_s}{lux_s},\n"
        f"  listed:{{st:{{en:{st_display}}}, walk:{walk}}} }},"
    )
    lv += 1

js_block = '\n'.join(lines)

# ── Append to kanto_live.js ───────────────────────────────────────────────────
live_src = LIVE_JS.read_text()

# Find the closing bracket of LIVE array and insert before it
# Look for the pattern: end of last listing before LIVE closing bracket
insert_marker = '// END LIVE'
if insert_marker in live_src:
    new_src = live_src.replace(insert_marker, js_block + '\n' + insert_marker)
else:
    # Find closing of LIVE array  
    # LIVE ends with ]; — insert before
    idx = live_src.rfind('];')
    if idx == -1:
        print("ERROR: could not find ]; in kanto_live.js")
        exit(1)
    new_src = live_src[:idx] + '\n// SCRAPED LISTINGS — auto-appended by kanto_wire.py\n' + js_block + '\n' + live_src[idx:]

LIVE_JS.write_text(new_src)
print(f"Appended {len(clean)} listings (lv34–lv{33+len(clean)}) to kanto_live.js")

# ── Write FACTS snippet for portrait_gen.py ──────────────────────────────────
facts_lines = ['# FACTS additions for portrait_gen.py — paste into FACTS dict\n']
lv = 34
for r in clean:
    yr   = r.get('_year') or 2010
    fls  = r.get('_floors') or 7
    m2   = r.get('m2') or 25.0
    area = r['sid']
    facts_lines.append(
        f"    'lv{lv:02d}': {{'floors':{fls}, 'built':{yr}, 'struct':'RC', 'area':'{area}', 'facade':'beige', 'm2':{m2}}},"
    )
    lv += 1

(KANTO / 'kanto_facts_snippet.txt').write_text('\n'.join(facts_lines))
print(f"FACTS snippet → kanto_facts_snippet.txt")
print(f"\nSummary:")
print(f"  {len(clean)} new LIVE listings (lv34–lv{33+len(clean)})")
luxury = [r for r in clean if r['rent'] >= LUXURY_THRESHOLD]
print(f"  {len(luxury)} luxury (¥300k+): {', '.join(r['sid'] for r in luxury)}")
missing_walk = [r for r in clean if not r['walk']]
print(f"  {len(missing_walk)} still missing walk time (will default to 8)")
