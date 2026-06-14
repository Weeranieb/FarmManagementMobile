import { forwardRef, useState } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type ViewStyle,
  type StyleProp,
  Text,
  type TextInputProps,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';

type Props = TextInputProps & {
  suffix?: string;
  big?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** When true, adds a trailing control to show/hide text (use with password fields). */
  passwordToggle?: boolean;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  {
    suffix,
    big,
    containerStyle,
    style,
    onFocus,
    onBlur,
    passwordToggle,
    secureTextEntry,
    ...rest
  },
  ref,
) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const effectiveSecure = passwordToggle ? !passwordVisible : (secureTextEntry ?? false);

  return (
    <View
      style={[
        {
          height: 56,
          borderRadius: radii.md,
          backgroundColor: t.surface,
          borderWidth: 1.5,
          borderColor: focused ? t.brand : t.border,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
        } as ViewStyle,
        containerStyle,
      ]}
    >
      <TextInput
        ref={ref}
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
            color: t.ink,
            fontFamily: big ? type.familyNumSemi : type.family,
            fontSize: big ? 22 : 16,
          },
          style,
        ]}
      />
      {passwordToggle ? (
        <Pressable
          onPress={() => setPasswordVisible((v) => !v)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={passwordVisible ? tx('auth.hidePassword') : tx('auth.showPassword')}
          style={{ padding: 4, marginLeft: 4 }}
        >
          {passwordVisible ? (
            <Icon.eyeOff size={22} color={t.inkSoft} stroke={1.8} />
          ) : (
            <Icon.eye size={22} color={t.inkSoft} stroke={1.8} />
          )}
        </Pressable>
      ) : null}
      {suffix ? (
        <Text
          style={{
            color: t.inkMute,
            fontSize: 13,
            fontFamily: type.familyNum,
            marginLeft: 6,
          }}
        >
          {suffix}
        </Text>
      ) : null}
    </View>
  );
});
