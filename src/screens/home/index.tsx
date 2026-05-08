import { useHomeScreen } from './hook';
import { HomeView } from './view';

type Props = {
  showHeader?: boolean;
  onOpenPond?: (pondId?: number) => void;
  /** Bottom scroll padding when FAB floats above tab bar (tab route only). */
  fabClearance?: number;
  /** When true, swap real cards for skeleton placeholders. */
  isLoading?: boolean;
};

export function HomeScreen({
  showHeader = true,
  onOpenPond,
  fabClearance,
  isLoading = false,
}: Props) {
  const state = useHomeScreen({ isLoading, showHeader, fabClearance });
  return (
    <HomeView
      showHeader={showHeader}
      onOpenPond={onOpenPond}
      fabClearance={fabClearance}
      isLoading={isLoading}
      {...state}
    />
  );
}
