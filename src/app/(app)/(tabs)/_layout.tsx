import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/components/icons';
import { type } from '@/theme/tokens';
import { useAuthStore } from '@/features/auth';

export default function TabsLayout() {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  /** Anyone signed in is the farm owner/admin in the current data model. */
  const isAdmin = useAuthStore((s) => s.user != null);
  // Reserve room for the system nav bar (Android gesture/3-button bar, iOS
  // home indicator). A fixed `height` overrides React Navigation's built-in
  // safe-area handling, so add the bottom inset back in ourselves — otherwise
  // the tab bar collides with the Android navigation buttons.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Perf: don't render a tab until first focus (already the v7 default,
        // set explicitly for intent) and suspend blurred tabs from re-rendering
        // in the background (freezeOnBlur is off by default). Backed by
        // react-native-screens; iOS + Android only.
        lazy: true,
        freezeOnBlur: true,
        tabBarActiveTintColor: t.brand,
        tabBarInactiveTintColor: t.inkSoft,
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopColor: t.border,
          height: 64 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: type.familyMedium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: tx('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <Icon.home size={22} color={color} stroke={focused ? 2 : 1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: tx('tabs.farms'),
          tabBarIcon: ({ color, focused }) => (
            <Icon.farm size={22} color={color} stroke={focused ? 2 : 1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          // Non-admins don't see the tab at all (role gating = visibility).
          href: isAdmin ? undefined : null,
          title: tx('tabs.manage'),
          tabBarIcon: ({ color, focused }) => (
            <Icon.sliders size={22} color={color} stroke={focused ? 2 : 1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: tx('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <Icon.user size={22} color={color} stroke={focused ? 2 : 1.6} />
          ),
        }}
      />
    </Tabs>
  );
}
