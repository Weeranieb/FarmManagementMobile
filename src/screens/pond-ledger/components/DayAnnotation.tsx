import { View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { DAY_W, eventTone, activityText } from '../ui';
import type { PondActivityModel } from '@/features/pond';

/** Real fill/move/sell records threaded under their day — colored, read-only. */
export function DayAnnotation({ events }: { events: PondActivityModel[] }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.surfaceAlt,
        paddingTop: 7,
        paddingBottom: 8,
        paddingRight: 12,
        paddingLeft: DAY_W + 4,
        gap: 5,
      }}
    >
      {events.map((a) => {
        const tone = eventTone(a.mode, t);
        const IconCmp = Icon[tone.icon];
        return (
          <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: radii.xs,
                backgroundColor: tone.soft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconCmp size={12} color={tone.ink} />
            </View>
            <Text style={{ fontSize: 10.5, lineHeight: 15, fontFamily: type.familyBold, color: tone.ink }}>
              {tone.label}
            </Text>
            <Text
              numberOfLines={1}
              style={{ flex: 1, fontSize: 12.5, lineHeight: 17, fontFamily: type.familyNum, color: t.ink }}
            >
              {activityText(a)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
