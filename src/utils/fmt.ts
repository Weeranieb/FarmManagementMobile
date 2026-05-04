// Number formatters — ported from "Farm OS/primitives.jsx" `window.fmt`.

export const fmt = {
  num: (n: number | null | undefined): string => (n ?? 0).toLocaleString('en-US'),
  kg: (n: number | string): string =>
    `${Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 })} กก.`,
  baht: (n: number | string): string => `฿${Math.round(Number(n)).toLocaleString('en-US')}`,
  bahtPrecise: (n: number | string): string =>
    `฿${Number(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
};

export const FISH_TH: Record<string, string> = {
  nil: 'ปลานิล',
  kaphong: 'ปลากะพง',
  kang: 'ปลาคัง',
  duk: 'ปลาดุก',
};
