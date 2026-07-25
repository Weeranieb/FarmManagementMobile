import { useSellFlow, type SellResult } from './hook';
import { SellView } from './view';

export type { SellResult };

type Props = {
  pondId?: number;
  /** Carries a result only when a sale was saved — undefined on cancel. */
  onClose?: (result?: SellResult) => void;
};

export function SellFlow({ pondId, onClose }: Props) {
  const state = useSellFlow(pondId, onClose);
  return <SellView {...state} />;
}
