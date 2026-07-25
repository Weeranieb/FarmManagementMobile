import { Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Tappable } from '@/components/ui';
import { KIND_LABEL, type FilterId } from '../constants';

/** No events at all — brand-new farm. The whole filter row is hidden in this
 *  state, so this is the only content on screen. */
export function EmptyAll() {
  const { t } = useTheme();
  return (
    <View
      style={{ paddingVertical: space[10], paddingHorizontal: space[7] + 4, alignItems: 'center' }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: space[4],
        }}
      >
        <Icon.doc size={28} color={t.inkMute} />
      </View>
      <Text style={{ fontSize: type.sizes.md, fontFamily: type.familyBold, color: t.ink }}>
        ยังไม่มีประวัติกิจกรรม
      </Text>
      <Text
        style={{
          fontSize: type.sizes.sm,
          color: t.inkMute,
          fontFamily: type.family,
          lineHeight: 21,
          marginTop: space[1] + 2,
          maxWidth: 250,
          textAlign: 'center',
        }}
      >
        เมื่อคุณเติม ย้าย หรือขายปลา รายการจะมาแสดงที่นี่เรียงตามวัน
      </Text>
    </View>
  );
}

type EmptyFilteredProps = {
  kind: FilterId;
  onClear: () => void;
};

/** The active filter matched nothing (events exist under other kinds). */
export function EmptyFiltered({ kind, onClear }: EmptyFilteredProps) {
  const { t } = useTheme();
  const label = kind === 'all' ? '' : KIND_LABEL[kind];
  return (
    <View
      style={{
        paddingVertical: space[9] + 8,
        paddingHorizontal: space[7] + 4,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 18,
          backgroundColor: t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: space[3] + 2,
        }}
      >
        <Icon.filter size={26} color={t.inkMute} />
      </View>
      <Text style={{ fontSize: type.sizes.base, fontFamily: type.familyBold, color: t.ink }}>
        ไม่มีรายการ{label}
      </Text>
      <Text
        style={{
          fontSize: type.sizes.sm,
          color: t.inkMute,
          fontFamily: type.family,
          lineHeight: 21,
          marginTop: space[1] + 2,
          maxWidth: 240,
          textAlign: 'center',
        }}
      >
        ลองล้างตัวกรองเพื่อดูกิจกรรมทั้งหมด
      </Text>
      {/* Chrome on the wrapper — see nativewind Pressable caveat. */}
      <View
        style={{
          marginTop: space[4],
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: radii.sm + 2,
          overflow: 'hidden',
        }}
      >
        <Tappable
          onPress={onClear}
          accessibilityRole="button"
          android_ripple={{ color: t.surfaceAlt }}
          style={{
            height: 42,
            paddingHorizontal: space[4] + 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{ fontSize: type.sizes.sm + 0.5, fontFamily: type.familySemi, color: t.ink }}
          >
            ล้างตัวกรอง
          </Text>
        </Tappable>
      </View>
    </View>
  );
}
