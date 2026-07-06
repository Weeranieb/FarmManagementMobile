import { useEffect } from 'react';
import { Animated, View, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  /** Border radius. Defaults to `4` (text-bar). */
  radius?: number;
  /** Override base color. Defaults to a theme-appropriate neutral. */
  color?: string;
  style?: StyleProp<ViewStyle>;
};

// One shared native-driven pulse for EVERY <Skeleton /> on screen. A loading
// screen can mount 10+ placeholders; a per-instance loop meant 10+ concurrent
// native animations. A single shared Animated.Value drives them all (0.4 ↔ 1.0
// over 1100 ms) — the loop is ref-counted so it only runs while skeletons are
// mounted.
const pulse = new Animated.Value(0.6);
const pulseLoop = Animated.loop(
  Animated.sequence([
    Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
    Animated.timing(pulse, { toValue: 0.4, duration: 550, useNativeDriver: true }),
  ]),
);
let pulseRefs = 0;

function acquirePulse() {
  pulseRefs += 1;
  if (pulseRefs === 1) pulseLoop.start();
}

function releasePulse() {
  pulseRefs -= 1;
  if (pulseRefs <= 0) {
    pulseRefs = 0;
    pulseLoop.stop();
  }
}

/**
 * Reusable shimmer placeholder. Pulses opacity between 0.4 ↔ 1.0 on a 1100 ms
 * loop using RN's built-in Animated (native-driven, no Reanimated overhead for
 * a primitive). All instances share a single loop (see `pulse` above).
 *
 * Usage: `<Skeleton width="60%" height={14} />` or `<Skeleton width={92} height={10} />`
 *
 * Compose larger skeletons by stacking multiple `<Skeleton />`s inside a
 * View that mirrors the real component's chrome (bg, border, radius, padding).
 * That keeps layout stable when the real data arrives.
 */
export function Skeleton({ width = '100%', height = 12, radius = 4, color, style }: Props) {
  const { t, mode } = useTheme();
  const baseColor = color ?? (mode === 'dark' ? t.surfaceAlt : t.surfaceSunk);

  useEffect(() => {
    acquirePulse();
    return releasePulse;
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: baseColor,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

/** Static (non-pulsing) shape — useful for icon-circle placeholders that should feel solid. */
export function SkeletonShape({
  width,
  height,
  radius = 4,
  color,
  style,
}: Required<Pick<Props, 'width' | 'height'>> & Props) {
  const { t, mode } = useTheme();
  const baseColor = color ?? (mode === 'dark' ? t.surfaceAlt : t.surfaceSunk);
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    />
  );
}
