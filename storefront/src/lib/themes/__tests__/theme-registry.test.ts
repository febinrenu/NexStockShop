import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import registry from "../../../../theme-registry.raw.json";
import { THEME_LIST } from "@/lib/themes/list";

// The 27 reference visual styles from NexStockShop's themes/ folder — see
// scripts/build-theme-registry.py. This suite exists to catch drift: a
// theme silently dropped from the registry, an un-ground-truthed color, or
// a mismatch between the JSON registry and the generated CSS/TS artifacts
// would otherwise only surface as a visual bug in a live browser (as the
// cascade bug in globals.css did).

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
type ThemeEntry = {
  slug: string;
  name: string;
  niche: string;
  colors: Record<string, string>;
  surface: string;
  ink: string;
  scrollbarThumb: string;
  primary: string;
  primaryDark: string;
  accent: string;
  roleKeys: { primary: string; primaryDark: string; accent: string };
};

const themes = registry as unknown as Record<string, ThemeEntry>;
const slugs = Object.keys(themes);

describe("theme-registry.raw.json", () => {
  it("contains exactly the 27 reference themes", () => {
    expect(slugs).toHaveLength(27);
  });

  it.each(slugs)("%s has all required fields with valid hex colors", (slug) => {
    const theme = themes[slug];
    expect(theme.slug).toBe(slug);
    expect(theme.name.length).toBeGreaterThan(0);
    expect(theme.niche.length).toBeGreaterThan(0);
    expect(theme.surface).toMatch(HEX_RE);
    expect(theme.ink).toMatch(HEX_RE);
    expect(theme.scrollbarThumb).toMatch(HEX_RE);
    expect(theme.primary).toMatch(HEX_RE);
    expect(theme.primaryDark).toMatch(HEX_RE);
    expect(theme.accent).toMatch(HEX_RE);
    expect(Object.keys(theme.colors).length).toBeGreaterThan(0);
    for (const hex of Object.values(theme.colors)) {
      expect(hex).toMatch(HEX_RE);
    }
  });

  it.each(slugs)("%s's primary/accent are ground-truthed from its own colors map, not guessed", (slug) => {
    const theme = themes[slug];
    expect(theme.colors[theme.roleKeys.primary]).toBe(theme.primary);
    expect(theme.colors[theme.roleKeys.accent]).toBe(theme.accent);
  });

  it.each(slugs)("%s's primaryDark is either a literal *Dark swatch or a programmatically darkened primary", (slug) => {
    const theme = themes[slug];
    // build-theme-registry.py's ROLES mapping ground-truths a dedicated
    // "*Dark" swatch per theme where the mockup has one (roleKeys.primaryDark
    // differs from roleKeys.primary, e.g. goldDark) — otherwise it falls
    // back to programmatically darkening primary (marketverse's "orange"
    // and voguelane's "black" have no distinct Dark swatch, so their
    // roleKeys.primaryDark equals roleKeys.primary and primaryDark must be
    // strictly darker than primary rather than a literal colors[] lookup).
    if (theme.roleKeys.primaryDark !== theme.roleKeys.primary) {
      expect(theme.colors[theme.roleKeys.primaryDark]).toBe(theme.primaryDark);
    } else {
      expect(theme.primaryDark).not.toBe(theme.primary);
      const luminance = (hex: string) => {
        const n = parseInt(hex.slice(1), 16);
        return ((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255);
      };
      expect(luminance(theme.primaryDark)).toBeLessThan(luminance(theme.primary));
    }
  });

  it("primary is never identical to surface (would make CTAs invisible)", () => {
    for (const slug of slugs) {
      const theme = themes[slug];
      expect(theme.primary.toLowerCase()).not.toBe(theme.surface.toLowerCase());
    }
  });

  it("matches THEME_LIST (src/lib/themes/list.ts) slug-for-slug", () => {
    expect(Object.keys(THEME_LIST).sort()).toEqual(slugs.sort());
    for (const slug of slugs) {
      const listed = THEME_LIST[slug as keyof typeof THEME_LIST];
      expect(listed.name).toBe(themes[slug].name);
      expect(listed.niche).toBe(themes[slug].niche);
    }
  });

  it("every theme has a generated [data-theme=\"slug\"] block in theme-tokens.css", () => {
    const css = readFileSync(path.resolve(__dirname, "../../../styles/theme-tokens.css"), "utf-8");
    for (const slug of slugs) {
      expect(css).toContain(`[data-theme="${slug}"]`);
    }
  });
});
