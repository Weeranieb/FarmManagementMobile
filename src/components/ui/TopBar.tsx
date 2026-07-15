import { Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';

type Props = {
  title?: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  dense?: boolean;
  style?: ViewStyle;
};

export function TopBar({ title, subtitle, leading, trailing, dense, style }: Props) {
  const { t } = useTheme();
  return (
    <View
      style={[
        {
          paddingHorizontal: 18,
          paddingTop: dense ? 8 : 18,
          paddingBottom: dense ? 10 : 16,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
          backgroundColor: t.bg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        style,
      ]}
    >
      {leading}
      <View style={{ flex: 1, minWidth: 0 }}>
        {title ? (
          <Text style={{ fontSize: 18, fontFamily: type.familyBold, color: t.ink, lineHeight: 24 }}>
            {title}
          </Text>
        ) : null}

        {subtitle ? (
          <Text
            style={{
              fontSize: type.sizes.sm,
              lineHeight: 18,
              color: t.inkSoft,
              marginTop: 2,
              fontFamily: type.familyMedium,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
