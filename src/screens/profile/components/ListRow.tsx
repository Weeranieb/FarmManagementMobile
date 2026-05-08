import { Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon, type IconName } from '@/components/icons';

type Props = {
  icon: IconName;
  label: string;
  trailing?: string;
  last?: boolean;
  onPress?: () => void;
};

export function ListRow({ icon, label, trailing, last, onPress }: Props) {
  const { t } = useTheme();
  const Ico = Icon[icon];
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: t.surfaceAlt }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.border,
      }}
    >
      <Ico size={18} color={t.inkSoft} />
      <Text style={{ flex: 1, fontSize: 14, color: t.ink, fontFamily: type.family }}>{label}</Text>
      {trailing ? (
        <Text style={{ color: t.inkSoft, fontSize: 13, fontFamily: type.family }}>{trailing}</Text>
      ) : null}
      <Icon.chevR size={16} color={t.inkSoft} />
    </Pressable>
  );
}
