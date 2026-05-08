import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { login, useAuthStore } from '@/features/auth';

const FORGOT_PASSWORD_URL = 'https://farmos.app/login';

export function useLoginScreen() {
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
      const res = await login({ username, password, rememberMe: true });
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

  return {
    username,
    setUsername,
    password,
    setPassword,
    submitting,
    handleLogin,
    openForgotPassword,
  };
}
