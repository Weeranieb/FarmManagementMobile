import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/components/icons';

type Props = {
  onPress?: () => void;
  bottom?: number;
  right?: number;
  /** When true, shows close icon (quick-actions sheet open). */
  open?: boolean;
};

/** Matches Farm OS prototype FAB diameter. */
export const FAB_SIZE = 60;
const RADIUS = FAB_SIZE / 2;

/** 8-digit hex border from palette ink (~28% alpha). */
function withAlphaHex(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  if (/^#[0-9a-f]{6}$/i.test(hex)) return `${hex}${a}`;
  return hex;
}

export function FAB({ onPress, bottom = 24, right = 20, open = false }: Props) {
  const { t } = useTheme();
  const borderColor = withAlphaHex(t.brandInk, 0.28);

  return (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFillObject,
        // Wrapper fills the parent — the actual FAB is then anchored bottom-right
        // inside it. This sidesteps any quirk where `position: 'absolute'` on a
        // small element doesn't anchor as expected when its parent has flex
        // children that stretched.
        { zIndex: 1000 },
      ]}
    >
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom,
          right,
        }}
      >
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={open ? 'Close quick actions' : 'Open quick actions'}
          android_ripple={{ color: '#ffffff33', radius: RADIUS }}
          style={({ pressed }) => ({
            width: FAB_SIZE,
            height: FAB_SIZE,
            opacity: pressed ? 0.92 : 1,
          })}
        >
          <View
            style={{
              width: FAB_SIZE,
              height: FAB_SIZE,
              borderRadius: RADIUS,
              backgroundColor: t.brand,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderWidth: 1,
              borderColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.18,
              shadowRadius: 10,
              elevation: Platform.OS === 'android' ? 12 : 0,
            }}
          >
            {open ? (
              <Icon.x size={26} color="#ffffff" stroke={2} />
            ) : (
              <Icon.plus size={28} color="#ffffff" stroke={2} />
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}
