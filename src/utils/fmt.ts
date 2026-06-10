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

/** Prefix a farm name with "ฟาร์ม" unless it's already there. */
export function displayFarmName(name: string | null | undefined): string {
  const raw = (name ?? '').trim();
  if (!raw) return 'ฟาร์ม';
  return raw.startsWith('ฟาร์ม') ? raw : `ฟาร์ม ${raw}`;
}

/** Prefix a pond name with "บ่อ" unless it's already there. */
export function displayPondName(name: string | null | undefined): string {
  const raw = (name ?? '').trim();
  if (!raw) return 'บ่อ';
  return raw.startsWith('บ่อ') ? raw : `บ่อ ${raw}`;
}
