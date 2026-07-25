import { useMerchantsScreen } from './hook';
import { MerchantsView } from './view';

type Props = { showHeader?: boolean };

export function MerchantsScreen(props: Props) {
  const state = useMerchantsScreen();
  return <MerchantsView {...state} {...props} />;
}
