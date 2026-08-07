import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/**
 * Height of the on-screen keyboard in dp (0 when hidden).
 *
 * Android needs this because the app runs edge-to-edge: `adjustResize` no
 * longer resizes the window when the IME opens, so nothing moves a bottom
 * sheet out from under the keyboard on its own — `KeyboardAvoidingView` has no
 * behavior to apply there either. Reading the height and lifting the sheet
 * ourselves works the same way on both platforms.
 *
 * Pass `active: false` while the owning sheet is closed — sheets inside a Modal
 * stay mounted, so a stale height would otherwise survive until the next open.
 *
 * Note the reported height differs per platform: Android excludes the
 * navigation-bar inset, iOS includes the home-indicator area. Both are the
 * distance from the bottom of the app's content area to the top of the
 * keyboard, which is exactly the offset a bottom-anchored sheet needs.
 */
export function useKeyboardHeight(active: boolean): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!active) {
      setHeight(0);
      return;
    }
    const show = Keyboard.addListener('keyboardDidShow', (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [active]);

  return height;
}
