import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon, type IconName } from '@/components/icons';

type Props = {
  icon: IconName;
  label: string;
  trailing?: string | React.ReactNode;
  sub?: string;
  last?: boolean;
  onPress?: () => void;
};

export function ListRow({ icon, label, trailing, sub, last, onPress }: Props) {
  const { t } = useTheme();
  const Ico = Icon[icon];

  const trailingNode =
    typeof trailing === 'string' ? (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ color: t.inkSoft, fontSize: 14, fontFamily: type.family }}>{trailing}</Text>
        {onPress ? <Icon.chevR size={16} color={t.inkSoft} /> : null}
      </View>
    ) : trailing !== undefined ? (
      trailing
    ) : onPress ? (
      <Icon.chevR size={16} color={t.inkSoft} />
    ) : null;

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
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: t.ink, fontFamily: type.family }}>{label}</Text>
        {sub ? (
          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family, marginTop: 2 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {trailingNode}
    </Pressable>
  );
}
