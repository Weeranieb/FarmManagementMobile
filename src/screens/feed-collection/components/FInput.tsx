import { Platform, Text, TextInput, View } from 'react-native';
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
  /** Renders a danger border — set when the field fails validation. */
  invalid?: boolean;
};

/**
 * Keep only digits and a single decimal point. Numeric fields run every change
 * through this so non-numeric input can't be entered — belt-and-braces beyond
 * the numeric keyboard, which doesn't cover paste, autofill, hardware keyboards,
 * or the stray separators some keypads emit.
 */
function toDecimalString(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) return cleaned;
  return cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, '');
}

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
  invalid = false,
}: FInputProps) {
  const { t } = useTheme();
  // Numeric fields: filter to a valid decimal string and force the numeric pad.
  const handleChange = numeric ? (text: string) => onChangeText(toDecimalString(text)) : onChangeText;
  const resolvedKeyboard = numeric && keyboardType === 'default' ? 'decimal-pad' : keyboardType;
  return (
    <View
      style={{
        height: hero ? 60 : 52,
        borderRadius: radii.md,
        backgroundColor: hero ? t.surfaceSunk : editable ? t.surface : t.surfaceAlt,
        borderWidth: 1.5,
        borderColor: invalid ? t.danger : t.border,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: editable ? 1 : 0.55,
      }}
    >
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={t.inkMute}
        editable={editable}
        keyboardType={resolvedKeyboard}
        autoCorrect={false}
        style={{
          flex: 1,
          color: t.ink,
          fontFamily: numeric ? (hero ? type.familyNumBold : type.familyNum) : type.family,
          fontSize: hero ? type.sizes.xxl : 15.5,
          letterSpacing: hero ? -0.4 : 0,
          paddingVertical: 0,
          // Without these the value sits high in the box: Android's font padding
          // reserves asymmetric descent space, and digits have no descender to
          // fill it. Matches components/ui/Input.tsx.
          textAlignVertical: 'center',
          ...Platform.select({ android: { includeFontPadding: false } }),
        }}
      />
      {suffix ? (
        <Text
          style={{
            fontSize: hero ? 15 : 13,
            color: t.inkSoft,
            fontFamily: type.familyNum,
            // Drop the same font padding so the suffix stays optically aligned
            // with the value now that the value no longer carries it.
            ...Platform.select({ android: { includeFontPadding: false } }),
          }}
        >
          {suffix}
        </Text>
      ) : null}
    </View>
  );
}
