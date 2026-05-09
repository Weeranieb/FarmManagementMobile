import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
  type ViewStyle,
} from 'react-native';
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.40)' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="dismiss" />
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
      </View>
    </Modal>
  );
}
