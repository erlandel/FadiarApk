import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import { colors } from '@/lib/theme/colors';
import { DETAIL_CONTROL_HEIGHT } from './quantityStepper';

function Placeholder({ className }: { className: string }) {
  return <View className={`rounded bg-gray-200 ${className}`} />;
}

export function ProductDetailSkeleton() {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View accessibilityLabel="Cargando detalles del producto" accessibilityState={{ busy: true }}>
      <Animated.View
        style={{ opacity }}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <Placeholder className="mx-4 mt-2 h-80 rounded-2xl" />
        <View className="px-4 py-5">
          <Placeholder className="mb-3 h-4 w-28" />
          <Placeholder className="h-10 w-full" />
          <Placeholder className="mt-2 h-10 w-3/4" />
          <Placeholder className="mt-2 h-8 w-36" />
          <View className="mt-3 gap-2">
            <Placeholder className="h-4 w-full" />
            <Placeholder className="h-4 w-4/5" />
          </View>
          <Placeholder className="mt-2 h-5 w-44" />
          <Placeholder className="mt-3 h-9 w-48" />
          <View
            className="mt-4 flex-row items-center justify-between"
            style={{ height: DETAIL_CONTROL_HEIGHT }}>
            <Placeholder className="h-full w-[108px] rounded-[10px]" />
            <Placeholder className="h-full w-[72px] rounded-[10px]" />
          </View>
          <View
            className="mt-8 rounded-xl border p-5"
            style={{ backgroundColor: colors.surface, borderColor: colors.gray }}>
            <Placeholder className="mb-3 h-5 w-28" />
            {[0, 1, 2].map((row) => (
              <View
                key={row}
                className="flex-row justify-between border-b py-2"
                style={{ borderColor: colors.gray }}>
                <Placeholder className="h-4 w-2/5" />
                <Placeholder className="h-4 w-2/5" />
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
