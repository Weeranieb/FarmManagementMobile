import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type TappableFeedback = 'scale' | 'opacity' | 'none';

type Props = Omit<PressableProps, 'style'> & {
  /** Static style object. Never a function — this component owns the pressed
   *  state, so callers don't (and shouldn't) branch on `pressed` themselves. */
  style?: StyleProp<ViewStyle>;
  /** 'scale' = opacity dip + subtle shrink (default); 'opacity' = dip only;
   *  'none' = no visual (still tappable). */
  feedback?: TappableFeedback;
  children?: React.ReactNode;
};

/**
 * Pressable with a consistent, reduce-motion-aware press response — the app's
 * one "onclick UI" for buttons, cards, rows, and icon taps. Feedback is driven
 * by a Reanimated shared value through `onPressIn/onPressOut` (opacity + a small
 * scale), so it runs on the UI thread and — crucially — never puts anything in a
 * `Pressable` style-function, which in this codebase can silently drop layout
 * props (see [[project_pressable_style_function_drops_layout]]). Layout stays a
 * plain static style object; only opacity/transform animate on top.
 *
 * Motion budget (MOTION_INTENSITY 3): press-in 90ms, release 140ms, scale 0.97,
 * opacity 0.9. Scale is disabled under Reduce Motion; the opacity cue stays.
 */
export function Tappable({
  style,
  feedback = 'scale',
  disabled,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);
  const useScale = feedback === 'scale' && !reduceMotion;

  const anim = useAnimatedStyle(() => {
    const p = pressed.value;
    return {
      opacity: feedback === 'none' ? 1 : 1 - 0.1 * p,
      transform: useScale ? [{ scale: 1 - 0.03 * p }] : [],
    };
  });

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e) => {
        pressed.value = withTiming(1, { duration: 90 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = withTiming(0, { duration: 140 });
        onPressOut?.(e);
      }}
      style={[style, disabled ? null : anim]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
