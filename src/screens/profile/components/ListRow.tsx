import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon, type IconName } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { dangerInk } from '@/theme/ink';

export type ListRowTone = 'default' | 'danger';

type Props = {
  icon: IconName;
  label: string;
  trailing?: string | React.ReactNode;
  sub?: string;
  last?: boolean;
  tone?: ListRowTone;
  /** Mutes label/sub/icon and suppresses the chevron — used for "coming soon" rows. */
  disabled?: boolean;
  onPress?: () => void;
};

export function ListRow({
  icon,
  label,
  trailing,
  sub,
  last,
  tone = 'default',
  disabled,
  onPress,
}: Props) {
  const { t, mode } = useTheme();
  const Ico = Icon[icon];
  const danger = tone === 'danger';
  const labelColor = danger ? dangerInk(mode, t) : disabled ? t.inkMute : t.ink;
  const subColor = danger ? dangerInk(mode, t) : t.inkMute;
  const iconBg = danger ? t.dangerSoft : t.surfaceAlt;
  const iconColor = danger ? dangerInk(mode, t) : disabled ? t.inkMute : t.ink;
  const chevColor = danger ? dangerInk(mode, t) : t.inkSoft;
  const showChev = !disabled && !!onPress;

  const trailingNode =
    typeof trailing === 'string' ? (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ color: t.inkSoft, fontSize: 14, fontFamily: type.family }}>{trailing}</Text>
        {showChev ? <Icon.chevR size={16} color={chevColor} /> : null}
      </View>
    ) : trailing !== undefined ? (
      trailing
    ) : showChev ? (
      <Icon.chevR size={16} color={chevColor} />
    ) : null;

  return (
    <Tappable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      feedback={onPress && !disabled ? 'scale' : 'none'}
      android_ripple={disabled ? undefined : { color: t.surfaceAlt }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ico size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: labelColor, fontFamily: type.familySemi }}>{label}</Text>
        {sub ? (
          <Text style={{ fontSize: 12, color: subColor, fontFamily: type.family, marginTop: 2 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {trailingNode}
    </Tappable>
  );
}
