import { usePondDetailScreen } from './hook';
import { PondDetailView } from './view';

export type DailyLogDrillDown = { farmId: number; pondId: number };

type Props = {
  pondId: number;
  onBack?: () => void;
  onAction?: (kind: 'fill' | 'move' | 'sell') => void;
  onOpenDailyLog?: (ctx: DailyLogDrillDown) => void;
  onOpenLedger?: () => void;
  showHeader?: boolean;
};

export function PondDetailScreen({ pondId, ...rest }: Props) {
  const state = usePondDetailScreen(pondId);
  return <PondDetailView pondId={pondId} {...state} {...rest} />;
}
