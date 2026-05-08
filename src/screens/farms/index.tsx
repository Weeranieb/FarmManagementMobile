import { useFarmsScreen } from './hook';
import { FarmsView } from './view';

type Props = {
  showHeader?: boolean;
  onOpenFarm?: (id: number) => void;
};

export function FarmsScreen(props: Props) {
  const state = useFarmsScreen();
  return <FarmsView {...state} {...props} />;
}
