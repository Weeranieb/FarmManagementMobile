import { Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';

export type FInputProps = {
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  suffix?: string;
  /** Hero treatment — taller, sunken panel, xxl number. For the focal price field. */
  hero?: boolean;
  numeric?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric';
};

/** Shared numeric/text field used by feed-collection add/edit/price sheets. */
export function FInput({
  value,
  onChangeText,
  placeholder,
  suffix,
  hero,
  numeric,
  editable = true,
  keyboardType = 'default',
}: FInputProps) {
  const { t } = useTheme();
  return (
    <View
      style={{
        height: hero ? 60 : 52,
        borderRadius: radii.md,
        backgroundColor: hero ? t.surfaceSunk : editable ? t.surface : t.surfaceAlt,
        borderWidth: 1.5,
        borderColor: t.border,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: editable ? 1 : 0.55,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.inkMute}
        editable={editable}
        keyboardType={keyboardType}
        autoCorrect={false}
        style={{
          flex: 1,
          color: t.ink,
          fontFamily: numeric ? (hero ? type.familyNumBold : type.familyNum) : type.family,
          fontSize: hero ? type.sizes.xxl : 15.5,
          letterSpacing: hero ? -0.4 : 0,
          paddingVertical: 0,
        }}
      />
      {suffix ? (
        <Text
          style={{
            fontSize: hero ? 15 : 13,
            color: t.inkSoft,
            fontFamily: type.familyNum,
          }}
        >
          {suffix}
        </Text>
      ) : null}
    </View>
  );
}
