import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/components/icons';
import { type } from '@/theme/tokens';
import { isClientAdmin, useAuthStore } from '@/features/auth';

export default function TabsLayout() {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  /** Client-admin and above. The master-data endpoints behind the จัดการ tab are
   *  client-admin-only server-side, and every tool inside it already gates its
   *  write affordances on the same predicate — so the tab itself follows. */
  const isAdmin = isClientAdmin(useAuthStore((s) => s.user));

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
          height: 64,
          paddingBottom: 10,
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
