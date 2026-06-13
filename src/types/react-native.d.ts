// `delaysContentTouches` is a valid iOS ScrollView prop and is still wired on
// the native Fabric component (RCTScrollViewComponentView), but RN 0.81's
// hand-written TS types — the `types` export condition Expo resolves — dropped
// it from ScrollViewProps. We set `delaysContentTouches={false}` on the Home
// ScrollView to remove the ~150ms iOS delay before a tap reaches the action
// tiles, so re-declare the prop here via declaration merging.
import 'react-native';

declare module 'react-native' {
  interface ScrollViewPropsIOS {
    delaysContentTouches?: boolean | undefined;
  }
}
