import { Text, View, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';

export function Placeholder({
  label,
  h = 120,
  style,
}: {
  label?: string;
  h?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTheme();
  return (
    <View
      style={[
        {
          height: h,
          borderRadius: radii.md,
          backgroundColor: t.surfaceAlt,
          borderWidth: 1,
          borderColor: t.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ color: t.inkMute, fontFamily: type.familyNum, fontSize: 12 }}>{label}</Text>
    </View>
  );
}
