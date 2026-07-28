import { Component, type ReactNode } from 'react';
import { View } from 'react-native';
import { ErrorState } from '@/components/ui';
import i18n from '@/locale/i18n';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * App-wide crash boundary, mounted once at the root.
 *
 * A render error anywhere below here used to unmount the whole tree and leave a
 * blank screen with no way out but force-quitting — which, before drafts were
 * persisted, also meant losing the day's entry. Now the user gets an explicit
 * screen and a button that remounts the tree, and the copy says their unsaved
 * work is still on the phone (features/daily-log/drafts.ts), because after a
 * crash that is the first thing they'll worry about.
 *
 * Scoped boundaries stay useful — daily-log keeps its own, closer to the grid,
 * so a table crash doesn't blank the chrome around it.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // No crash reporter wired up yet, so the dev console is all we have.
    console.log('[AppErrorBoundary]', error.name, error.message);
    console.log('[AppErrorBoundary][stack]\n' + (error.stack ?? '(no stack)'));
    console.log('[AppErrorBoundary][componentStack]' + (info.componentStack ?? '(none)'));
  }

  render() {
    if (this.state.error == null) return this.props.children;
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ErrorState
          title={i18n.t('error.crashTitle')}
          help={i18n.t('error.crashHelp')}
          retryLabel={i18n.t('error.crashReload')}
          onRetry={() => this.setState({ error: null })}
        />
      </View>
    );
  }
}
