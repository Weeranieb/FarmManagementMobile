import { Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { space, type } from '@/theme/tokens';

type Props = {
  title: string;
  count?: number;
  /** Optional right-aligned link, e.g. "ดูประวัติทั้งหมด". */
  rightLabel?: string;
  onRightPress?: () => void;
};

export function SectionHeading({ title, count, rightLabel, onRightPress }: Props) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: space[5],
        paddingTop: space[5],
        paddingBottom: space[2],
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          fontSize: type.sizes.xs,
          fontFamily: type.familyBold,
          color: t.inkSoft,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          flexShrink: 1,
        }}
      >
        {title}
      </Text>
      {rightLabel ? (
        // Static style only — a function style here gets mangled by
        // react-native-css-interop and the row collapses to a column
        // (chevron wraps under the label).
        <Tappable
          onPress={onRightPress}
          accessibilityRole="link"
          hitSlop={8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            flexShrink: 0,
            paddingLeft: space[2],
          }}
        >
          <Text
            style={{ color: t.brand, fontSize: type.sizes.xs + 1, fontFamily: type.familySemi }}
          >
            {rightLabel}
          </Text>
          <Icon.chevR size={12} color={t.brand} />
        </Tappable>
      ) : count != null ? (
        <Text style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.familyNum }}>
          {count}
        </Text>
      ) : null}
    </View>
  );
}
