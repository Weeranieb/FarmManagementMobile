import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';

export type ActivityKind = 'fill' | 'move' | 'sell' | 'feed';

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  when: string;
  pond: string;
  text: string;
  by?: string;
  extra?: string;
};

type Props = {
  e: ActivityItem;
  onPress?: () => void;
};

/**
 * Activity feed row. Renders as an INDIVIDUAL card matching the alerts/stat-card
 * chrome (white surface, neutral dark border, rounded corners) — multiple
 * `ActivityRow`s stack with a gap rather than living inside a combined Card.
 *
 * Card chrome lives on an outer `View` so it always paints; the inner
 * `Pressable` only owns press-opacity feedback.
 */
export function ActivityRow({ e, onPress }: Props) {
  const { t } = useTheme();
  const dotMap: Record<ActivityKind, string> = {
    fill: t.fill,
    move: t.move,
    sell: t.sell,
    feed: t.brand,
  };

  const wrapperStyle = {
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: `${t.ink}33`,
    borderRadius: radii.md,
    overflow: 'hidden' as const,
  };

  const inner = (
    <View style={styles.body}>
      <View style={styles.headerRow}>
        <View style={[styles.dot, { backgroundColor: dotMap[e.kind] }]} />
        <Text
          style={{
            fontSize: type.sizes.xs + 1,
            color: t.inkMute,
            fontFamily: type.familyNum,
          }}
        >
          {e.when}
        </Text>
        <Text
          style={{
            fontSize: type.sizes.xs + 1,
            color: t.inkMute,
            marginHorizontal: space[1],
          }}
        >
          ·
        </Text>
        <Text
          style={{
            fontSize: type.sizes.sm,
            fontFamily: type.familySemi,
            color: t.ink,
          }}
        >
          {e.pond}
        </Text>
      </View>
      <Text
        style={{
          fontSize: type.sizes.sm + 1,
          color: t.ink,
          fontFamily: type.family,
          lineHeight: 19,
          marginTop: space[1],
        }}
      >
        {e.text}
      </Text>
      {(e.by || e.extra) && (
        <Text
          style={{
            fontSize: type.sizes.xs + 1,
            color: t.inkSoft,
            fontFamily: type.family,
            marginTop: space[1],
          }}
        >
          {e.by ? `โดย ${e.by}` : ''}
          {e.extra ? ` · ${e.extra}` : ''}
        </Text>
      )}
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
  body: {
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: space[2],
    flexShrink: 0,
  },
});
