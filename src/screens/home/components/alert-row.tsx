import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { Icon, type IconName } from '@/components/icons';

export type AlertKind = 'danger' | 'warn' | 'success';

export type AlertItem = {
  id: string;
  kind: AlertKind;
  icon: IconName;
  title: string;
  sub: string;
};

type Props = {
  a: AlertItem;
  onPress?: () => void;
  /** When `true` (default) the row paints its own card chrome (bg + border + radius). */
  card?: boolean;
};

/**
 * Alert/task list row. By default renders as an INDIVIDUAL card (matching the
 * stat-card chrome from the design — surface bg, neutral dark border, 14 px radius)
 * so multiple `AlertRow`s stack with a gap rather than living inside a combined Card.
 *
 * The card chrome lives on an outer `View` so it always paints; the inner `Pressable`
 * only owns press-opacity feedback, sidestepping the RN style-array merging pothole
 * we hit on `AlertStripCard`.
 */
export function AlertRow({ a, onPress, card = true }: Props) {
  const { t, mode } = useTheme();
  const palettes: Record<AlertKind, { bg: string; fg: string }> = {
    danger: { bg: t.dangerSoft, fg: t.danger },
    warn: { bg: t.warnSoft, fg: warnInk(mode, t) },
    success: { bg: t.statusActiveSoft, fg: t.statusActive },
  };
  const { bg, fg } = palettes[a.kind];
  const Ico = Icon[a.icon];

  const wrapperStyle = card
    ? {
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: `${t.ink}33`,
        borderRadius: radii.md,
        overflow: 'hidden' as const,
      }
    : null;

  const inner = (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <Ico size={17} color={fg} />
      </View>
      <View style={styles.textCol}>
        <Text
          numberOfLines={2}
          style={{ fontSize: type.sizes.sm, fontFamily: type.familyBold, color: t.ink }}
        >
          {a.title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: type.sizes.xs,
            color: t.inkSoft,
            fontFamily: type.family,
            marginTop: 2,
          }}
        >
          {a.sub}
        </Text>
      </View>
      <View style={styles.chevWrap}>
        <Icon.chevR size={16} color={t.inkSoft} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <View style={wrapperStyle}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          android_ripple={{ color: t.surfaceAlt }}
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          {inner}
        </Pressable>
      </View>
    );
  }

  return <View style={wrapperStyle}>{inner}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    minHeight: 56,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: space[3],
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  chevWrap: {
    flexShrink: 0,
    marginLeft: space[2],
  },
});
