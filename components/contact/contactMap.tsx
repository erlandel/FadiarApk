import { useMemo } from 'react';
import { View, Pressable, Text, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

const LAT = 23.08525;
const LNG = -82.434639;

function buildMapHtml(lat: number, lng: number) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
    <link href="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css" rel="stylesheet" />
    <script src="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js"></script>
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [${lng}, ${lat}],
        zoom: 15,
        attributionControl: true,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      new maplibregl.Marker({ color: '#022954' })
        .setLngLat([${lng}, ${lat}])
        .addTo(map);

      // El WebView a veces termina el layout DESPUÉS de que el mapa
      // ya calculó su tamaño (0x0), dejándolo en blanco. Forzamos resize.
      map.on('load', () => map.resize());
      window.addEventListener('resize', () => map.resize());
      setTimeout(() => map.resize(), 300);
    </script>
  </body>
</html>`;
}

export function ContactMap() {
  const mapHtml = useMemo(() => buildMapHtml(LAT, LNG), []);

  const openInGoogleMaps = async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`;
    await Linking.openURL(url);
  };

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml, baseUrl: 'https://tiles.openfreemap.org' }}
        style={{ width: '100%', height: 420, backgroundColor: '#ffffff' }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
        mixedContentMode="always"
      />

      <Pressable
        onPress={openInGoogleMaps}
        style={{
          backgroundColor: '#022954',
          paddingVertical: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>
          Ver en Google Maps
        </Text>
      </Pressable>
    </View>
  );
}