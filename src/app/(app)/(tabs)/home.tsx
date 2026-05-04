import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import {
  QuickActionsSheet,
  type QuickActionId,
} from '@/screens/home/components/quick-actions-sheet';
import { FAB, FAB_SIZE } from '@/components/ui';
import { HomeScreen } from '@/screens/home';
import { space } from '@/theme/tokens';

const DEFAULT_POND_ID = 11;

const FAB_BOTTOM = space[5]; // 20 px above the tab bar
const FAB_RIGHT = space[5]; // 20 px from the right edge

// Filter logs in dev: `npx react-native log-ios | grep \\[Home\\]`
const log = (...args: unknown[]) => console.log('[Home]', ...args);

export default function HomeRoute() {
  const router = useRouter();
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    log('mount HomeRoute', { defaultPondId: DEFAULT_POND_ID, insetsTop: insets.top });
    return () => log('unmount HomeRoute');
  }, [insets.top]);

  useEffect(() => {
    log('quickActions', quickOpen ? 'open' : 'closed');
  }, [quickOpen]);

  function navigateQuick(id: QuickActionId) {
    log('quickAction picked', id);
    setQuickOpen(false);
    switch (id) {
      case 'logFeed': {
        const path = `/(app)/pond/${DEFAULT_POND_ID}/daily-log`;
        log('router.push', path);
        router.push(path);
        break;
      }
      case 'fill': {
        const path = `/(app)/flows/fill?pondId=${DEFAULT_POND_ID}`;
        log('router.push', path);
        router.push(path);
        break;
      }
      case 'move': {
        const path = `/(app)/flows/move?pondId=${DEFAULT_POND_ID}`;
        log('router.push', path);
        router.push(path);
        break;
      }
      case 'sell': {
        const path = `/(app)/flows/sell?pondId=${DEFAULT_POND_ID}`;
        log('router.push', path);
        router.push(path);
        break;
      }
      default:
        log('quickAction unhandled', id);
        break;
    }
  }

  // Plain `View` (not SafeAreaView) is used as the root so the FAB can be
  // absolutely positioned without any safe-area-context layout surprises.
  // We pad the top manually with `insets.top`.
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top }}>
      <HomeScreen
        // Reserve scroll padding so the last activity row isn't hidden
        // behind the FAB. FAB diameter + bottom offset + breathing room.
        fabClearance={FAB_BOTTOM + FAB_SIZE}
        onOpenPond={(id) => {
          const target = id ?? DEFAULT_POND_ID;
          log('openPond', { id, resolved: target });
          router.push(`/(app)/pond/${target}`);
        }}
      />
      <FAB
        open={quickOpen}
        onPress={() => {
          log('FAB pressed');
          setQuickOpen((v) => !v);
        }}
        bottom={FAB_BOTTOM}
        right={FAB_RIGHT}
      />
      <QuickActionsSheet
        visible={quickOpen}
        onClose={() => {
          log('QuickActionsSheet closed by backdrop/dismiss');
          setQuickOpen(false);
        }}
        onPick={navigateQuick}
      />
    </View>
  );
}
