import { usePondLedgerScreen } from './hook';
import { PondLedgerView } from './view';

type Props = {
  pondId: number;
  /** Optional starting month `YYYY-MM`; defaults to the current month. */
  ym?: string;
  onBack?: () => void;
};

export function PondLedgerScreen({ pondId, ym, onBack }: Props) {
  const state = usePondLedgerScreen(pondId, ym);
  return <PondLedgerView state={state} onBack={onBack} />;
}
