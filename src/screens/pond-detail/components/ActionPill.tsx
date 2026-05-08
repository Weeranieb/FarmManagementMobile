import { Pressable, Text } from 'react-native';
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
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 52,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: radii.lg,
        backgroundColor: soft,
        borderWidth: 1.5,
        borderColor: disabled ? t.border : accent,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
      })}
    >
      <Ico size={18} color={ink} stroke={2.25} />
      <Text numberOfLines={1} style={{ color: ink, fontFamily: type.familyBold, fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}
