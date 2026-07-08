import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { space, type } from '@/theme/tokens';
import { ActivityRow } from '@/screens/home/components/activity-row';
import type { ActivityItem } from '@/screens/home/components/activity-row';
import type { DayGroupModel } from '../hook';

type Props = {
  group: DayGroupModel;
  first?: boolean;
  onPressItem?: (e: ActivityItem) => void;
};

/** One day's events: "วันนี้ / เมื่อวาน / ศ 1 พ.ค. 69" heading + a card of rows. */
export function DayGroup({ group, first = false, onPressItem }: Props) {
  const { t } = useTheme();
  return (
    <View style={{ marginTop: first ? space[1] : space[5] }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingHorizontal: space[1],
          paddingBottom: space[2],
        }}
      >
        <Text
          style={{
            fontSize: type.sizes.xs,
            fontFamily: type.familyBold,
            color: t.inkSoft,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {group.heading}
        </Text>
        <Text style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.familyNum }}>
          {group.items.length} รายการ
        </Text>
      </View>
      <View
        style={{
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: t.border,
        }}
      >
        {group.items.map((e, i, arr) => (
          <ActivityRow
            key={e.id}
            e={e}
            divider={i < arr.length - 1}
            onPress={onPressItem ? () => onPressItem(e) : undefined}
          />
        ))}
      </View>
    </View>
  );
}
