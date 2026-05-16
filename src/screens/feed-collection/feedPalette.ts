// Feed Collection accent palette — converted from oklch to sRGB hex for native rendering.
// Source: "Farm OS/screens-feed.jsx" FEED_ORANGE (oklch hue 35–55).

export const FEED_ORANGE = {
  /** Tile background — midpoint of the web gradient (oklch 0.67 0.17 45 ≈). */
  tile: '#e87a36',
  /** Tile accent — used as a subtle border / shadow tint. */
  tileEdge: '#c95822',
  /** Soft surface for empty-state hero and highlight rows. */
  soft: '#fbe9d4',
  /** Strong ink for use on soft backgrounds. */
  ink: '#7a3a18',
} as const;

export const FEED_TYPE_LABEL_TH = { pellet: 'เม็ด', fresh: 'สด' } as const;

/** Unit is locked per feed type — pellet sold by weight, fresh feed by crate. */
export const FEED_UNIT_BY_KIND = { pellet: 'กก.', fresh: 'ลัง' } as const;
