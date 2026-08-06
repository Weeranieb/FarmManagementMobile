import { useRef } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Btn, Input, Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { warnInk } from '@/theme/ink';
import { radii, type } from '@/theme/tokens';
import type { SignedOutReason } from '@/features/auth';
import appJson from '../../../app.json';

const APP_VERSION = appJson.expo.version;

type Props = {
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  submitting: boolean;
  handleLogin: () => void;
  signedOutReason: SignedOutReason | null;
  dismissSignedOut: () => void;
};

export function LoginView({
  username,
  setUsername,
  password,
  setPassword,
  submitting,
  handleLogin,
  signedOutReason,
  dismissSignedOut,
}: Props) {
  const { t: tx } = useTranslation();
  const { t, mode } = useTheme();
  const warn = warnInk(mode, t);
  const passwordRef = useRef<TextInput>(null);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior="padding"
    >
      <ScrollView
        delaysContentTouches={false}
        contentContainerStyle={{ flexGrow: 1, padding: 28, paddingTop: 64 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: 32 }}>
          <View style={{ gap: 14 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: radii.lg,
                backgroundColor: t.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontFamily: type.familyBold,
                  fontSize: 28,
                  letterSpacing: -0.5,
                }}
              >
                F
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontFamily: type.familyBold,
                  color: t.ink,
                  letterSpacing: -0.3,
                }}
              >
                {tx('app.name')}
              </Text>
              <Text
                style={{ color: t.inkSoft, marginTop: 4, fontSize: 14, fontFamily: type.family }}
              >
                {tx('app.tagline')}
              </Text>
            </View>
          </View>

          {/* Why the user is looking at this screen. Without it, an expired
              token reads as the app randomly logging them out mid-task. */}
          {signedOutReason ? (
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                padding: 14,
                borderRadius: radii.md,
                backgroundColor: t.warnSoft,
                borderWidth: 1,
                borderColor: warn,
              }}
            >
              <Icon.clock size={18} color={warn} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 13.5, fontFamily: type.familySemi, color: warn }}>
                  {tx('auth.expired.title')}
                </Text>
                <Text
                  style={{
                    fontSize: 12.5,
                    lineHeight: 18,
                    fontFamily: type.family,
                    color: t.ink,
                    marginTop: 3,
                  }}
                >
                  {tx('auth.expired.body')}
                </Text>
              </View>
              <Tappable
                onPress={dismissSignedOut}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={tx('common.close')}
                style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon.x size={15} color={warn} />
              </Tappable>
            </View>
          ) : null}

          <View style={{ gap: 14, alignSelf: 'stretch', width: '100%' }}>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontFamily: type.familyMedium, color: t.inkSoft }}>
                {tx('auth.username')}
              </Text>
              <Input
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontFamily: type.familyMedium, color: t.inkSoft }}>
                {tx('auth.password.label')}
              </Text>
              <Input
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                passwordToggle
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={() => {
                  if (!submitting) handleLogin();
                }}
              />
            </View>
            <Btn tone="brand" size="lg" block onPress={handleLogin} disabled={submitting}>
              {submitting ? tx('auth.loggingIn') : tx('auth.login')}
            </Btn>
          </View>
        </View>
        <Text
          style={{
            textAlign: 'center',
            color: t.inkMute,
            fontSize: 11,
            marginTop: 24,
            fontFamily: type.familyNum,
          }}
        >
          {tx('app.version', { version: APP_VERSION })}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
