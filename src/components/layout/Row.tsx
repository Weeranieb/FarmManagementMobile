import { View, type ViewStyle, type StyleProp } from 'react-native';

type Props = {
  children?: React.ReactNode;
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Row({ children, gap = 8, align = 'center', justify, wrap, style }: Props) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: align,
          gap,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        justify ? { justifyContent: justify } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Col({
  children,
  gap = 8,
  align,
  style,
}: {
  children?: React.ReactNode;
  gap?: number;
  align?: ViewStyle['alignItems'];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flexDirection: 'column', gap }, align ? { alignItems: align } : null, style]}>
      {children}
    </View>
  );
}
