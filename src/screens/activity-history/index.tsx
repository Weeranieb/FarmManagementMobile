import { useActivityHistoryScreen } from './hook';
import { ActivityHistoryView } from './view';
import type { ActivityItem } from '@/screens/home/components/activity-row';

type Props = {
  /** Bottom scroll padding so the last row clears the home indicator. */
  bottomClearance?: number;
  onBack?: () => void;
  onOpenActivity?: (e: ActivityItem) => void;
};

export function ActivityHistoryScreen({ bottomClearance, onBack, onOpenActivity }: Props) {
  const state = useActivityHistoryScreen();
  return (
    <ActivityHistoryView
      bottomClearance={bottomClearance}
      onBack={onBack}
      onOpenActivity={onOpenActivity}
      {...state}
    />
  );
}
