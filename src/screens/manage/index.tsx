import { useManageScreen } from './hook';
import { ManageView } from './view';

type Props = { showHeader?: boolean };

export function ManageScreen(props: Props) {
  const state = useManageScreen();
  return <ManageView {...state} {...props} />;
}
