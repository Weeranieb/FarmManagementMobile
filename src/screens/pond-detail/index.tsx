import { usePondDetailScreen } from './hook';
import { PondDetailView } from './view';

type Props = {
  pondId: number;
  onBack?: () => void;
  onAction?: (kind: 'fill' | 'move' | 'sell') => void;
  /** @deprecated Daily log is embedded in the feed tab; kept for call-site compatibility. */
  onOpenDailyLog?: () => void;
  showHeader?: boolean;
};

export function PondDetailScreen({
  pondId,
  onOpenDailyLog: _onOpenDailyLog,
  ...rest
}: Props) {
  const state = usePondDetailScreen(pondId);
  return <PondDetailView pondId={pondId} {...state} {...rest} />;
}
