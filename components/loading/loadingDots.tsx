import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme/colors';

function Dot({ progress, threshold }: { progress: SharedValue<number>; threshold: number }) {
  const reducedMotion = useReducedMotion();
  const style = useAnimatedStyle(() => ({
    opacity: reducedMotion || progress.value >= threshold ? 1 : 0,
  }));

  return <Animated.Text style={[{ color: colors.accent, fontSize: 11.2 }, style]}>●</Animated.Text>;
}

export function LoadingDots({ text }: { text: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1);
    return () => cancelAnimation(progress);
  }, [progress]);

  return (
    <View
      accessible
      accessibilityLabel={text}
      accessibilityState={{ busy: true }}
      style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
      <Text style={{ color: colors.muted, fontSize: 20.8, fontWeight: '700' }}>{text}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', width: 39.2, marginLeft: 6 }}>
        <Dot progress={progress} threshold={0.33} />
        <Dot progress={progress} threshold={0.66} />
        <Dot progress={progress} threshold={0.8} />
      </View>
    </View>
  );
}
