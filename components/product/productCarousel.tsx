import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ProductCard } from './productCard';
import type { Product } from '@/types/product';

const ITEM_WIDTH = 220; // px, equivalente a w-55 (55 * 4 = 220px)
const GAP = 8;
const RESUME_DELAY = 10000; // ms antes de reanudar autoplay tras interactuar
const DECAY_DECELERATION = 0.998;

interface ProductCarouselProps {
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
}: ProductCarouselProps) {
  const itemFullWidth = ITEM_WIDTH + gap;
  const setWidth = products.length * itemFullWidth;

  // Dos copias idénticas: el loop es solo (offset % setWidth), sin scrollTo.
  const loopedProducts = useMemo(
    () => (products.length > 0 ? [...products, ...products] : []),
    [products]
  );

  const offset = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const paused = useSharedValue(false);
  const setWidthSv = useSharedValue(setWidth);
  const speedSv = useSharedValue(speed);
  const dirSv = useSharedValue(direction === 'left' ? 1 : -1);

  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current !== null) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const scheduleResume = useCallback(() => {
    clearResumeTimeout();
    resumeTimeoutRef.current = setTimeout(() => {
      paused.value = false;
      resumeTimeoutRef.current = null;
    }, RESUME_DELAY);
  }, [clearResumeTimeout, paused]);

  useEffect(() => {
    setWidthSv.value = setWidth;
    speedSv.value = speed;
    dirSv.value = direction === 'left' ? 1 : -1;
  }, [setWidth, speed, direction, setWidthSv, speedSv, dirSv]);

  useEffect(() => {
    return () => {
      clearResumeTimeout();
      cancelAnimation(offset);
    };
  }, [clearResumeTimeout, offset]);

  // Auto-scroll en UI thread: ownership total del offset, sin física nativa.
  // Solo activo con la pantalla enfocada para no saturar el hilo al cambiar de ruta.
  const frameCallback = useFrameCallback((frame) => {
    'worklet';
    if (paused.value || setWidthSv.value <= 0) return;

    const dtMs = frame.timeSincePreviousFrame;
    if (dtMs == null) return;

    const dt = Math.min(dtMs, 64) / 1000;
    offset.value += speedSv.value * dirSv.value * dt;

    const w = setWidthSv.value;
    // Evita drift de precisión en floats tras mucho tiempo.
    if (offset.value >= w * 8 || offset.value < 0) {
      offset.value = ((offset.value % w) + w) % w;
    }
  }, false);

  useFocusEffect(
    useCallback(() => {
      frameCallback.setActive(true);
      return () => {
        frameCallback.setActive(false);
        cancelAnimation(offset);
        paused.value = false;
        clearResumeTimeout();
      };
    }, [frameCallback, offset, paused, clearResumeTimeout]),
  );

  const animatedStyle = useAnimatedStyle(() => {
    const w = setWidthSv.value;
    if (w <= 0) return { transform: [{ translateX: 0 }] };

    const x = ((offset.value % w) + w) % w;
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
          paused.value = true;
          dragStart.value = offset.value;
          runOnJS(clearResumeTimeout)();
        })
        .onUpdate((e) => {
          'worklet';
          // Dedo a la derecha → contenido a la derecha → offset baja.
          offset.value = dragStart.value - e.translationX;
        })
        .onEnd((e) => {
          'worklet';
          offset.value = withDecay(
            {
              velocity: -e.velocityX,
              deceleration: DECAY_DECELERATION,
            },
            () => {
              'worklet';
              runOnJS(scheduleResume)();
            }
          );
        })
        .onFinalize((_, success) => {
          'worklet';
          // Gesto cancelado (p. ej. falló por scroll vertical): reanudar igual.
          if (!success) {
            runOnJS(scheduleResume)();
          }
        }),
    [clearResumeTimeout, scheduleResume, offset, paused, dragStart]
  );

  if (!products || products.length === 0 || setWidth === 0) return null;

  return (
    <View className="overflow-hidden py-3 pl-4">
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.row, animatedStyle]}>
          {loopedProducts.map((product, index) => (
            <View
              key={`${product.id}-${index}`}
              className="w-57 shrink-0"
              style={{ marginRight: gap }}
            >
              <ProductCard
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
