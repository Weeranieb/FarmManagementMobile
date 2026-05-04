import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/components/icons';
import { type } from '@/theme/tokens';

export default function TabsLayout() {
  const { t } = useTheme();
  const { t: tx } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
