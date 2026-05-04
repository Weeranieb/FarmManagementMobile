import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import type { ThemePalette } from '@/theme/tokens';
import type { ViewStyle } from 'react-native';

export type AlertStripTone = 'danger' | 'warn';

export type AlertStripCardProps = {
  title: string;
  subtitle: string;
  /** Optional emphasised tail (e.g. "เลยกำหนด 2 บ่อ") — rendered in `t.danger`. */
  emphasis?: string;
  /** Picks the soft fill + dot/border accent. Defaults to `danger` (matches the design's red strip). */
  tone?: AlertStripTone;
  onPress?: () => void;
};

const SOFT: Record<AlertStripTone, keyof ThemePalette> = {
  danger: 'dangerSoft',
  warn: 'warnSoft',
};
const ACCENT: Record<AlertStripTone, keyof ThemePalette> = {
  danger: 'danger',
  warn: 'warn',
};

/**
 * Long horizontal alert strip rendered directly under the 2×2 stat grid.
 * Matches FarmOS `TaskPill` from screens-home.jsx.
 *
 * Chrome (bg + 1.5 px tone-tinted border + 18 px radius) is always painted
 * by an outer `View`. The inner `Pressable` only handles the press feedback,
 * so the colored card is guaranteed to render regardless of how RN merges
 * the Pressable style function.
 */
export function AlertStripCard({
  title,
  subtitle,
  emphasis,
  tone = 'danger',
  onPress,
}: AlertStripCardProps) {
  const { t } = useTheme();
  const soft = t[SOFT[tone]] as string;
  const accent = t[ACCENT[tone]] as string;

  const wrapperStyle: ViewStyle = {
    backgroundColor: soft,
    // FarmOS prototype renders a near-black border (the original `${t[tone]}33` is invalid
    // CSS for OKLCH and falls back to `currentColor` ≈ system text color). We replicate
    // that visual with `t.ink` at 20% alpha — neutral, dark, NOT tone-tinted.
    borderColor: `${t.ink}33`,
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  };

  const innerRow = (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: t.ink }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: t.inkSoft }]} numberOfLines={1}>
          {subtitle}
          {emphasis ? (
            <Text style={[styles.emphasis, { color: t.danger }]}> · {emphasis}</Text>
          ) : null}
        </Text>
      </View>
      <View style={styles.chevWrap}>
        <Icon.chevR size={18} color={t.inkSoft} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <View style={wrapperStyle}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? 0.94 : 1 })}
        >
          {innerRow}
        </Pressable>
      </View>
    );
  }

  return <View style={wrapperStyle}>{innerRow}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 16,
    paddingRight: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
    marginRight: 12,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  chevWrap: {
    flexShrink: 0,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontFamily: type.familyBold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: type.familyNum,
  },
  emphasis: {
    fontSize: 12,
    fontFamily: type.familyNumSemi,
  },
});
