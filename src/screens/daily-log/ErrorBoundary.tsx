import { Component, type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class DailyLogErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    // Print everything we can — this is what we need to diagnose the crash.
    console.log('[DailyLog][ERROR]', error.name, error.message);
    console.log('[DailyLog][ERROR][stack]\n' + (error.stack ?? '(no stack)'));
    console.log('[DailyLog][ERROR][componentStack]' + (info.componentStack ?? '(none)'));
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            DailyLog render error
          </Text>
          <Text style={{ fontSize: 13, color: '#a00', marginBottom: 12 }}>
            {this.state.error.name}: {this.state.error.message}
          </Text>
          <Text style={{ fontSize: 11, color: '#444' }}>
            {this.state.error.stack ?? '(no stack)'}
          </Text>
        </View>
      </ScrollView>
    );
  }
}
