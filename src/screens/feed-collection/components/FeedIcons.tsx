import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

type Props = { size?: number; stroke?: number; color?: string };

export function FeedPackageIcon({ size = 20, stroke = 1.7, color }: Props) {
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
      <Path d="M21 8.5l-9-5-9 5" />
      <Path d="M21 8.5v7l-9 5-9-5v-7" />
      <Path d="M3 8.5l9 5 9-5" />
      <Path d="M12 13.5v7" />
      <Path d="M7.5 5.75l9 5" />
    </Svg>
  );
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
