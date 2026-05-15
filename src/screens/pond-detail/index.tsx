import { usePondDetailScreen } from './hook';
import { PondDetailView } from './view';

type Props = {
  pondId: number;
  onBack?: () => void;
  onAction?: (kind: 'fill' | 'move' | 'sell') => void;
  onOpenDailyLog?: (pondId: number) => void;
  showHeader?: boolean;
};

export function PondDetailScreen({ pondId, ...rest }: Props) {
  const state = usePondDetailScreen(pondId);
  return <PondDetailView pondId={pondId} {...state} {...rest} />;
}
