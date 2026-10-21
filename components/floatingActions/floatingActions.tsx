import { useEffect, useState } from 'react';
import { Animated, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUp, ShoppingCart } from 'lucide-react-native';
import { useCartStore } from '@/store/cartStore';
import { colors } from '@/lib/theme/colors';

interface FloatingActionsProps {
  showBackToTop?: boolean;
  onBackToTop?: () => void;
  showCart?: boolean;
  hidden?: boolean;
}

function FloatingButton({
  visible,
  label,
  onPress,
  children,
}: {
  visible: boolean;
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, visible]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      style={{
        opacity: progress,
        transform: [
          { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [64, 0] }) },
        ],
      }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={!visible}
        onPress={onPress}
        style={({ pressed }) => [styles.button, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function FloatingActions({
  showBackToTop = false,
  onBackToTop,
  showCart = true,
  hidden = false,
}: FloatingActionsProps) {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [keyboardVisible, setKeyboardVisible] = useState(Keyboard.isVisible());

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const visible = !hidden && !keyboardVisible;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          right: 12 + insets.right,
          bottom: 24 + (segments[0] === '(checkout)' ? insets.bottom : 0),
        },
      ]}>
      <FloatingButton
        visible={visible && showCart && totalItems > 0}
        label={`Abrir carrito, ${totalItems} productos`}
        onPress={() => router.push('/(checkout)/cart1')}>
        <ShoppingCart size={24} color={colors.white} />
        <View style={styles.badge}>
          <Text style={styles.count}>{totalItems > 99 ? '99+' : totalItems}</Text>
        </View>
      </FloatingButton>
      <FloatingButton
        visible={visible && showBackToTop && Boolean(onBackToTop)}
        label="Volver arriba"
        onPress={() => onBackToTop?.()}>
        <ArrowUp size={24} color={colors.white} />
      </FloatingButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', right: 12, bottom: 24, gap: 12 },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 3,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { color: colors.white, fontSize: 10, fontWeight: '700' },
});
