import { useEffect } from 'react';
import { Trash2 } from 'lucide-react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function FlashingTrash({
  active,
  size = 24,
  color,
}: {
  active: boolean;
  size?: number;
  color: string;
}) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Animate.css flash: visible at 0/50/100%, hidden at 25/75% (1 second).
    opacity.value = active
      ? withRepeat(
          withSequence(
            withTiming(0, { duration: 250, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
            withTiming(1, { duration: 250, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
          ),
          -1
        )
      : 1;
    return () => cancelAnimation(opacity);
  }, [active, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Trash2 size={size} color={color} />
    </Animated.View>
  );
}
