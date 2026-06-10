import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';

const SHEET_TOP_RADIUS = 20;
const SCREEN_H = Dimensions.get('window').height;

/**
 * Slide-up bottom sheet with dim backdrop. 220 ms backdrop fade + 280 ms
 * cubic-out slide — every sheet in the app shares this motion so it feels
 * coherent.
 *
 * Behavior:
 *   - Tap the backdrop to close.
 *   - Tap the X icon to close.
 *   - Hardware back closes (Modal onRequestClose).
 *   - Children render inside a padded panel below an optional title row.
 *
 * Layout knobs:
 *   - `maxHeight` clamps the panel for long lists (e.g. merchant pickers).
 *     Defaults to "auto" — content sizes itself.
 *   - Bottom padding always adds the device safe-area inset so the last item
 *     in the sheet sits above the home-indicator.
 *
 * NOT covered (yet): swipe-down-to-close. Tapping the backdrop or X is
 * sufficient for now; revisit when we add a sheet that needs gestures.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  maxHeight,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  maxHeight?: number | `${number}%`;
  children: React.ReactNode;
}) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  const [renderModal, setRenderModal] = useState(false);
  // null on first mount so `visible=true` at mount still plays the open
  // animation — avoids the panel snapping in without a slide.
  const prevVisible = useRef<boolean | null>(null);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    const prev = prevVisible.current;
    prevVisible.current = visible;

    let anim: Animated.CompositeAnimation | null = null;

    if (visible && prev !== true) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(SCREEN_H);
      setRenderModal(true);
      anim = Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      anim.start();
    } else if (!visible && prev === true) {
      anim = Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: SCREEN_H,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      anim.start(({ finished }) => {
        if (finished) setRenderModal(false);
      });
    }

    return () => {
      anim?.stop();
    };
  }, [visible, backdropOpacity, sheetTranslateY]);

  const sheetPaddingBottom = 28 + Math.max(insets.bottom, 0);

  return (
    <Modal visible={renderModal} animationType="none" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
        <Animated.View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            onPress={onClose}
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(15,18,26,0.42)' }]}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>
        <Animated.View
          style={{
            width: '100%',
            alignSelf: 'stretch',
            transform: [{ translateY: sheetTranslateY }],
            paddingTop: 10,
            paddingHorizontal: 20,
            paddingBottom: sheetPaddingBottom,
            backgroundColor: t.bg,
            borderTopLeftRadius: SHEET_TOP_RADIUS,
            borderTopRightRadius: SHEET_TOP_RADIUS,
            maxHeight: maxHeight ?? undefined,
          }}
        >
          {/* Drag-handle pip — purely decorative; not a swipe handle yet. */}
          <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 14 }}>
            <View
              style={{
                width: 44,
                height: 4,
                borderRadius: 2,
                backgroundColor: t.borderStrong,
              }}
            />
          </View>

          {title ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontFamily: type.familyBold, color: t.ink }}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={{ padding: 4 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Icon.x size={18} color={t.inkMute} />
              </Pressable>
            </View>
          ) : null}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
