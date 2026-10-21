import React, { useCallback, useEffect, useMemo } from 'react';
import { AppState, StyleSheet, useWindowDimensions, View, type AppStateStatus } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withDecay,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ProductCard } from './productCard';
import type { Product } from '@/types/product';

export const getProductCardWidth = (width: number, position: 'vertical' | 'horizontal') =>
  position === 'horizontal' ? Math.min(460, width - 32) : 228;
const GAP = 8;
const RESUME_DELAY = 10000; // ms antes de reanudar autoplay tras interactuar
const DECAY_DECELERATION = 0.998;

interface ProductCarouselProps {
  position?: 'vertical' | 'horizontal';
  products: Product[];
  speed?: number; // px por segundo
  gap?: number;
  direction?: 'left' | 'right';
}

export function ProductCarousel({
  products,
  speed = 20,
  gap = GAP,
  direction = 'left',
  position = 'vertical',
}: ProductCarouselProps) {
  const { width } = useWindowDimensions();
  const itemWidth = getProductCardWidth(width, position);
  const itemFullWidth = itemWidth + gap;
  const setWidth = products.length * itemFullWidth;

  // Dos copias idénticas: el loop es solo (offset % setWidth), sin scrollTo.
  const loopedProducts = useMemo(
    () => (products.length > 0 ? [...products, ...products] : []),
    [products]
  );

  const offset = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const paused = useSharedValue(0);
  const setWidthSv = useSharedValue(setWidth);
  const speedSv = useSharedValue(speed);
  const dirSv = useSharedValue(direction === 'left' ? 1 : -1);

  useEffect(() => {
    setWidthSv.set(setWidth);
    speedSv.set(speed);
    dirSv.set(direction === 'left' ? 1 : -1);
  }, [setWidth, speed, direction, setWidthSv, speedSv, dirSv]);

  useEffect(() => {
    return () => {
      cancelAnimation(offset);
      cancelAnimation(paused);
    };
  }, [offset, paused]);

  // Auto-scroll en UI thread: ownership total del offset, sin física nativa.
  // Solo activo con la pantalla enfocada y la aplicación en primer plano.
  const frameCallback = useFrameCallback((frame) => {
    'worklet';
    if (paused.get() || setWidthSv.get() <= 0) return;

    const dtMs = frame.timeSincePreviousFrame;
    if (dtMs == null) return;

    const dt = Math.min(dtMs, 64) / 1000;
    const nextOffset = offset.get() + speedSv.get() * dirSv.get() * dt;

    const w = setWidthSv.get();
    // Evita drift de precisión en floats tras mucho tiempo.
    offset.set(nextOffset >= w * 8 || nextOffset < 0 ? ((nextOffset % w) + w) % w : nextOffset);
  }, false);

  useFocusEffect(
    useCallback(() => {
      const stop = () => {
        frameCallback.setActive(false);
        cancelAnimation(offset);
        cancelAnimation(paused);
        paused.set(0);
      };
      const updateActivity = (state: AppStateStatus) => {
        if (state === 'active') frameCallback.setActive(true);
        else stop();
      };

      updateActivity(AppState.currentState);
      const subscription = AppState.addEventListener('change', updateActivity);
      return () => {
        subscription.remove();
        stop();
      };
    }, [frameCallback, offset, paused])
  );

  const animatedStyle = useAnimatedStyle(() => {
    const w = setWidthSv.get();
    if (w <= 0) return { transform: [{ translateX: 0 }] };

    const x = ((offset.get() % w) + w) % w;
    return { transform: [{ translateX: -x }] };
  });

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        // Permite taps en ProductCard y scroll vertical del padre.
        .activeOffsetX([-8, 8])
        .failOffsetY([-12, 12])
        .onBegin(() => {
          'worklet';
          cancelAnimation(offset);
          cancelAnimation(paused);
          paused.set(1);
          dragStart.set(offset.get());
        })
        .onUpdate((e) => {
          'worklet';
          // Dedo a la derecha → contenido a la derecha → offset baja.
          offset.set(dragStart.get() - e.translationX);
        })
        .onEnd((e) => {
          'worklet';
          offset.set(
            withDecay(
              {
                velocity: -e.velocityX,
                deceleration: DECAY_DECELERATION,
              },
              (finished) => {
                'worklet';
                if (finished) {
                  paused.set(
                    withDelay(RESUME_DELAY, withTiming(0, { duration: 0 }), ReduceMotion.Never)
                  );
                }
              }
            )
          );
        })
        .onFinalize((_, success) => {
          'worklet';
          // Gesto cancelado (p. ej. falló por scroll vertical): reanudar igual.
          if (!success) {
            paused.set(withDelay(RESUME_DELAY, withTiming(0, { duration: 0 }), ReduceMotion.Never));
          }
        }),
    [offset, paused, dragStart]
  );

  if (!products || products.length === 0 || setWidth === 0) return null;

  return (
    <View className="overflow-hidden py-3 pl-4">
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.row, animatedStyle]}>
          {loopedProducts.map((product, index) => (
            <View
              key={`${product.id}-${index}`}
              className="shrink-0"
              style={{ width: itemWidth, marginRight: gap }}>
              <ProductCard
                position={position}
                productId={product.id}
                title={product.name}
                brand={product.brand}
                category={product.categoria?.name}
                warranty={product.warranty}
                price={product.price}
                temporalPrice={product.temporal_price}
                image={product.img}
                count={product.count}
                currency={product.currency?.currency}
                tiendaId={product.tiendaId}
                isPreSale={product.isPreSale}
              />
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
