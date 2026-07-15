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
          // Thai diacritics (ไม้โท/ไม้เอก/สระอุ) sit well above the baseline,
          // so we pad more vertically and use a generous lineHeight to avoid
          // clipping marks like "ที่" in pill labels.
          paddingVertical: 5,
          paddingHorizontal: 10,
          borderRadius: 9999,
          backgroundColor: bg,
          borderWidth: tone === 'ghost' ? 0 : 1,
          borderColor: tone === 'ghost' ? 'transparent' : br,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          // Single line: Android segments Thai by ICU dictionary, so a
          // multi-word label ("ใช้งาน" → ใช้·งาน) in this shrink-to-fit row
          // gets measured at word width and wraps, clipping to "ใช้". Pinning
          // one line makes the pill size to the full label on every device.
          numberOfLines={1}
          style={{
            color: fg,
            fontSize: 12,
            fontFamily: type.familyMedium,
            lineHeight: 18,
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
    <Text
      numberOfLines={1}
      style={{
        color: fgMap[tone],
        fontSize: 12,
        fontFamily: type.familyMedium,
        lineHeight: 18,
      }}
    >
      {children}
    </Text>
  );
}
