import { usePondDetailScreen, type PondDetailTab } from './hook';
import { PondDetailView } from './view';
import type { DailyLogTarget } from '@/screens/daily-log/route';

export type { DailyLogTarget };

type Props = {
  pondId: number;
  /** Tab to land on once (e.g. after a sale) — see `usePondDetailScreen`. */
  focusTab?: PondDetailTab | null;
  onBack?: () => void;
  onAction?: (kind: 'fill' | 'move' | 'sell') => void;
  onOpenDailyLog?: (target: DailyLogTarget) => void;
  onOpenLedger?: () => void;
  /** The pond was deleted — this screen is showing something that no longer
   *  exists, so the route navigates away. */
  onDeleted?: () => void;
  showHeader?: boolean;
};

export function PondDetailScreen({ pondId, focusTab, onDeleted, ...rest }: Props) {
  const state = usePondDetailScreen(pondId, focusTab, onDeleted);
  return <PondDetailView pondId={pondId} {...state} {...rest} />;
}
