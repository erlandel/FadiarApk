import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from 'react-native';
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

export function BannerPot() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % POT_IMAGES.length);
    }, ROTATION_MS);

    return () => clearInterval(id);
  }, []);

  const bannerHeight = isTablet ? 'h-[320px]' : 'h-[400px]';
  const potSize = isTablet ? 'w-[260px] h-[260px]' : 'w-[240px] h-[240px]';

  return (
    <View className={`relative w-full overflow-visible ${bannerHeight}`}>
      {/* Fondo: Banner.webp */}
      <Image
        source={BANNER_BG}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
        contentFit="cover"
        contentPosition="center"
        pointerEvents="none"
      />

      {/* Contenido: móvil = columna (texto arriba, imagen abajo); tablet = fila */}
      <View
        className={`flex-1 gap-5 px-4 mt-8 ${
          isTablet
            ? 'flex-row items-center justify-between'
            : 'flex-col items-center justify-between'
        }`}
      >
        <View className={isTablet ? ' flex-1' : 'items-center'}>
       <Text
  className={`font-bold ${
    isTablet ? 'text-left text-4xl' : ' text-3xl'
  }`}
>
  <Text className="text-accent">Diversidad de soluciones</Text>
  <Text className="text-white">{`\npara cada espacio de tu hogar`}</Text>
</Text>
          <Text
            className={`mt-6 text-white/85 ${
              isTablet ? 'text-xl' : ' text-lg'
            }`}
          >
            Ponemos a tu alcance una amplia gama de electrodomésticos que
            combinan tecnología, funcionalidad y diseño para crear un hogar
            más eficiente para el día a día.
          </Text>
        </View>

        {/* Carrusel de ollas */}
        <View className={`relative overflow-visible ${potSize}`}>
          {POT_IMAGES.map((src, i) =>
            i === index ? (
              <Animated.View
                key={i}
                entering={ZoomIn.duration(ZOOM_IN_MS).easing(
                  Easing.inOut(Easing.ease),
                )}
                exiting={ZoomOut.duration(ZOOM_OUT_MS).easing(
                  Easing.inOut(Easing.ease),
                )}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              >
                <Image
                  source={src}
                  style={{
                    width: '130%',
                    height: '130%',
                    marginLeft: '-15%',
                    marginTop: '-20%',
                  }}
                  contentFit="contain"
                />
              </Animated.View>
            ) : null,
          )}
        </View>
      </View>
    </View>
  );
}

export default BannerPot;