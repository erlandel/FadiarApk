import { useEffect } from 'react';
import { Loader } from 'lucide-react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large' | number;
  color?: string;
}

export function LoadingSpinner({ size = 'small', color = colors.white }: LoadingSpinnerProps) {
  const dimension = size === 'small' ? 20 : size === 'large' ? 36 : size;
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1);
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[{ width: dimension, height: dimension }, style]}>
      <Loader size={dimension} strokeWidth={3} color={color} />
    </Animated.View>
  );
}
