import { useMoveFlow } from './hook';
import { MoveView } from './view';

type Props = {
  pondId: number;
  onClose?: () => void;
};

export function MoveFlow({ pondId, onClose }: Props) {
  const state = useMoveFlow(pondId, onClose);
  if (!state.fromPond) return null;
  return <MoveView {...state} fromPond={state.fromPond} />;
}
