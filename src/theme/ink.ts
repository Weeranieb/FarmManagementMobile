// Theme-aware "ink" derivations for tones whose existing tokens
// (warn / danger / statusMaint) only define a base + soft pair.
//
// On light themes the prototype uses a darkened amber/red as the readable
// foreground over the soft tinted background. That hardcoded value goes
// unreadable on the dark theme (where soft = dark warm brown). And on the
// outdoor theme it's not contrasty enough.
//
// These helpers pick the right ink per mode so pills, badges and status
// pips stay readable across all three palettes without inventing brand-new
// tokens upstream in Farm OS/tokens.js.

import type { ThemeMode, ThemePalette } from './tokens';

export function warnInk(mode: ThemeMode, t: ThemePalette): string {
  // light: deep amber on pale yellow soft
  // dark:  bright warn on dark brown soft
  // outdoor: very dark amber on light bg
  if (mode === 'dark') return t.warn;
  if (mode === 'outdoor') return '#5a3500';
  return '#7a4a00';
}

export function dangerInk(mode: ThemeMode, t: ThemePalette): string {
  if (mode === 'dark') return t.danger;
  if (mode === 'outdoor') return '#6a0000';
  return '#7a1a14';
}

export function maintInk(mode: ThemeMode, t: ThemePalette): string {
  // statusMaint shares the warn family in tokens; keep the same logic.
  if (mode === 'dark') return t.statusMaint;
  if (mode === 'outdoor') return '#5a3500';
  return '#7a4a00';
}
