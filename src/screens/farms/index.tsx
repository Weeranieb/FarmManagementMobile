import { useFarmsScreen } from './hook';
import { FarmsView } from './view';

type Props = {
  showHeader?: boolean;
  onOpenFarm?: (id: number) => void;
  /** Open the create-farm sheet on arrival (Home's empty hero routes here). */
  autoOpenCreate?: boolean;
};

export function FarmsScreen({ autoOpenCreate, ...props }: Props) {
  const state = useFarmsScreen({ autoOpenCreate });
  return <FarmsView {...state} {...props} />;
}
