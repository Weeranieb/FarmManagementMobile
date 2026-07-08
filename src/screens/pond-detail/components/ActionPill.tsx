import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon, type IconName } from '@/components/icons';

type Props = {
  tone: 'fill' | 'move' | 'sell';
  icon: IconName;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function ActionPill({ tone, icon, label, onPress, disabled }: Props) {
  const { t } = useTheme();
  const Ico = Icon[icon];
  const map = {
    fill: { ink: t.fillInk, accent: t.fill },
    move: { ink: t.moveInk, accent: t.move },
    sell: { ink: t.sellInk, accent: t.sell },
  };
  const { ink, accent } = map[tone];
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
      >
        <View
          style={{
            width: '100%',
            height: 52,
            borderRadius: radii.md,
            backgroundColor: t.surface,
            borderWidth: 1.5,
            borderColor: disabled ? t.border : accent,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 10,
            gap: 8,
          }}
        >
          <Ico size={18} color={disabled ? t.inkMute : accent} stroke={2.25} />
          <Text
            numberOfLines={1}
            style={{
              color: disabled ? t.inkMute : ink,
              fontFamily: type.familyBold,
              fontSize: 14,
            }}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
