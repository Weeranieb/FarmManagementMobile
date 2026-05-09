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
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  heightPct?: number;
  children: React.ReactNode;
};

export function SheetShell({ visible, onClose, heightPct = 0.7, children }: Props) {
  const { t, shadowLg } = useTheme();
  const screenH = Dimensions.get('window').height;

  const sheetStyle: ViewStyle = {
    height: screenH * heightPct,
    backgroundColor: t.bg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: 'hidden',
    ...shadowLg,
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          style={StyleSheet.absoluteFill}
        >
          <Pressable
            onPress={onClose}
            accessibilityLabel="dismiss"
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.40)' }}
          />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(260)}
          exiting={SlideOutDown.duration(220)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={sheetStyle}>
              <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
                <View
                  style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.border }}
                />
              </View>
              {children}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}
