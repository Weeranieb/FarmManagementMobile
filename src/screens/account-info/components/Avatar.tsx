import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';

type Props = {
  initial: string;
  name?: string;
  size?: number;
};

export function Avatar({ initial, name, size = 88 }: Props) {
  const { t } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 10 }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: t.brandSoft,
          borderWidth: 2,
          borderColor: t.brand,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: t.brandInk,
            fontFamily: type.familyBold,
            fontSize: Math.round(size * 0.42),
          }}
        >
          {initial || '–'}
        </Text>
      </View>
      {name ? (
        <Text style={{ fontFamily: type.familySemi, fontSize: 16, color: t.ink }}>{name}</Text>
      ) : null}
    </View>
  );
}
