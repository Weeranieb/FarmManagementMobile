import { TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';

export type MInputProps = {
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  /** Multi-line address-style field — taller box, top-aligned text. */
  multiline?: boolean;
  /** Strip every non-digit on change — belt-and-braces beyond the numeric
   *  keyboard (which doesn't cover paste, autofill, or hardware keyboards). */
  digitsOnly?: boolean;
  /** Danger border — set when the field fails validation. */
  invalid?: boolean;
  /** Optional leading glyph rendered inside the box. */
  leading?: React.ReactNode;
};

/** Themed text field for the merchant add/edit sheets. Mirrors the feed-collection
 *  `FInput` box so both manage tools share one input language across all themes. */
export function MInput({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  multiline = false,
  digitsOnly = false,
  invalid = false,
  leading,
}: MInputProps) {
  const { t } = useTheme();
  const handleChange = digitsOnly
    ? (s: string) => onChangeText(s.replace(/\D/g, ''))
    : onChangeText;
  return (
    <View
      style={{
        minHeight: multiline ? 76 : 52,
        borderRadius: radii.md,
        backgroundColor: t.surface,
        borderWidth: 1.5,
        borderColor: invalid ? t.danger : t.border,
        paddingHorizontal: 14,
        paddingVertical: multiline ? 12 : 0,
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        gap: 10,
      }}
    >
      {leading ? <View style={{ paddingTop: multiline ? 2 : 0 }}>{leading}</View> : null}
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={t.inkMute}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        maxLength={maxLength}
        multiline={multiline}
        style={{
          flex: 1,
          color: t.ink,
          fontFamily: type.family,
          fontSize: 15.5,
          paddingVertical: 0,
          minHeight: multiline ? 52 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </View>
  );
}
