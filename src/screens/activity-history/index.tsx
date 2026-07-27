import { useActivityHistoryScreen } from './hook';
import { ActivityHistoryView } from './view';

type Props = {
  /** Bottom scroll padding so the last row clears the home indicator. */
  bottomClearance?: number;
  onBack?: () => void;
};

export function ActivityHistoryScreen({ bottomClearance, onBack }: Props) {
  const state = useActivityHistoryScreen();
  return <ActivityHistoryView bottomClearance={bottomClearance} onBack={onBack} {...state} />;
}
