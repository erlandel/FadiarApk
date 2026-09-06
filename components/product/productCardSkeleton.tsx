import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

function ShimmerBlock({ className }: { className: string }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    animation.start();

    return () => animation.stop();
  }, [progress]);

  return (
    <View className={`${className} overflow-hidden bg-gray-200`}>
      <Animated.View
        className="absolute inset-y-0 w-1/2 bg-white/35"
        style={{
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-120, 240],
              }),
            },
          ],
        }}
      />
    </View>
  );
}

export function ProductCardSkeleton() {
  return (
    <View className="h-120 w-full max-w-55 flex-col justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      {/* Imagen: misma altura exacta que ProductCard (h-47.5) */}
      <ShimmerBlock className="h-47.5 w-full shrink-0 rounded-2xl" />

      {/* Categoría + título: mismo contenedor flex-1 con gap-2 que ProductCard */}
      <View className="min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <ShimmerBlock className="h-3 w-16 rounded" />
        <ShimmerBlock className="h-4 w-full rounded" />
        <ShimmerBlock className="h-4 w-3/4 rounded" />
      </View>

      {/* Marca + garantía + precio + acciones: mismo contenedor gap-3 que ProductCard */}
      <View className="flex-col gap-3">
        <ShimmerBlock className="h-4 w-24 rounded" />
        <ShimmerBlock className="h-4 w-28 rounded" />
        <ShimmerBlock className="h-6 w-32 rounded" />

        <View className="flex-row items-center justify-between gap-3">
          <ShimmerBlock className="h-9 w-24 rounded-xl" />
          <ShimmerBlock className="h-9 w-12 rounded-xl" />
        </View>
      </View>
    </View>
  );
}