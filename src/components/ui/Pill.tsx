import { Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { dangerInk, maintInk, warnInk } from '@/theme/ink';

export type PillTone =
  | 'neutral'
  | 'fill'
  | 'move'
  | 'sell'
  | 'brand'
  | 'warn'
  | 'danger'
  | 'success'
  | 'maint'
  | 'ghost';

type Props = {
  tone?: PillTone;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function Pill({ tone = 'neutral', children, style }: Props) {
  const { t, mode } = useTheme();
  const map: Record<PillTone, [string, string, string]> = {
    neutral: [t.surfaceAlt, t.inkSoft, t.border],
    fill: [t.fillSoft, t.fillInk, 'transparent'],
    move: [t.moveSoft, t.moveInk, 'transparent'],
    sell: [t.sellSoft, t.sellInk, 'transparent'],
    brand: [t.brandSoft, t.brandInk, 'transparent'],
    warn: [t.warnSoft, warnInk(mode, t), 'transparent'],
    danger: [t.dangerSoft, dangerInk(mode, t), 'transparent'],
    success: [t.statusActiveSoft, t.statusActive, 'transparent'],
    maint: [t.statusMaintSoft, maintInk(mode, t), 'transparent'],
    ghost: ['transparent', t.inkSoft, t.border],
  };
  const [bg, fg, br] = map[tone];
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: 3,
          paddingHorizontal: 10,
          borderRadius: 9999,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: br,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          style={{
            color: fg,
            fontSize: 12,
            fontFamily: type.familyMedium,
            lineHeight: 16,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

export function PillText({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: PillTone;
}) {
  const { t, mode } = useTheme();
  const fgMap: Record<PillTone, string> = {
    neutral: t.inkSoft,
    fill: t.fillInk,
    move: t.moveInk,
    sell: t.sellInk,
    brand: t.brandInk,
    warn: warnInk(mode, t),
    danger: dangerInk(mode, t),
    success: t.statusActive,
    maint: maintInk(mode, t),
    ghost: t.inkSoft,
  };
  return (
    <Text style={{ color: fgMap[tone], fontSize: 12, fontFamily: type.familyMedium }}>
      {children}
    </Text>
  );
}
