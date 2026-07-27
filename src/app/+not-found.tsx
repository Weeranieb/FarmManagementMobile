import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Unmatched-route screen. Expo Router ships a developer-facing default; this
 * replaces it with something a farmer can act on — which matters because a
 * stale deep link (or a bad `router.push`) is the only way to get here.
 */
export default function NotFoundRoute() {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center' }}>
      <ErrorState
        title={tx('error.notFoundTitle')}
        help={tx('error.notFoundHelp')}
        retryLabel={tx('error.goHome')}
        onRetry={() => router.replace('/(app)/(tabs)/home')}
      />
    </View>
  );
}
