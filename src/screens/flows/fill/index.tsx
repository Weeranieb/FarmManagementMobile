import { useFillFlow } from './hook';
import { FillView } from './view';

type Props = {
  pondId: number;
  onClose?: () => void;
};

export function FillFlow({ pondId, onClose }: Props) {
  const state = useFillFlow(pondId, onClose);
  if (!state.pond) return null;
  return <FillView {...state} pond={state.pond} />;
}
