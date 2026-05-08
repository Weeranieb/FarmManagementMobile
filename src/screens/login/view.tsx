import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Btn, Input } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';

type Props = {
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  submitting: boolean;
  handleLogin: () => void;
  openForgotPassword: () => void;
};

export function LoginView({
  username,
  setUsername,
  password,
  setPassword,
  submitting,
  handleLogin,
  openForgotPassword,
}: Props) {
  const { t: tx } = useTranslation();
  const { t } = useTheme();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
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
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontFamily: type.familyMedium, color: t.inkSoft }}>
                {tx('auth.password')}
              </Text>
              <Input
                value={password}
                onChangeText={setPassword}
                passwordToggle
                autoCapitalize="none"
              />
            </View>
            <Btn tone="brand" size="lg" block onPress={handleLogin} disabled={submitting}>
              {submitting ? 'กำลังเข้าสู่ระบบ...' : tx('auth.login')}
            </Btn>
            <Pressable
              onPress={openForgotPassword}
              hitSlop={8}
              style={{ alignSelf: 'center', paddingVertical: 4 }}
            >
              <Text style={{ color: t.brand, fontSize: 13, fontFamily: type.familyMedium }}>
                ลืมรหัสผ่าน? (เปิดเว็บ)
              </Text>
            </Pressable>
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
          {tx('auth.version')} · v.farmos.app
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
