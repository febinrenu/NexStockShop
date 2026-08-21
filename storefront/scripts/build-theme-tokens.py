#!/usr/bin/env python3
"""
Regenerates src/styles/theme-tokens.css and src/lib/themes/list.ts from
theme-registry.raw.json.

theme-registry.raw.json itself is extracted from the 27 reference theme
mockups in the NexStockShop repo's themes/ folder (each ships a clean
inline `tailwind.config` block with brand colors/fonts/shadows — see
build-theme-registry.py). The ROLES mapping below (which color is
"primary" vs "accent") is NOT derived from color-key names — it was
ground-truthed by grepping each theme's actual hero CTA button markup
("Shop Now", "Subscribe", the search-button fill, etc.) to see which
bg-brand-* color the mockup's own author actually used for primary
actions. Re-run scripts/build-theme-registry.py + re-verify ROLES by hand
if the source mockups change.

Usage: python3 scripts/build-theme-tokens.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = ROOT / 'theme-registry.raw.json'

FONT_VAR_MAP = {
    'Inter': 'inter', 'Playfair Display': 'playfair', 'Poppins': 'poppins',
    'Baloo 2': 'baloo', 'Archivo Black': 'archivo',
}


def surface_alt(hex_color: str) -> str:
    h = hex_color.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    luminance = 0.299 * r + 0.587 * g + 0.114 * b
    if luminance > 128:
        r, g, b = (max(0, c - 8) for c in (r, g, b))
    else:
        r, g, b = (min(255, c + 12) for c in (r, g, b))
    return f'#{r:02X}{g:02X}{b:02X}'


def ink_muted(hex_color: str) -> str:
    h = hex_color.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    r, g, b = (int(c * 0.55 + 128 * 0.45) for c in (r, g, b))
    return f'#{r:02X}{g:02X}{b:02X}'


def main() -> None:
    registry = json.loads(REGISTRY_PATH.read_text())

    css_blocks = []
    ts_entries = []
    for slug, t in sorted(registry.items()):
        body_font = t['fonts'].get('sans', [None])[0] or 'Inter'
        display_font = (t['fonts'].get('serif') or t['fonts'].get('display') or [None])[0]
        body_var = FONT_VAR_MAP.get(body_font, 'inter')
        display_var = FONT_VAR_MAP.get(display_font, body_var) if display_font else body_var

        shadows = t['shadows']
        card = shadows.get('card', '0 4px 14px -4px rgba(0,0,0,0.10)')
        card_hover = shadows.get('cardHover', '0 12px 26px -8px rgba(0,0,0,0.18)')
        nav_up = shadows.get('navUp', '0 -4px 14px -6px rgba(0,0,0,0.14)')

        css_blocks.append(f'''[data-theme="{slug}"] {{
  --theme-primary: {t['primary']};
  --theme-primary-dark: {t['primaryDark']};
  --theme-accent: {t['accent']};
  --theme-surface: {t['surface']};
  --theme-surface-alt: {surface_alt(t['surface'])};
  --theme-ink: {t['ink']};
  --theme-ink-muted: {ink_muted(t['ink'])};
  --theme-scrollbar: {t['scrollbarThumb']};
  --theme-shadow-card: {card};
  --theme-shadow-card-hover: {card_hover};
  --theme-shadow-nav-up: {nav_up};
  --theme-font-body: var(--font-{body_var});
  --theme-font-display: var(--font-{display_var});
}}''')

        ts_entries.append(
            f'  {slug}: {{ slug: "{slug}", name: "{t["name"]}", niche: "{t["niche"]}" }},'
        )

    css_path = ROOT / 'src/styles/theme-tokens.css'
    css_path.write_text(
        "/* Auto-generated from theme-registry.raw.json — primary/accent were\n"
        " * ground-truthed against each theme's actual CTA button markup, not\n"
        " * guessed from color-key names. Regenerate with\n"
        " * `python3 scripts/build-theme-tokens.py` if the source theme mockups\n"
        " * change. */\n\n"
        + '\n\n'.join(css_blocks) + '\n'
    )

    ts_path = ROOT / 'src/lib/themes/list.ts'
    ts_path.write_text(
        '// Auto-generated from theme-registry.raw.json.\n'
        'export const THEME_LIST = {\n'
        + '\n'.join(ts_entries) +
        '\n} as const;\n\n'
        'export type ThemeSlug = keyof typeof THEME_LIST;\n'
    )

    print(f'Wrote {len(css_blocks)} theme blocks to {css_path.relative_to(ROOT)} and {ts_path.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
