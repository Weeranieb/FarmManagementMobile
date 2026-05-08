import { useFarmPondsScreen } from './hook';
import { FarmPondsView } from './view';

type Props = {
  farmId: number;
  showHeader?: boolean;
  onBack?: () => void;
  onOpenPond: (pondId: number) => void;
};

export function FarmPondsScreen({ farmId, ...rest }: Props) {
  const state = useFarmPondsScreen(farmId);
  return <FarmPondsView {...state} {...rest} />;
}
