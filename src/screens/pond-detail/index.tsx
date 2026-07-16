import { usePondDetailScreen } from './hook';
import { PondDetailView } from './view';
import type { DailyLogTarget } from '@/screens/daily-log/route';

export type { DailyLogTarget };

type Props = {
  pondId: number;
  onBack?: () => void;
  onAction?: (kind: 'fill' | 'move' | 'sell') => void;
  onOpenDailyLog?: (target: DailyLogTarget) => void;
  onOpenLedger?: () => void;
  showHeader?: boolean;
};

export function PondDetailScreen({ pondId, ...rest }: Props) {
  const state = usePondDetailScreen(pondId);
  return <PondDetailView pondId={pondId} {...state} {...rest} />;
}
