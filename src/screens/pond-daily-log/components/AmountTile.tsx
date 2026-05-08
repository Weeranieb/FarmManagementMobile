import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Row } from '@/components/layout/Row';

type Props = {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
};

/** Bordered inner tile: label + unit on top row, centered numeric value (daily log prototype). */
export function AmountTile({ label, unit, value, onChange, optional }: Props) {
  const { t } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={{
        flex: 1,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: focused ? t.brand : t.border,
        backgroundColor: t.surface,
        minHeight: 88,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <Row justify="space-between" style={{ marginBottom: 6 }}>
        <Text
          style={{ fontSize: 11, color: t.inkSoft, fontFamily: type.familySemi }}
          numberOfLines={2}
        >
          {label}
          {optional ? (
            <Text style={{ color: t.inkMute, fontFamily: type.family }}> · ไม่บังคับ</Text>
          ) : null}
        </Text>
        <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyNum }}>{unit}</Text>
      </Row>
      <View style={{ flex: 1, justifyContent: 'center', minHeight: 42 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={t.inkMute}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            textAlign: 'center',
            fontSize: type.sizes.xl,
            fontFamily: type.familyNumSemi,
            color: t.ink,
            paddingVertical: 4,
          }}
        />
      </View>
    </View>
  );
}
