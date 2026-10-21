import { memo, useCallback, useState } from 'react';
import { AppState, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { Easing, ZoomOut, ZoomIn } from 'react-native-reanimated';

const POT_IMAGES = [
  require('../../assets/images/imagesPot/Ollas.webp'),
  require('../../assets/images/imagesPot/Calderos.webp'),
  require('../../assets/images/imagesPot/Estacion.webp'),
] as const;

const BANNER_BG = require('../../assets/images/Banner.webp');

const ROTATION_MS = 4000;
const ZOOM_OUT_MS = 1000;
const ZOOM_IN_MS = 2000;

const TABLET_BREAKPOINT = 768;
const ENTER_ANIMATION = ZoomIn.duration(ZOOM_IN_MS).easing(Easing.inOut(Easing.ease));
const EXIT_ANIMATION = ZoomOut.duration(ZOOM_OUT_MS).easing(Easing.inOut(Easing.ease));

function BannerPotComponent() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const [index, setIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let interval: ReturnType<typeof setInterval> | null = null;
      const stop = () => {
        if (interval !== null) clearInterval(interval);
        interval = null;
      };
      const updateActivity = () => {
        stop();
        if (AppState.currentState === 'active') {
          interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % POT_IMAGES.length);
          }, ROTATION_MS);
        }
      };

      updateActivity();
      const subscription = AppState.addEventListener('change', updateActivity);
      return () => {
        subscription.remove();
        stop();
      };
    }, [])
  );

  const bannerHeight = isTablet ? 'h-[320px]' : 'h-[400px]';
  const potSize = isTablet ? 'w-[260px] h-[260px]' : 'w-[240px] h-[240px]';

  return (
    <View className={`relative w-full overflow-visible ${bannerHeight}`}>
      {/* Fondo: Banner.webp */}
      <Image
        source={BANNER_BG}
        style={styles.background}
        contentFit="cover"
        contentPosition="center"
        pointerEvents="none"
      />

      {/* Contenido: móvil = columna (texto arriba, imagen abajo); tablet = fila */}
      <View
        className={`mt-8 flex-1 gap-5 px-4 ${
          isTablet
            ? 'flex-row items-center justify-between'
            : 'flex-col items-center justify-between'
        }`}>
        <View className={isTablet ? 'flex-1' : 'items-start'}>
          <Text className={`text-left font-bold ${isTablet ? 'text-4xl' : 'text-3xl'}`}>
            <Text className="text-accent">Diversidad de soluciones</Text>
            <Text className="text-white">{`\npara cada espacio de tu hogar`}</Text>
          </Text>
          <Text className={`mt-6 text-white/85 ${isTablet ? 'text-xl' : 'text-lg'}`}>
            Ponemos a tu alcance una amplia gama de electrodomésticos que combinan tecnología,
            funcionalidad y diseño para crear un hogar más eficiente para el día a día.
          </Text>
        </View>

        {/* Carrusel de ollas */}
        <View className={`relative overflow-visible ${potSize}`}>
          {POT_IMAGES.map((src, i) =>
            i === index ? (
              <Animated.View
                key={i}
                entering={ENTER_ANIMATION}
                exiting={EXIT_ANIMATION}
                style={StyleSheet.absoluteFill}
                pointerEvents="none">
                <Image source={src} style={styles.pot} contentFit="contain" />
              </Animated.View>
            ) : null
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  pot: {
    width: '130%',
    height: '130%',
    marginLeft: '-15%',
    marginTop: '-20%',
  },
});

export const BannerPot = memo(BannerPotComponent);
export default BannerPot;
