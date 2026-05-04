// NativeWind v4 / Tailwind v3 config.
// Colors mirror the "light" palette from src/theme/tokens.ts. Theme-aware
// color swaps (dark / outdoor) are applied via the runtime `useTheme()` hook
// rather than Tailwind variants — Tailwind here covers sizing, spacing,
// typography, and layout.

const { themes, radii, type } = require('./src/theme/tokens.tailwind.cjs');

const light = themes.light;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: light.bg,
        surface: light.surface,
        'surface-alt': light.surfaceAlt,
        'surface-sunk': light.surfaceSunk,
        border: light.border,
        'border-strong': light.borderStrong,
        ink: light.ink,
        'ink-soft': light.inkSoft,
        'ink-mute': light.inkMute,
        fill: { DEFAULT: light.fill, soft: light.fillSoft, ink: light.fillInk },
        move: { DEFAULT: light.move, soft: light.moveSoft, ink: light.moveInk },
        sell: { DEFAULT: light.sell, soft: light.sellSoft, ink: light.sellInk },
        brand: { DEFAULT: light.brand, soft: light.brandSoft, ink: light.brandInk },
        warn: { DEFAULT: light.warn, soft: light.warnSoft },
        danger: { DEFAULT: light.danger, soft: light.dangerSoft },
        success: light.success,
      },
      borderRadius: {
        xs: radii.xs,
        sm: radii.sm,
        md: radii.md,
        lg: radii.lg,
        xl: radii.xl,
        pill: radii.pill,
      },
      fontFamily: {
        sans: [type.family],
        sansMed: [type.familyMedium],
        sansSemi: [type.familySemi],
        sansBold: [type.familyBold],
        num: [type.familyNum],
        numMed: [type.familyNumMedium],
        numSemi: [type.familyNumSemi],
        numBold: [type.familyNumBold],
      },
    },
  },
  plugins: [],
};
