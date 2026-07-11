import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/**
 * Slide a bottom sheet up via a manual `translateY` transform that rests at 0.
 *
 * Replaces Reanimated's `entering={SlideInDown}` layout animation, which on
 * Android's new architecture leaves a bottom-anchored (`bottom: 0`) sheet
 * resting offset by the navigation-bar height — it floats up until a touch
 * forces a native relayout (a JS re-render doesn't). A transform animates from
 * `distance` px below its final spot up to 0, so the sheet always comes to rest
 * at the true bottom.
 *
 * `distance` should be at least the sheet's height so it starts off-screen
 * (pass the measured height when known, otherwise a value larger than the
 * sheet).
 */
export function useSheetSlideIn(distance: number) {
  const ty = useSharedValue(distance);
  useEffect(() => {
    ty.value = withTiming(0, { duration: 240 });
  }, [ty]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
}
