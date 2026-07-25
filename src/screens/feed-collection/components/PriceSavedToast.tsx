import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';

type Props = {
  /** Headline. Defaults to the feed price-save text so existing callers are unchanged. */
  title?: string;
  /** Optional second line — e.g. "โปรฟีด · ฿940/ถุง". */
  detail?: string;
  /** ms before auto-dismiss. Default 2800. */
  duration?: number;
  /** Distance from the bottom edge — pass enough to clear a FAB / tab bar. */
  bottom?: number;
  onDismiss: () => void;
};

/**
 * Floating "บันทึกราคาแล้ว" confirmation shown after a successful price save.
 * Styled to match the home SavedToast (dark `t.ink` pill, white check chip,
 * fade + slide-up entrance) so save feedback reads the same across the app.
 *
 * Presentational only: the parent keys it by a nonce so each save replays the
 * entrance, and owns the dismiss. No tap affordance by design — it's a
 * transient confirmation, not a navigation target — so it stays
 * `pointerEvents="none"` and never eats a touch meant for the list behind it.
 *
 * The pill chrome sits on a <View>, never a Pressable: NativeWind silently
 * drops function styles on Pressable, which has mounted this kind of toast
 * invisible before (see SavedToast).
 */
export function PriceSavedToast({
  title = 'บันทึกราคาแล้ว',
  detail,
  duration = 2800,
  bottom = 24,
  onDismiss,
}: Props) {
  const { t } = useTheme();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, enter, onDismiss]);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View
      pointerEvents="none"
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
            {title}
          </Text>
          {detail ? (
            <Text
              numberOfLines={1}
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: type.sizes.xs,
                fontFamily: type.family,
                marginTop: 2,
              }}
            >
              {detail}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
