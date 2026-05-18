import type { ComponentProps } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

type Props = ComponentProps<typeof SafeAreaView> & {
  /** Safe-area fill; `bg` = theme canvas, `surface` = header/card white. */
  canvas?: 'bg' | 'surface';
};

/**
 * Safe area wrapper that paints the theme behind the status bar / notch on iOS.
 * Defaults to `t.bg` so most screens match the app canvas.
 */
export function ThemedSafeAreaView({ style, edges, canvas = 'bg', ...rest }: Props) {
  const { t } = useTheme();
  const backgroundColor = canvas === 'surface' ? t.surface : t.bg;
  return (
    <SafeAreaView
      {...rest}
      edges={edges ?? ['top']}
      style={[{ flex: 1, backgroundColor }, style]}
    />
  );
}
