import type { ComponentProps } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

type Props = ComponentProps<typeof SafeAreaView>;

/**
 * Safe area wrapper that always paints the current theme canvas (`t.bg`)
 * behind the status bar / notch so there is no default white gap on iOS.
 */
export function ThemedSafeAreaView({ style, edges, ...rest }: Props) {
  const { t } = useTheme();
  return (
    <SafeAreaView
      {...rest}
      edges={edges ?? ['top']}
      style={[{ flex: 1, backgroundColor: t.bg }, style]}
    />
  );
}
