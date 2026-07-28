import { useHomeScreen, type HomeVariant } from './hook';
import { HomeView } from './view';
import type { SecondaryActionId } from './components/secondary-action-row';
import type { PendingPond } from './constants';
import type { DailyLogTarget } from '@/screens/daily-log/route';

type Props = {
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
  onOpenDailyLog?: (target?: DailyLogTarget) => void;
  onOpenSecondaryAction?: (id: SecondaryActionId) => void;
  onCreateFarm?: () => void;
  /** Tap the floating banner after a save. */
  onPressSavedToast?: () => void;
  onDismissSavedToast?: () => void;
  /** Tap "ดูประวัติทั้งหมด" → full ประวัติกิจกรรม screen. */
  onSeeHistory?: () => void;
  /** Tap the avatar circle → Profile tab. */
  onPressProfile?: () => void;
};

export function HomeScreen({
  bottomClearance,
  variant = 'default',
  justSavedCount = 3,
  showSavedToast,
  onOpenDailyLog,
  onOpenSecondaryAction,
  onCreateFarm,
  onPressSavedToast,
  onDismissSavedToast,
  onSeeHistory,
  onPressProfile,
}: Props) {
  const state = useHomeScreen({ variant, justSavedCount });
  return (
    <HomeView
      bottomClearance={bottomClearance}
      justSavedCount={justSavedCount}
      showSavedToast={showSavedToast}
      onOpenDailyLog={onOpenDailyLog}
      onOpenSecondaryAction={onOpenSecondaryAction}
      onCreateFarm={onCreateFarm}
      onPressSavedToast={onPressSavedToast}
      onDismissSavedToast={onDismissSavedToast}
      onSeeHistory={onSeeHistory}
      onPressProfile={onPressProfile}
      {...state}
    />
  );
}

export type { HomeVariant, SecondaryActionId, PendingPond };
