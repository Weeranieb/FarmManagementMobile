import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { statTokens, type StatVariant } from './stat-palettes';

export type StatCardProps = {
  variant: StatVariant;
  icon: IconName;
  title: string;
  value: string;
  subtitle: string;
  onPress?: () => void;
};

/**
 * 2×2 dashboard tile — matches FarmOS `SummaryTile` spec from screens-home.jsx.
 *  • bg:     t[tone + 'Soft']
 *  • border: 1px solid t[tone + 'Ink'] @ 10% (`${ink}1a`)
 *  • icon + label color: t[tone + 'Ink']  (label @ 85% opacity)
 *  • value:  t.ink     (IBM Plex Sans numeric, 22 / 700)
 *  • unit:   t.inkSoft
 *  • caption:t.inkMute
 *  • radius: radii.lg (18)
 *  • height: 96 fixed
 */
export function StatCard({ variant, icon, title, value, subtitle, onPress }: StatCardProps) {
  const { t } = useTheme();
  const tokens = statTokens[variant];
  const Ico = Icon[icon];

  const dynamic = useMemo(() => {
    const soft = t[tokens.soft] as string;
    const ink = t[tokens.ink] as string;
    return {
      card: {
        backgroundColor: soft,
        // FarmOS prototype renders a near-black border (the original `${fg}1a` is invalid
        // CSS for OKLCH and falls back to `currentColor` ≈ system text color). We replicate
        // that visual with `t.ink` at 20% alpha — neutral, dark, NOT tone-tinted.
        borderColor: `${t.ink}33`,
      },
      ink,
    };
  }, [t, tokens.soft, tokens.ink]);

  const body = (
    <>
      <View style={styles.topRow}>
        <Ico size={16} color={dynamic.ink} stroke={1.7} />
        <Text style={[styles.title, { color: dynamic.ink }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={[styles.value, { color: t.ink }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.subtitle, { color: t.inkMute }]} numberOfLines={2}>
        {subtitle}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, dynamic.card, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        {body}
      </Pressable>
    );
  }

  return <View style={[styles.card, dynamic.card]}>{body}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    height: 96,
    borderRadius: radii.lg,
    borderWidth: 1, // FarmOS spec: 1 px (the prototype uses 1 px solid currentColor ≈ near-black)
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    justifyContent: 'flex-start',
  },
  pressed: {
    opacity: 0.92,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 12,
    fontFamily: type.familySemi,
    opacity: 0.85,
  },
  value: {
    fontSize: 22,
    fontFamily: type.familyNumBold,
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: type.family,
    lineHeight: 14,
  },
});
