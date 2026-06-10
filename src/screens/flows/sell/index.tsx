import { useSellFlow } from './hook';
import { SellView } from './view';

type Props = {
  pondId?: number;
  onClose?: () => void;
};

export function SellFlow({ pondId, onClose }: Props) {
  const state = useSellFlow(pondId, onClose);
  return <SellView {...state} />;
}
