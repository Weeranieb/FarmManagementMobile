import { useState } from 'react';
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

export default function HomeRoute() {
  const router = useRouter();
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [quickOpen, setQuickOpen] = useState(false);

  function navigateQuick(id: QuickActionId) {
    setQuickOpen(false);
    switch (id) {
      case 'logFeed':
        router.push(`/(app)/pond/${DEFAULT_POND_ID}/daily-log`);
        break;
      case 'fill':
        router.push(`/(app)/flows/fill?pondId=${DEFAULT_POND_ID}`);
        break;
      case 'move':
        router.push(`/(app)/flows/move?pondId=${DEFAULT_POND_ID}`);
        break;
      case 'sell':
        router.push(`/(app)/flows/sell?pondId=${DEFAULT_POND_ID}`);
        break;
      default:
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
        fabClearance={FAB_BOTTOM + FAB_SIZE + space[5]}
        onOpenPond={(id) => router.push(`/(app)/pond/${id ?? DEFAULT_POND_ID}`)}
      />
      <FAB
        open={quickOpen}
        onPress={() => setQuickOpen((v) => !v)}
        bottom={FAB_BOTTOM}
        right={FAB_RIGHT}
      />
      <QuickActionsSheet
        visible={quickOpen}
        onClose={() => setQuickOpen(false)}
        onPick={navigateQuick}
      />
    </View>
  );
}
