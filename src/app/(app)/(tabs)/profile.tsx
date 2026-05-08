import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { ProfileScreen } from '@/screens/profile';

export default function ProfileRoute() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  // Match home tab: plain `View` + `paddingTop: insets.top` so tab screens get
  // reliable top inset on iOS (Dynamic Island / notch) without SafeAreaView quirks.
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top }}>
      <ProfileScreen />
    </View>
  );
}
