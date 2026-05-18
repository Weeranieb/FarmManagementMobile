import { Pressable, View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { VIBRANT_BRAND } from '../constants';

type Props = {
  dirtyCount: number;
  onSavePress: () => void;
  bottomInset?: number;
};

export function SaveBar({ dirtyCount, onSavePress, bottomInset = 0 }: Props) {
  const { t } = useTheme();
  const enabled = dirtyCount > 0;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 18 + bottomInset,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: t.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: t.border,
          paddingHorizontal: 14,
          paddingVertical: 8,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.12,
          shadowRadius: 28,
          elevation: 6,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 10.5,
              fontFamily: type.familyBold,
              color: t.inkMute,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            รออัปโหลด
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 1 }}>
            <Text style={{ fontSize: 13, fontFamily: type.familyNumBold, color: t.ink }}>
              {dirtyCount}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: type.familyBold, color: t.ink, marginLeft: 4 }}>
              บ่อมีการแก้ไข
            </Text>
          </View>
        </View>
        <Pressable
          disabled={!enabled}
          onPress={onSavePress}
          style={{
            height: 46,
            paddingHorizontal: 16,
            borderRadius: 14,
            backgroundColor: enabled ? VIBRANT_BRAND[600] : t.surfaceSunk,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            opacity: enabled ? 1 : 0.85,
            shadowColor: enabled ? VIBRANT_BRAND[600] : 'transparent',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: enabled ? 0.45 : 0,
            shadowRadius: 14,
            elevation: enabled ? 4 : 0,
          }}
          accessibilityRole="button"
          accessibilityState={{ disabled: !enabled }}
          accessibilityLabel={`บันทึกทั้งหมด ${dirtyCount}`}
        >
          <Icon.check size={15} color={enabled ? '#fff' : t.borderStrong} />
          <Text
            style={{
              fontSize: 13.5,
              fontFamily: type.familyBold,
              color: enabled ? '#fff' : t.borderStrong,
            }}
          >
            บันทึกทั้งหมด
          </Text>
          <View
            style={{
              backgroundColor: enabled ? 'rgba(255,255,255,.18)' : t.border,
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: type.familyNumBold,
                color: enabled ? '#fff' : t.borderStrong,
              }}
            >
              {dirtyCount}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
