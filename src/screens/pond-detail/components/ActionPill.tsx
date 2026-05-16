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
    fill: { soft: t.fillSoft, ink: t.fillInk, accent: t.fill },
    move: { soft: t.moveSoft, ink: t.moveInk, accent: t.move },
    sell: { soft: t.sellSoft, ink: t.sellInk, accent: t.sell },
  };
  const { soft, ink, accent } = map[tone];
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View
          style={{
            width: '100%',
            height: 56,
            borderRadius: radii.md,
            backgroundColor: soft,
            borderWidth: 1.5,
            borderColor: disabled ? t.border : accent,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 10,
            opacity: disabled ? 0.45 : 1,
            shadowColor: accent,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: disabled ? 0 : 0.12,
            shadowRadius: 3,
            elevation: disabled ? 0 : 1,
          }}
        >
          <Ico size={18} color={ink} stroke={2.25} />
          <Text
            numberOfLines={1}
            style={{
              color: ink,
              fontFamily: type.familyBold,
              fontSize: 14,
              marginLeft: 8,
            }}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
