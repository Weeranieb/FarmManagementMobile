import { useLoginScreen } from './hook';
import { LoginView } from './view';

export function LoginScreen() {
  const state = useLoginScreen();
  return <LoginView {...state} />;
}
