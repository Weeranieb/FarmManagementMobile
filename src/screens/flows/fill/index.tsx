import { useFillFlow } from './hook';
import { FillView } from './view';

type Props = {
  pondId?: number;
  onClose?: () => void;
};

export function FillFlow({ pondId, onClose }: Props) {
  const state = useFillFlow(pondId, onClose);
  return <FillView {...state} />;
}
