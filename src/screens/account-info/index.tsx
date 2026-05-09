import { useAccountInfoForm } from './hook';
import { AccountInfoView } from './view';

export function AccountInfoScreen() {
  const state = useAccountInfoForm();
  return <AccountInfoView {...state} />;
}
