import { useWorkersScreen } from './hook';
import { WorkersView } from './view';

type Props = { showHeader?: boolean };

export function WorkersScreen(props: Props) {
  const state = useWorkersScreen();
  return <WorkersView {...state} {...props} />;
}
