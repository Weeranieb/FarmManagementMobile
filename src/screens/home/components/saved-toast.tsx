import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';

type Props = {
  count: number;
  /** ms before auto-dismiss. Default 5000. */
  duration?: number;
  /** Bottom offset above the tab bar. */
  bottom?: number;
  onPress?: () => void;
  onDismiss?: () => void;
};

/**
 * Floating "บันทึกแล้ว N บ่อ" confirmation toast pinned above the bottom
 * tabs. Auto-dismisses after `duration` ms; tap to jump to the just-saved
 * records.
 *
 * Visual matches the design's SavedToast (Farm OS/screens-home-v2.jsx,
 * design hash kqFMoxs4-8gg1ccjJVGoQg):
 *   • dark `t.ink` background, white text
 *   • 24×24 check chip with translucent white fill
 *   • "บันทึกแล้ว N บ่อ" (sm/bold) + "แตะเพื่อดูรายการ" (xs, 70% opacity)
 *   • fade + slide-up entrance (180ms), no countdown bar
 *
 * The dark pill chrome lives on a <View>, not the Pressable — function
 * styles on Pressable are silently dropped by react-native-css-interop
 * (NativeWind), which previously made this toast mount invisible.
 */
export function SavedToast({ count, duration = 5000, bottom = 76, onPress, onDismiss }: Props) {
  const { t } = useTheme();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const dismissTimer = setTimeout(() => {
      onDismiss?.();
    }, duration);
    return () => clearTimeout(dismissTimer);
  }, [duration, enter, onDismiss]);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: space[4],
        right: space[4],
        bottom,
        opacity: enter,
        transform: [{ translateY }],
      }}
    >
      <View
        style={{
          backgroundColor: t.ink,
          borderRadius: radii.md - 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          elevation: 8,
          overflow: 'hidden',
        }}
      >
        <Tappable
          onPress={onPress}
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: space[3],
            paddingVertical: space[2] + 2,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.14)',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon.check size={14} color="#fff" stroke={2.4} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                color: '#fff',
                fontSize: type.sizes.sm,
                fontFamily: type.familySemi,
                lineHeight: 16,
              }}
            >
              บันทึกแล้ว {count} บ่อ
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: type.sizes.xs,
                fontFamily: type.family,
                marginTop: 2,
              }}
            >
              แตะเพื่อดูรายการ
            </Text>
          </View>
          <Icon.chevR size={16} color="#fff" stroke={2} />
        </Tappable>
      </View>
    </Animated.View>
  );
}
