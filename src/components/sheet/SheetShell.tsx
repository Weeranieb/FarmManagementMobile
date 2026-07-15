import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { useSheetSlideIn } from '@/screens/daily-log/components/useSheetSlideIn';

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
  /** Optional title row (implies a close control next to the title). */
  title?: string;
  children?: React.ReactNode;
};

export function SheetShell({
  visible,
  onClose,
  heightPct = 0.7,
  fitContent = false,
  showClose = false,
  title,
  children,
}: Props) {
  const { t, shadowLg } = useTheme();
  const insets = useSafeAreaInsets();
  const screenH = Dimensions.get('window').height;
  const sheetAnim = useSheetSlideIn(screenH, visible);

  const sheetStyle: ViewStyle = {
    ...(fitContent ? { maxHeight: screenH * 0.9 } : { height: screenH * heightPct }),
    backgroundColor: t.bg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: 'hidden',
    // Inside a RN Modal the safe-area context can resolve to 0 (the Modal
    // renders outside the provider tree), so floor the fit-content bottom pad
    // to keep the sheet clear of the home indicator either way.
    paddingBottom: fitContent ? Math.max(insets.bottom, space[4]) : Math.max(insets.bottom, 0),
    ...shadowLg,
  };

  const showTitleClose = Boolean(title) || showClose;

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
                {showClose && !title ? (
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
              {title ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: type.familyBold, color: t.ink }}>
                    {title}
                  </Text>
                  {showTitleClose ? (
                    <Pressable
                      onPress={onClose}
                      hitSlop={10}
                      style={{ padding: 4 }}
                      accessibilityRole="button"
                      accessibilityLabel="ปิด"
                    >
                      <Icon.x size={18} color={t.inkMute} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
              {title ? (
                <View style={{ flex: 1, paddingHorizontal: 20 }}>{children}</View>
              ) : (
                children
              )}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}
