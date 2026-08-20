#!/usr/bin/env python3
"""
Extracts theme-registry.raw.json from the 27 reference theme mockups.

Each mockup in <repo-root>/themes/*-homepage.html ships a clean inline
`tailwind.config` block (colors.brand.*, fontFamily, boxShadow) plus a
<body class="..."> that reveals the page's base surface/ink colors. This
script parses those deterministically — it does not guess at pixel
colors from screenshots.

Run this from the storefront/ directory once the themes/ folder exists as
a sibling (i.e. this script and NexStockShop/themes/ are both checked out
together, which is the case once storefront/ is copied into the
NexStockShop repo per the project's delivery convention):

    python3 scripts/build-theme-registry.py [path/to/themes]

Then run build-theme-tokens.py to turn the raw registry into the actual
CSS/TS the app consumes.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_THEMES_DIR = ROOT.parent / 'themes'

NICHES = {
    'aurumeclat': 'Luxury jewelry & fine goods', 'casanest': 'Home & furniture',
    'elegance': 'Fashion & beauty', 'freshcart': 'Grocery & fresh food delivery',
    'futurex': 'Consumer electronics & tech', 'generalhub': 'General marketplace',
    'homeluxe': 'Home décor, upscale', 'littlejoy': 'Kids & toys',
    'marketly': 'General / multi-vendor marketplace', 'marketverse': 'General / multi-vendor marketplace',
    'medisphere': 'Health & pharmacy', 'naturae': 'Organic, wellness & natural products',
    'naturel': 'Organic, wellness & natural products', 'naturia': 'Organic, wellness & natural products',
    'nexora': 'Tech & electronics', 'novatech': 'Tech & electronics',
    'paperloom': 'Stationery, books & crafts', 'pawluxe': 'Pet products',
    'shopiq': 'General smart-shopping marketplace', 'technova': 'Tech & electronics',
    'terraco': 'Home & garden / outdoor living', 'trailpeak': 'Outdoor & adventure gear',
    'urbana': 'Urban fashion & apparel', 'veloura': 'Luxury fashion & beauty',
    'verdeliving': 'Eco / sustainable living', 'voguelane': 'Urban fashion & apparel',
    'zanova': 'General smart-shopping marketplace',
}

# Ground-truthed (primary_key, primary_dark_key, accent_key) per theme by
# grepping each mockup's actual hero CTA / search-button fill color — NOT
# guessed from color-key names. See a theme's own colors dict for the
# full palette these keys index into. If a theme is added or restyled,
# re-derive its roles the same way: grep for
#   <(button|a)[^>]*bg-brand-[a-z]+[^>]*>...(Shop|Cart|Subscribe|...)
# in that theme's HTML and use whichever color repeats on real CTAs.
ROLES = {
    'aurumeclat': ('gold', 'goldDark', 'burgundy'),
    'casanest': ('olive', 'oliveDark', 'rust'),
    'elegance': ('gold', 'goldDark', 'gold'),
    'freshcart': ('green', 'greenDark', 'red'),
    'futurex': ('purple', 'purpleDark', 'blue'),
    'generalhub': ('blue', 'blueDark', 'green'),
    'homeluxe': ('green', 'greenDark', 'terracotta'),
    'littlejoy': ('purple', 'purpleDark', 'pink'),
    'marketly': ('pink', 'pinkDark', 'purple'),
    'marketverse': ('orange', 'orange', 'purple'),
    'medisphere': ('teal', 'tealDark', 'red'),
    'naturae': ('green', 'greenDark', 'tan'),
    'naturel': ('green', 'greenDark', 'tan'),
    'naturia': ('green', 'greenDark', 'tan'),
    'nexora': ('navy', 'navyLight', 'orange'),
    'novatech': ('purple', 'purpleDark', 'blue'),
    'paperloom': ('rust', 'rustDark', 'green'),
    'pawluxe': ('coral', 'coralDark', 'mint'),
    'shopiq': ('yellow', 'yellowDark', 'purple'),
    'technova': ('blue', 'blueDark', 'red'),
    'terraco': ('green', 'greenDark', 'tan'),
    'trailpeak': ('orange', 'orangeDark', 'green'),
    'urbana': ('green', 'greenDark', 'tan'),
    'veloura': ('mauve', 'mauveDark', 'gold'),
    'verdeliving': ('olive', 'oliveDark', 'tan'),
    'voguelane': ('black', 'black', 'gold'),
    'zanova': ('yellow', 'yellowDark', 'black'),
}


def parse_js_object(block: str) -> dict:
    """Narrow parser for these specific config blocks only — not general JS."""
    s = block
    s = re.sub(r"'\"([^\"']*)\"'", r"'\1'", s)
    s = re.sub(r'([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:', r'\1"\2":', s)
    s = re.sub(r"'([^']*)'", lambda m: json.dumps(m.group(1)), s)
    s = re.sub(r',(\s*[}\]])', r'\1', s)
    return json.loads(s)


def darken(hex_color: str, amount: float = 0.18) -> str:
    h = hex_color.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    r, g, b = (max(0, int(c * (1 - amount))) for c in (r, g, b))
    return f'#{r:02X}{g:02X}{b:02X}'


def main() -> None:
    themes_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_THEMES_DIR
    if not themes_dir.is_dir():
        sys.exit(f'themes/ folder not found at {themes_dir} — pass its path as an argument.')

    registry = {}
    for path in sorted(themes_dir.glob('*-homepage.html')):
        slug = path.name.replace('-homepage.html', '')
        html = path.read_text(encoding='utf-8', errors='replace')

        m = re.search(r'tailwind\.config\s*=\s*(\{.*?\});', html, re.S)
        config = parse_js_object(m.group(1))
        extend = config['theme']['extend']
        fonts = extend.get('fontFamily', {})
        colors = extend.get('colors', {}).get('brand', {})
        shadows = extend.get('boxShadow', {})

        m_body = re.search(r'<body[^>]*class="([^"]*)"', html)
        body_class = m_body.group(1) if m_body else ''
        if 'bg-white' in body_class:
            surface = '#FFFFFF'
        else:
            m_bg2 = re.search(r'bg-brand-(\w+)', body_class)
            m_bg3 = re.search(r'bg-\[(#[0-9A-Fa-f]{3,8})\]', body_class)
            surface = colors.get(m_bg2.group(1), '#FFFFFF') if m_bg2 else (m_bg3.group(1) if m_bg3 else '#FFFFFF')
        m_text = re.search(r'text-\[(#[0-9A-Fa-f]{3,8})\]', body_class)
        ink = m_text.group(1) if m_text else '#111111'
        m_scroll = re.search(r'::-webkit-scrollbar-thumb\s*\{\s*background:\s*(#[0-9A-Fa-f]{3,8})', html)
        scrollbar = m_scroll.group(1) if m_scroll else next(iter(colors.values()))

        if slug not in ROLES:
            sys.exit(f'No ground-truthed role mapping for new theme "{slug}" — '
                      f'grep its hero CTA markup and add an entry to ROLES above.')
        primary_key, dark_key, accent_key = ROLES[slug]
        primary = colors[primary_key]
        primary_dark = colors[dark_key] if dark_key != primary_key else darken(primary)
        accent = colors[accent_key]

        registry[slug] = {
            'slug': slug,
            'name': slug[0].upper() + slug[1:],
            'niche': NICHES[slug],
            'fonts': fonts,
            'colors': colors,
            'shadows': shadows,
            'surface': surface,
            'ink': ink,
            'scrollbarThumb': scrollbar,
            'primary': primary,
            'primaryDark': primary_dark,
            'accent': accent,
            'roleKeys': {'primary': primary_key, 'primaryDark': dark_key, 'accent': accent_key},
        }

    out_path = ROOT / 'theme-registry.raw.json'
    out_path.write_text(json.dumps(registry, indent=2) + '\n')
    print(f'Wrote {len(registry)} themes to {out_path.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
