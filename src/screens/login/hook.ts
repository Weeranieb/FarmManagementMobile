import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { login, useAuthStore } from '@/features/auth';
import { apiErrorMessage } from '@/shared/http';

export function useLoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [username, setUsername] = useState('');
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
      Alert.alert('เข้าสู่ระบบล้มเหลว', apiErrorMessage(err, 'เข้าสู่ระบบล้มเหลว'));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    submitting,
    handleLogin,
  };
}
