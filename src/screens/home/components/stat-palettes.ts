/**
 * Maps a StatCard variant to a pair of FarmOS theme tokens (Soft fill + Ink accent).
 * Matches the SummaryTile spec in `Farm OS/screens-home.jsx` (tone → t[tone+'Soft'] / t[tone+'Ink']).
 *
 * `border` is derived at render time as `${ink}1a` (10% opacity), so the card chrome
 * stays correct across light, dark, and outdoor themes.
 */
import type { ThemePalette } from '@/theme/tokens';

export type StatVariant = 'info' | 'success' | 'move' | 'danger';

export type StatTokenPair = {
  soft: keyof ThemePalette;
  ink: keyof ThemePalette;
};

export const statTokens: Record<StatVariant, StatTokenPair> = {
  // ปลาคงเหลือ — teal/brand
  info: { soft: 'brandSoft', ink: 'brandInk' },
  // ค่าอาหาร — green/fill
  success: { soft: 'fillSoft', ink: 'fillInk' },
  // บ่อใช้งาน — blue/move
  move: { soft: 'moveSoft', ink: 'moveInk' },
  // ปลาตาย — red/danger (uses `danger` for the ink/icon for stronger contrast)
  danger: { soft: 'dangerSoft', ink: 'danger' },
};
