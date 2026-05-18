import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';

type Props = {
  scrollT: number;
  dirtyCount: number;
  dateLabel: string;
  onBack?: () => void;
  onPillPress?: () => void;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function AppBar({ scrollT, dirtyCount, dateLabel, onBack, onPillPress }: Props) {
  const { t } = useTheme();

  const eyebrowH = lerp(14, 0, clamp01(scrollT / 0.625));
  const eyebrowOp = lerp(1, 0, clamp01(scrollT / 0.45));
  const dateOp = lerp(0, 1, clamp01((scrollT - 0.55) / 0.25));
  // Fade the divider + shadow in as the chrome collapses. When the chrome is
  // fully expanded (scrollT = 0) the AppBar sits flush against the same-color
  // surface below, so any divider reads as a visible seam.
  const dividerT = clamp01((scrollT - 0.5) / 0.4);

  return (
    <View
      style={{
        backgroundColor: t.surface,
        borderBottomWidth: dividerT > 0 ? StyleSheet.hairlineWidth : 0,
        borderBottomColor: t.border,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04 * dividerT,
        shadowRadius: 6,
        elevation: 2 * dividerT,
        zIndex: 10,
      }}
    >
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Pressable
          onPress={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="ย้อนกลับ"
        >
          <Icon.back size={20} color={t.inkSoft} />
        </Pressable>

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ height: eyebrowH, opacity: eyebrowOp, overflow: 'hidden' }}>
            <Text
              style={{
                fontSize: 10.5,
                color: t.inkMute,
                textTransform: 'uppercase',
                letterSpacing: 0.7,
                fontFamily: type.familyBold,
              }}
            >
              Daily log · วันนี้
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: type.familyBold,
                letterSpacing: 0.1,
                color: t.ink,
                fontSize: 16,
              }}
            >
              บันทึกข้อมูลรายวัน
            </Text>

            {dateOp > 0.02 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  opacity: dateOp,
                }}
              >
                <View
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 999,
                    backgroundColor: t.borderStrong,
                  }}
                />
                <Text
                  style={{
                    fontFamily: type.familyNumSemi,
                    fontSize: 13,
                    color: t.inkSoft,
                  }}
                >
                  {dateLabel}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {dirtyCount > 0 ? (
          <Pressable
            onPress={onPillPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 4,
              paddingHorizontal: 9,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: t.warnSoft,
              backgroundColor: t.warnSoft,
            }}
            accessibilityRole="button"
            accessibilityLabel={`ยังไม่บันทึก ${dirtyCount}`}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: t.warn,
              }}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: type.familyBold,
                color: t.warn,
              }}
            >
              ยังไม่บันทึก
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: type.familyNumBold,
                color: t.warn,
              }}
            >
              {dirtyCount}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
