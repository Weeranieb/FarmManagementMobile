import { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';

type Props = TextInputProps & {
  label?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  monospace?: boolean;
  passwordToggle?: boolean;
};

export function FormInput({
  label,
  required,
  error,
  helper,
  monospace,
  passwordToggle,
  secureTextEntry,
  onFocus,
  onBlur,
  style,
  ...rest
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [shown, setShown] = useState(false);
  const showError = !!error;
  const effectiveSecure = passwordToggle ? !shown : (secureTextEntry ?? false);

  const borderColor = showError ? t.danger : focused ? t.brand : t.border;

  const containerStyle: ViewStyle = {
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: rest.editable === false ? t.surfaceAlt : t.surface,
    borderWidth: 1.5,
    borderColor,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  };

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 12, fontFamily: type.familyMedium, color: t.inkSoft }}>
            {label}
          </Text>
          {required ? (
            <Text style={{ color: t.danger, fontFamily: type.familySemi, fontSize: 12 }}>*</Text>
          ) : null}
        </View>
      ) : null}

      <View style={containerStyle}>
        <TextInput
          {...rest}
          secureTextEntry={effectiveSecure}
          placeholderTextColor={t.inkMute}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: rest.editable === false ? t.inkMute : t.ink,
              fontFamily: monospace ? type.familyNum : type.family,
              padding: 0,
            },
            style,
          ]}
        />
        {passwordToggle ? (
          <Tappable
            onPress={() => setShown((s) => !s)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={shown ? tx('auth.hidePassword') : tx('auth.showPassword')}
            style={{ padding: 4 }}
          >
            {shown ? (
              <Icon.eyeOff size={20} color={t.inkSoft} stroke={1.7} />
            ) : (
              <Icon.eye size={20} color={t.inkSoft} stroke={1.7} />
            )}
          </Tappable>
        ) : null}
      </View>

      {showError ? (
        <Text style={{ fontSize: 11, color: t.danger, fontFamily: type.family, lineHeight: 16 }}>
          {error}
        </Text>
      ) : helper ? (
        <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family, lineHeight: 16 }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
