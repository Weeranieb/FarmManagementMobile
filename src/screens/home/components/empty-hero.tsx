import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';

type Props = { onCreateFarm?: () => void };

/**
 * Empty state for a brand-new user with no farms yet. Replaces the daily-log
 * primary card; everything below it stays hidden until the user has at least
 * one farm with one pond.
 */
export function EmptyHero({ onCreateFarm }: Props) {
  const { t, shadow } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: radii.lg + 2,
          padding: space[5],
          alignItems: 'center',
        },
        shadow,
      ]}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radii.lg,
          backgroundColor: t.brandSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: space[3] + 2,
        }}
      >
        <Icon.farm size={30} color={t.brandInk} />
      </View>
      <Text
        style={{
          fontSize: type.sizes.lg + 1,
          fontFamily: type.familyBold,
          color: t.ink,
          letterSpacing: -0.2,
          textAlign: 'center',
        }}
      >
        เริ่มต้นฟาร์มแรกของคุณ
      </Text>
      <Text
        style={{
          fontSize: type.sizes.sm,
          color: t.inkSoft,
          marginTop: 6,
          lineHeight: 20,
          textAlign: 'center',
          paddingHorizontal: space[2],
          fontFamily: type.family,
        }}
      >
        เมื่อสร้างฟาร์มและบ่อแล้ว ที่นี่จะแสดงงานวันนี้และประวัติการบันทึก
      </Text>
      {/* Chrome on the View, static style on the Pressable — function styles
          on Pressable are dropped by react-native-css-interop (NativeWind). */}
      <View
        style={{
          marginTop: space[4],
          width: '100%',
          backgroundColor: t.brand,
          borderRadius: radii.md,
          overflow: 'hidden',
        }}
      >
        <Pressable
          onPress={onCreateFarm}
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
          style={{
            height: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Icon.plus size={18} color="#fff" stroke={2.4} />
          <Text style={{ color: '#fff', fontSize: type.sizes.base, fontFamily: type.familyBold }}>
            สร้างฟาร์ม
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function EmptyTrailing() {
  const { t } = useTheme();
  return (
    <View style={{ paddingHorizontal: space[6], paddingVertical: space[6] }}>
      <Text
        style={{
          fontSize: type.sizes.xs,
          color: t.inkMute,
          lineHeight: 18,
          textAlign: 'center',
          fontFamily: type.family,
        }}
      >
        งานที่ทำได้: สร้างฟาร์ม → เพิ่มบ่อ → เติมปลา → บันทึกประจำวัน
      </Text>
    </View>
  );
}
