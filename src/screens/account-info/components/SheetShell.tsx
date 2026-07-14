import { useEffect } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space } from '@/theme/tokens';
import { Icon } from '@/components/icons';

type Props = {
  visible: boolean;
  onClose: () => void;
  heightPct?: number;
  /** Size the sheet to its content instead of a fixed `heightPct` — avoids the
   *  empty gap under short sheets. Capped at 90% of the screen. */
  fitContent?: boolean;
  /** Render an explicit close (✕) button top-right — a real dismiss affordance
   *  since the grabber here is decorative (not drag-to-dismiss). */
  showClose?: boolean;
  children?: React.ReactNode;
};

export function SheetShell({
  visible,
  onClose,
  heightPct = 0.7,
  fitContent = false,
  showClose = false,
  children,
}: Props) {
  const { t, shadowLg } = useTheme();
  const insets = useSafeAreaInsets();
  const screenH = Dimensions.get('window').height;

  // Slide the sheet up via a manual translateY that always rests at 0. Reanimated's
  // `entering={SlideInDown}` resolves the resting position from a layout pass that,
  // on Android's new architecture, runs before the nav-bar inset is applied — so the
  // sheet settled floating above the true bottom until a touch forced a relayout.
  // Same fix the daily-log sheets use (useSheetSlideIn); applied here for every sheet
  // built on SheetShell. Starts a full screen-height below its resting spot.
  const slideY = useSharedValue(screenH);
  useEffect(() => {
    slideY.value = visible ? withTiming(0, { duration: 240 }) : screenH;
  }, [visible, screenH, slideY]);
  const sheetAnim = useAnimatedStyle(() => ({ transform: [{ translateY: slideY.value }] }));

  const sheetStyle: ViewStyle = {
    ...(fitContent ? { maxHeight: screenH * 0.9 } : { height: screenH * heightPct }),
    backgroundColor: t.bg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: 'hidden',
    // Inside a RN Modal the safe-area context can resolve to 0 (the Modal
    // renders outside the provider tree), so floor the fit-content bottom pad
    // to keep the sheet clear of the home indicator either way.
    paddingBottom: fitContent ? Math.max(insets.bottom, space[4]) : 0,
    ...shadowLg,
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View entering={FadeIn.duration(180)} style={StyleSheet.absoluteFill}>
          <Pressable
            onPress={onClose}
            accessibilityLabel="dismiss"
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.40)' }}
          />
        </Animated.View>

        <Animated.View style={sheetAnim}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={sheetStyle}>
              <View style={{ paddingTop: 10, paddingBottom: 6 }}>
                <View
                  style={{
                    alignSelf: 'center',
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: t.border,
                  }}
                />
                {showClose ? (
                  <Pressable
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="ปิด"
                    hitSlop={8}
                    style={{
                      position: 'absolute',
                      right: space[3],
                      top: space[2],
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: t.surfaceAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon.x size={16} color={t.inkSoft} />
                  </Pressable>
                ) : null}
              </View>
              {children}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}
