import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

export type IconProps = {
  size?: number;
  stroke?: number;
  color?: string;
  fill?: string;
};

function Frame({
  size = 20,
  stroke = 1.7,
  color,
  fill = 'none',
  children,
}: IconProps & { children: React.ReactNode }) {
  const { t } = useTheme();
  const c = color ?? t.ink;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={c}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

function MoreIcon(p: IconProps) {
  const { t } = useTheme();
  const c = p.color ?? t.ink;
  return (
    <Svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24">
      <Circle cx="5" cy="12" r="1.2" fill={c} />
      <Circle cx="12" cy="12" r="1.2" fill={c} />
      <Circle cx="19" cy="12" r="1.2" fill={c} />
    </Svg>
  );
}

export const Icon = {
  home: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M3 11l9-8 9 8" />
      <Path d="M5 10v10h14V10" />
    </Frame>
  ),
  farm: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M3 20h18" />
      <Path d="M5 20V9l7-5 7 5v11" />
      <Circle cx="12" cy="13" r="2.5" />
    </Frame>
  ),
  user: (p: IconProps) => (
    <Frame {...p}>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
    </Frame>
  ),
  plus: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M12 5v14M5 12h14" />
    </Frame>
  ),
  back: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M15 18l-6-6 6-6" />
    </Frame>
  ),
  forward: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M9 6l6 6-6 6" />
    </Frame>
  ),
  check: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M5 12l4 4 10-10" />
    </Frame>
  ),
  clock: (p: IconProps) => (
    <Frame {...p}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </Frame>
  ),
  alert: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M12 3l10 18H2L12 3z" />
      <Path d="M12 10v5" />
      <Circle cx="12" cy="18" r="0.6" fill="currentColor" />
    </Frame>
  ),
  search: (p: IconProps) => (
    <Frame {...p}>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M20 20l-4-4" />
    </Frame>
  ),
  filter: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M3 5h18M6 12h12M10 19h4" />
    </Frame>
  ),
  x: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M6 6l12 12M18 6L6 18" />
    </Frame>
  ),
  more: MoreIcon,
  fish: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M3 12c3-5 8-6 12-6s5 3 6 6c-1 3-2 6-6 6S6 17 3 12z" />
      <Path d="M3 12l-1-3M3 12l-1 3" />
      <Circle cx="16" cy="11" r="0.8" fill="currentColor" />
    </Frame>
  ),
  feed: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M5 9h14l-1 11H6L5 9z" />
      <Path d="M9 9V6a3 3 0 016 0v3" />
    </Frame>
  ),
  arrow: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M5 12h14M13 6l6 6-6 6" />
    </Frame>
  ),
  arrowDown: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M6 9l6 6 6-6" />
    </Frame>
  ),
  calendar: (p: IconProps) => (
    <Frame {...p}>
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M3 10h18M8 3v4M16 3v4" />
    </Frame>
  ),
  cycle: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M3 12a9 9 0 0114-7l3 3" />
      <Path d="M21 12a9 9 0 01-14 7l-3-3" />
    </Frame>
  ),
  refresh: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M21 12a9 9 0 01-15 6.7L3 16" />
      <Path d="M3 12a9 9 0 0115-6.7L21 8" />
      <Path d="M21 3v5h-5M3 21v-5h5" />
    </Frame>
  ),
  trash: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </Frame>
  ),
  edit: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M4 20h4l11-11-4-4L4 16v4z" />
    </Frame>
  ),
  logout: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M15 4h4v16h-4" />
      <Path d="M10 8l-4 4 4 4M6 12h11" />
    </Frame>
  ),
  globe: (p: IconProps) => (
    <Frame {...p}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </Frame>
  ),
  warn: (p: IconProps) => (
    <Frame {...p}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v6" />
      <Circle cx="12" cy="16" r="0.8" fill="currentColor" />
    </Frame>
  ),
  doc: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M6 2h9l5 5v15H6V2z" />
      <Path d="M14 2v6h6" />
    </Frame>
  ),
  chevR: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M9 6l6 6-6 6" />
    </Frame>
  ),
  chevL: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M15 6l-6 6 6 6" />
    </Frame>
  ),
  swap: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M7 4v14M3 14l4 4 4-4" />
      <Path d="M17 20V6M21 10l-4-4-4 4" />
    </Frame>
  ),
  tag: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M3 12V3h9l9 9-9 9-9-9z" />
      <Circle cx="7" cy="7" r="1" fill="currentColor" />
    </Frame>
  ),
  eye: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <Circle cx="12" cy="12" r="3" />
    </Frame>
  ),
  eyeOff: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <Circle cx="12" cy="12" r="3" />
      <Path d="M4 4l16 16" />
    </Frame>
  ),
  lock: (p: IconProps) => (
    <Frame {...p}>
      <Rect x="4" y="11" width="16" height="10" rx="2" />
      <Path d="M8 11V8a4 4 0 018 0v3" />
    </Frame>
  ),
  sun: (p: IconProps) => (
    <Frame {...p}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </Frame>
  ),
  wrench: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M14.7 6.3a4 4 0 0 1-5.6 5.6L3.3 17.7a1.4 1.4 0 0 0 2 2l5.8-5.8a4 4 0 0 0 5.6-5.6l-2.5 2.5-2.4-2.4 2.5-2.5z" />
    </Frame>
  ),
  sliders: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M4 6h11" />
      <Circle cx="18" cy="6" r="2.2" />
      <Path d="M9 12H4" />
      <Circle cx="13" cy="12" r="2.2" />
      <Path d="M15.2 12H20" />
      <Path d="M4 18h11" />
      <Circle cx="18" cy="18" r="2.2" />
    </Frame>
  ),
  worker: (p: IconProps) => (
    <Frame {...p}>
      <Circle cx="8" cy="8" r="3.2" />
      <Circle cx="17" cy="10" r="2.4" />
      <Path d="M2 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <Path d="M15 20c0-2.4 1.8-4 4-4" />
    </Frame>
  ),
  merchant: (p: IconProps) => (
    <Frame {...p}>
      <Path d="M4 9l1-4h14l1 4" />
      <Path d="M4 9c0 1.7 1.3 3 3 3s3-1.3 3-3" />
      <Path d="M10 9c0 1.7 1.3 3 3 3s3-1.3 3-3" />
      <Path d="M16 9c0 1.7 1.3 3 3 3" />
      <Path d="M5 12v8h14v-8" />
    </Frame>
  ),
} satisfies Record<string, (p: IconProps) => React.ReactElement>;

export type IconName = keyof typeof Icon;
