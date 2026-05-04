import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Btn, Input } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth';

const FORGOT_PASSWORD_URL = 'https://farmos.app/login';

export function LoginScreen() {
  const { t: tx } = useTranslation();
  const { t } = useTheme();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [username, setUsername] = useState('farmos_owner');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('กรุณากรอกข้อมูล', 'ใส่ชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authApi.login({ username, password, rememberMe: true });
      await setSession(res.accessToken, res.user);
      router.replace('/(app)/(tabs)/home');
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'เข้าสู่ระบบล้มเหลว';
      Alert.alert('เข้าสู่ระบบล้มเหลว', message);
    } finally {
      setSubmitting(false);
    }
  };

  const openForgotPassword = async () => {
    try {
      await Linking.openURL(FORGOT_PASSWORD_URL);
    } catch {
      Alert.alert('เปิดลิงก์ไม่สำเร็จ', FORGOT_PASSWORD_URL);
    }
  };

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
