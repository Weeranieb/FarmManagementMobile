import { Stack } from 'expo-router';
import { useIsTablet } from '@/hooks/useIsTablet';
import { TabletLayout } from '@/components/layout/TabletLayout';

export default function AppLayout() {
  const isTablet = useIsTablet();

  if (isTablet) {
    return <TabletLayout />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="pond/[id]/index" />
      <Stack.Screen name="pond/[id]/daily-log" />
      <Stack.Screen name="flows/fill" options={{ presentation: 'modal' }} />
      <Stack.Screen name="flows/move" options={{ presentation: 'modal' }} />
      <Stack.Screen name="flows/sell" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
