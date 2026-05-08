import { useProfileScreen } from './hook';
import { ProfileView } from './view';

type Props = { showHeader?: boolean };

export function ProfileScreen(props: Props) {
  const state = useProfileScreen();
  return <ProfileView {...state} {...props} />;
}
