import { Pressable, Text, View, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { dangerInk } from '@/theme/ink';

export type BtnTone = 'brand' | 'fill' | 'move' | 'sell' | 'danger' | 'neutral';
export type BtnVariant = 'solid' | 'soft' | 'ghost';
export type BtnSize = 'sm' | 'md' | 'lg';

type Props = {
  tone?: BtnTone;
  variant?: BtnVariant;
  size?: BtnSize;
  block?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Btn({
  tone = 'brand',
  variant = 'solid',
  size = 'md',
  block,
  leading,
  trailing,
  children,
  onPress,
  disabled,
  style,
}: Props) {
  const { t, mode, shadow } = useTheme();
  const palettes: Record<BtnTone, [string, string, string, string]> = {
    brand: [t.brand, '#ffffff', t.brandSoft, t.brandInk],
    fill: [t.fill, '#ffffff', t.fillSoft, t.fillInk],
    move: [t.move, '#ffffff', t.moveSoft, t.moveInk],
    sell: [t.sell, '#ffffff', t.sellSoft, t.sellInk],
    danger: [t.danger, '#ffffff', t.dangerSoft, dangerInk(mode, t)],
    neutral: [t.ink, t.surface, t.surfaceAlt, t.ink],
  };
  const [solidBg, solidFg, softBg, softFg] = palettes[tone];

  const heights: Record<BtnSize, number> = { sm: 40, md: 52, lg: 60 };
  const fontSizes: Record<BtnSize, number> = { sm: 14, md: 16, lg: 17 };

  const isSolid = variant === 'solid';
  const isGhost = variant === 'ghost';

  const bg = isSolid ? solidBg : variant === 'soft' ? softBg : 'transparent';
  const fg = isSolid ? solidFg : softFg;

  const innerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: heights[size],
    minWidth: heights[size],
    paddingHorizontal: 18,
    borderRadius: radii.md,
    borderWidth: isGhost ? 1 : 0,
    borderColor: isGhost ? t.border : 'transparent',
    backgroundColor: bg,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: '#00000010' }}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
          alignSelf: block ? 'stretch' : 'flex-start',
          transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
        } as ViewStyle,
        block && { width: '100%' },
        style,
      ]}
    >
      <View
        style={[
          innerStyle,
          isSolid && !disabled ? shadow : null,
          block && { alignSelf: 'stretch', width: '100%' },
        ]}
      >
        {leading ? <View>{leading}</View> : null}
        <Text
          style={{
            color: fg,
            fontSize: fontSizes[size],
            fontFamily: type.familySemi,
          }}
        >
          {children}
        </Text>
        {trailing ? <View>{trailing}</View> : null}
      </View>
    </Pressable>
  );
}
