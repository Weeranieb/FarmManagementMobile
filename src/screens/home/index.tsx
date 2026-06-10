import { useHomeScreen, type HomeVariant } from './hook';
import { HomeView } from './view';
import type { SecondaryActionId } from './components/secondary-action-row';
import type { ActivityItem } from './components/activity-row';
import type { PendingPond } from './constants';

type Props = {
  showHeader?: boolean;
  /** Bottom scroll padding so the last row clears the floating toast/tab bar. */
  bottomClearance?: number;
  /** Drives loading / empty / default / justSaved states. */
  variant?: HomeVariant;
  /** Number of ponds saved in the most recent Daily Log action (drives "+N"). */
  justSavedCount?: number;
  /** Show the floating "บันทึกแล้ว" toast. Defaults to true while `variant`
   *  is `justSaved`. Pass `false` to keep the +3 pill on the card without the
   *  toast (e.g. once it has been dismissed). */
  showSavedToast?: boolean;
  onOpenDailyLog?: (pondId?: number) => void;
  onOpenActivity?: (e: ActivityItem) => void;
  onOpenSecondaryAction?: (id: SecondaryActionId) => void;
  onCreateFarm?: () => void;
  /** Tap the floating banner after a save. */
  onPressSavedToast?: () => void;
  onDismissSavedToast?: () => void;
};

export function HomeScreen({
  showHeader = true,
  bottomClearance,
  variant = 'default',
  justSavedCount = 3,
  showSavedToast,
  onOpenDailyLog,
  onOpenActivity,
  onOpenSecondaryAction,
  onCreateFarm,
  onPressSavedToast,
  onDismissSavedToast,
}: Props) {
  const state = useHomeScreen({ variant, justSavedCount });
  return (
    <HomeView
      showHeader={showHeader}
      bottomClearance={bottomClearance}
      justSavedCount={justSavedCount}
      showSavedToast={showSavedToast}
      onOpenDailyLog={onOpenDailyLog}
      onOpenActivity={onOpenActivity}
      onOpenSecondaryAction={onOpenSecondaryAction}
      onCreateFarm={onCreateFarm}
      onPressSavedToast={onPressSavedToast}
      onDismissSavedToast={onDismissSavedToast}
      {...state}
    />
  );
}

export type { HomeVariant, SecondaryActionId, PendingPond };
