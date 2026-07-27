import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { login, useAuthStore } from '@/features/auth';
import { apiErrorMessage } from '@/shared/http';

export function useLoginScreen() {
  const router = useRouter();
  const { t: tx } = useTranslation();
  const setSession = useAuthStore((s) => s.setSession);
  const signedOutReason = useAuthStore((s) => s.signedOutReason);
  const acknowledgeSignedOut = useAuthStore((s) => s.acknowledgeSignedOut);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(tx('auth.missing.title'), tx('auth.missing.body'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await login({ username, password, rememberMe: true });
      // Keep the server's expiry so the next cold start can fail at the door
      // instead of restoring a token it already knows is dead.
      await setSession(res.accessToken, res.user, res.expiredAt);
      router.replace('/(app)/(tabs)/home');
    } catch (err) {
      Alert.alert(tx('auth.failed'), apiErrorMessage(err, tx('auth.failed')));
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
    /** Set when the previous session ended by itself — shown as a notice, and
     *  dismissible so it can't sit there forever once it's been read. */
    signedOutReason,
    dismissSignedOut: useCallback(() => acknowledgeSignedOut(), [acknowledgeSignedOut]),
  };
}
