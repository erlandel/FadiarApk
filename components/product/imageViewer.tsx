import { useMemo, useState } from 'react';
import { ToastRoot } from '@/messages/toastConfig';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { LoadingSpinner } from '@/components/loading/loadingSpinner';
import { Image } from 'expo-image';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buildImageUrl } from '@/lib/api/config';
import { colors } from '@/lib/theme/colors';
import { Icon } from '@/icons/lucideIcon';
import type { ViewerImage } from '@/utils/productGallery';

type ImageViewerProps = {
  images: ViewerImage[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;

export function ImageViewer({ images, initialIndex, visible, onClose }: ImageViewerProps) {
  if (!visible || !images.length) return null;
  return (
    <ViewerSession
      key={images.map((image) => image.image).join('|')}
      images={images}
      initialIndex={initialIndex}
      visible
      onClose={onClose}
    />
  );
}

function ViewerSession({ images, initialIndex, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialIndex, images.length - 1))
  );
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [scalePercent, setScalePercent] = useState(100);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const boxWidth = useSharedValue(0);
  const boxHeight = useSharedValue(0);
  const aspect = useSharedValue(1);

  const clampPosition = (x: number, y: number, zoomScale: number) => {
    'worklet';
    const width = Math.min(boxWidth.value, boxHeight.value * aspect.value);
    const height = width / aspect.value;
    const maxX = Math.max(0, (width * zoomScale - boxWidth.value) / 2);
    const maxY = Math.max(0, (height * zoomScale - boxHeight.value) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  };

  const resetZoom = () => {
    scale.value = 1;
    setScalePercent(100);
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedX.value = 0;
    savedY.value = 0;
  };

  const zoom = (delta: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value + delta));
    scale.value = next;
    setScalePercent(Math.round(next * 100));
    savedScale.value = next;
    const position = clampPosition(translateX.value, translateY.value, next);
    translateX.value = savedX.value = position.x;
    translateY.value = savedY.value = position.y;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * event.scale));
      const position = clampPosition(translateX.value, translateY.value, scale.value);
      translateX.value = position.x;
      translateY.value = position.y;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedX.value = translateX.value;
      savedY.value = translateY.value;
      runOnJS(setScalePercent)(Math.round(scale.value * 100));
      if (scale.value === 1) {
        translateX.value = 0;
        translateY.value = 0;
      }
    });
  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value <= 1) return;
      const position = clampPosition(
        savedX.value + event.translationX,
        savedY.value + event.translationY,
        scale.value
      );
      translateX.value = position.x;
      translateY.value = position.y;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });
  const gesture = Gesture.Simultaneous(pinch, pan);
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));
  const current = images[currentIndex];
  const imageSource = useMemo(() => (current ? buildImageUrl(current.image, 960) : ''), [current]);

  if (!current) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}
          edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between px-4 py-2">
            <View className="w-10" />
            <View className="flex-row items-center rounded-full bg-black/70 px-3 py-1">
              <Pressable
                onPress={() => zoom(-0.3)}
                disabled={scalePercent <= MIN_SCALE * 100}
                hitSlop={8}>
                <Icon
                  name="Minus"
                  size={20}
                  color={scalePercent <= MIN_SCALE * 100 ? colors.muted : colors.white}
                />
              </Pressable>
              <Text className="mx-3 min-w-12 text-center text-sm font-bold text-white">
                {scalePercent}%
              </Text>
              <Pressable
                onPress={() => zoom(0.3)}
                disabled={scalePercent >= MAX_SCALE * 100}
                hitSlop={8}>
                <Icon
                  name="Plus"
                  size={20}
                  color={scalePercent >= MAX_SCALE * 100 ? colors.muted : colors.white}
                />
              </Pressable>
            </View>
            <Pressable onPress={onClose} accessibilityLabel="Cerrar visor" hitSlop={8}>
              <Icon name="X" size={28} color={colors.white} strokeWidth={2.5} />
            </Pressable>
          </View>

          <GestureDetector gesture={gesture}>
            <View
              collapsable={false}
              style={{ flex: 1, overflow: 'hidden' }}
              onLayout={(event) => {
                boxWidth.value = event.nativeEvent.layout.width;
                boxHeight.value = event.nativeEvent.layout.height;
                resetZoom();
              }}>
              <Animated.View style={[{ width: '100%', height: '100%' }, imageStyle]}>
                <Image
                  key={`${imageSource}-${attempt}`}
                  source={{ uri: imageSource }}
                  placeholder={
                    current.previewImg ? { uri: buildImageUrl(current.previewImg, 240) } : undefined
                  }
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  transition={180}
                  style={{ width: '100%', height: '100%' }}
                  onLoad={(event) => {
                    if (event.source.width > 0 && event.source.height > 0)
                      aspect.value = event.source.width / event.source.height;
                    setLoadState('ready');
                  }}
                  onError={() => setLoadState('error')}
                />
              </Animated.View>
              {loadState === 'loading' ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <LoadingSpinner color={colors.white} />
                </View>
              ) : null}
              {loadState === 'error' ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{ color: colors.white }}>No se pudo cargar la imagen</Text>
                  <Pressable
                    accessibilityLabel="Reintentar imagen"
                    onPress={() => {
                      setLoadState('loading');
                      setAttempt((value) => value + 1);
                    }}
                    style={{ padding: 16 }}>
                    <Text style={{ color: colors.white }}>Reintentar</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </GestureDetector>

          {images.length > 1 ? (
            <FlatList
              style={{ height: 88, flexGrow: 0, flexShrink: 0 }}
              horizontal
              data={images}
              keyExtractor={(item, index) => `${item.image}-${index}`}
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 px-4 py-3"
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => {
                    if (index === currentIndex) return;
                    setLoadState('loading');
                    setCurrentIndex(index);
                    resetZoom();
                  }}
                  className={
                    index === currentIndex
                      ? 'border-accent h-16 w-16 rounded-lg border-2'
                      : 'h-16 w-16 rounded-lg border border-gray-500'
                  }>
                  <Image
                    source={{ uri: buildImageUrl(item.previewImg ?? item.image, 240) }}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                    style={{ width: '100%', height: '100%' }}
                  />
                </Pressable>
              )}
            />
          ) : null}
        </SafeAreaView>
      </GestureHandlerRootView>
      <ToastRoot />
    </Modal>
  );
}
