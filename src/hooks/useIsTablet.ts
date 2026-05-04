import { useWindowDimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;

export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= TABLET_BREAKPOINT;
}

export function useBreakpoint(): 'phone' | 'tablet' | 'desktop' {
  const { width } = useWindowDimensions();
  if (width >= 1280) return 'desktop';
  if (width >= TABLET_BREAKPOINT) return 'tablet';
  return 'phone';
}
