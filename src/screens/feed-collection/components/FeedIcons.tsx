import type React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import type { FeedKind } from '@/features/feed-collection';

type Props = { size?: number; stroke?: number; color?: string };

// Pellet glyph — cluster of 4 rounded granules, loose, not perfect circles.
// Same stroke weight (1.7 default) and rounding as the rest of the lucide-
// flavored icon family.
export function FeedPelletIcon({ size = 20, stroke = 1.7, color }: Props) {
  const { t } = useTheme();
  const c = color ?? t.ink;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Ellipse cx="7.4" cy="8.4" rx="2.7" ry="2.05" transform="rotate(-15 7.4 8.4)" />
      <Ellipse cx="15" cy="7.2" rx="2.6" ry="2" transform="rotate(20 15 7.2)" />
      <Ellipse cx="9.6" cy="15" rx="2.9" ry="2.15" transform="rotate(25 9.6 15)" />
      <Ellipse cx="16.8" cy="15.3" rx="2.5" ry="1.95" transform="rotate(-20 16.8 15.3)" />
    </Svg>
  );
}

// Fresh-feed glyph — single side-view fish silhouette (body, tail, eye).
// Friendly, not photoreal; designed to read down to 14pt.
export function FeedFishIcon({ size = 20, stroke = 1.7, color }: Props) {
  const { t } = useTheme();
  const c = color ?? t.ink;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3.6 12c1.7-3.6 5.1-5.4 8.5-5.4 3.6 0 6.6 2.3 8.1 5.4-1.5 3.1-4.5 5.4-8.1 5.4-3.4 0-6.8-1.8-8.5-5.4z" />
      <Path d="M3.6 12L1 9.2" />
      <Path d="M3.6 12L1 14.8" />
      <Path d="M3.6 12L2.6 12" />
      <Circle cx="15.6" cy="10.9" r="0.85" fill={c} stroke="none" />
    </Svg>
  );
}

export function feedGlyphFor(kind: FeedKind): React.FC<Props> {
  return kind === 'fresh' ? FeedFishIcon : FeedPelletIcon;
}

export function FeedChartIcon({ size = 20, stroke = 1.7, color }: Props) {
  const { t } = useTheme();
  const c = color ?? t.ink;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 20h18" />
      <Path d="M7 20V10" />
      <Path d="M12 20V4" />
      <Path d="M17 20v-7" />
    </Svg>
  );
}
