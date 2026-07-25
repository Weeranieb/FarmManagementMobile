import { View, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';
import { Tappable } from './Tappable';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  onPress?: () => void;
};

export function Card({ children, style, padded = true, onPress }: Props) {
  const { t, shadow } = useTheme();
  const baseStyle: ViewStyle = {
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.borderStrong,
    borderRadius: radii.lg,
    padding: padded ? 16 : 0,
    ...shadow,
  };
  if (onPress) {
    return (
      <Tappable
        onPress={onPress}
        style={[baseStyle, style]}
        android_ripple={{ color: t.surfaceAlt }}
      >
        {children}
      </Tappable>
    );
  }
  return <View style={[baseStyle, style]}>{children}</View>;
}
