// Per-type accent palette for feed tiles. Pellet = warm orange (the
// long-standing feed color); Fresh = sea-aqua (hue ~200, 15° off the
// brand teal so the two are unmistakably different at a glance).
// Source: "Farm OS / Feed Type Icons" handoff, `feed-glyphs.jsx`
// `window.FeedTiles`. OKLCH converted to sRGB hex for native rendering.

import type { FeedKind } from '@/features/feed-collection';

export type FeedPalette = {
  /** Tile background — primary type color. */
  tile: string;
  /** Tile accent — darker edge / line / focus dot. */
  tileEdge: string;
  /** Soft surface for highlight rows + empty-state hero. */
  soft: string;
  /** Strong ink for use on soft backgrounds. */
  ink: string;
  /** Drop-shadow color, includes alpha. */
  shadow: string;
};

/** Warm orange — manufactured / granulated feed. (oklch 0.74 0.16 55 → 0.60 0.18 35) */
export const FEED_ORANGE: FeedPalette = {
  tile: '#e87a36',
  tileEdge: '#c95822',
  soft: '#fbe9d4',
  ink: '#7a3a18',
  shadow: 'rgba(180,80,20,0.45)',
};

/** Sea aqua — small whole fish / scraps. (oklch 0.74 0.10 200 → 0.54 0.13 205) */
export const FEED_AQUA: FeedPalette = {
  tile: '#3ba6bc',
  tileEdge: '#0f6885',
  soft: '#e0eff3',
  ink: '#0e4655',
  shadow: 'rgba(15,90,135,0.45)',
};

export const FEED_PALETTE_BY_KIND: Record<FeedKind, FeedPalette> = {
  pellet: FEED_ORANGE,
  fresh: FEED_AQUA,
};

export function feedPaletteFor(kind: FeedKind): FeedPalette {
  return FEED_PALETTE_BY_KIND[kind];
}

export const FEED_TYPE_LABEL_TH = { pellet: 'เม็ด', fresh: 'สด' } as const;

/** Pill tone per feed type — pellet uses the existing warn (orange) tone,
 *  fresh leans on brand (teal) until a dedicated fresh-tone pill ships. */
export const FEED_PILL_TONE_BY_KIND = { pellet: 'warn', fresh: 'brand' } as const;

/** Unit is locked per feed type — pellet sold by weight, fresh feed by crate. */
export const FEED_UNIT_BY_KIND = { pellet: 'กก.', fresh: 'ลัง' } as const;
