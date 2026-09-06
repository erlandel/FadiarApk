import { useEffect, useMemo, useState } from 'react';
import { Modal as RNModal, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useFiltersStore } from '@/store/filtersStore';
import { useInventory } from '@/hooks/products/useInventory';
import { normalizeText } from '@/utils/format';
import { toastInfo } from '@/messages/toast';
import { Icon } from '@/icons/lucideIcon';
import { CustomIcon } from '@/icons/customIcon';
import { colors } from '@/lib/theme/colors';

export interface SideDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const LINKS = [
  { href: '/(tabs)', label: 'Inicio', available: true },
  { href: '/(tabs)/products', label: 'Productos', available: true },
  { href: '/about', label: 'Sobre Nosotros', available: false },
  { href: '/faq', label: 'Preguntas Frecuentes', available: false },
  { href: '/warranty', label: 'Garantía', available: false },
  { href: '/shipping', label: 'Envíos', available: false },
  { href: '/contact', label: 'Contacto', available: false },
] as const;

export function SideDrawer({ isOpen, setIsOpen }: SideDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { data: inventoryData } = useInventory();
  const {
    selectedCategories,
    setSelectedCategories,
    setShouldScrollToProducts,
  } = useFiltersStore();
  const [isProductsSubmenuOpen, setIsProductsSubmenuOpen] = useState(false);
  const [submenuScroll, setSubmenuScroll] = useState({
    contentHeight: 0,
    offset: 0,
    viewportHeight: 0,
  });

  const normalize = (p: string) => (p.endsWith('/') ? p.slice(0, -1) : p);
  const checkActive = (href: string) => {
    const normalizedPath = normalize(pathname);
    const normalizedHref = normalize(href);

    if (normalizedHref === '/(tabs)') {
      return (
        (segments[0] === '(tabs)' && segments.length === 1) ||
        normalizedPath === '/' ||
        normalizedPath === '/index' ||
        normalizedPath === '/(tabs)' ||
        normalizedPath === '/(tabs)/index'
      );
    }

    if (normalizedHref === '/(tabs)/products') {
      return (
        normalizedPath === '/products' ||
        normalizedPath === '/(tabs)/products' ||
        normalizedPath.startsWith('/products/') ||
        normalizedPath.startsWith('/(tabs)/products/')
      );
    }

    return normalizedPath === normalizedHref;
  };

  const availableCategories = useMemo(() => {
    const map = new Map<string, string>();
    (inventoryData?.products ?? []).forEach((p: any) => {
      const name = p.categoria?.name;
      if (!name) return;
      const key = normalizeText(name);
      if (!map.has(key)) map.set(key, name);
    });
    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
  }, [inventoryData]);

  // Precarga rutas al montar el layout (no al abrir el drawer).
  useEffect(() => {
    LINKS.filter((link) => link.available).forEach((link) => {
      router.prefetch(link.href as any);
    });
  }, [router]);

  const handleCategoryClick = (label: string) => {
    const isAlreadySelected = selectedCategories.includes(label);
    setSelectedCategories(isAlreadySelected ? [] : [label]);
    setShouldScrollToProducts(true);
    setIsOpen(false);
    setIsProductsSubmenuOpen(false);

    if (!checkActive('/(tabs)/products')) {
      router.push('/(tabs)/products');
    }
  };

  const handleLinkPress = (link: (typeof LINKS)[number]) => {
    if (!link.available) {
      toastInfo('Próximamente');
      return;
    }
    if (link.label === 'Productos') {
      setIsProductsSubmenuOpen((v) => !v);
      return;
    }
    if (link.label === 'Inicio') {
      setSelectedCategories([]);
      setShouldScrollToProducts(false);
    }
    setIsOpen(false);
    router.push(link.href as any);
  };

  const handleClose = () => {
    setIsProductsSubmenuOpen(false);
    setIsOpen(false);
  };

  // Modal nativo: necesario para pintar por encima de Tabs (react-native-screens).
  // animationType="none" evita el delay de slide/fade.
  if (!isOpen) return null;

  return (
    <RNModal
      visible
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        {/* Overlay: tocar fuera cierra el drawer */}
        <Pressable className="absolute inset-0 bg-black/50" onPress={handleClose} />

        {/* top-0 sin statusBarTranslucent: queda bajo la status bar, alineado con la app */}
        <View className="absolute left-0 top-0 h-120 w-72 rounded-tr-2xl rounded-br-2xl bg-white p-2 shadow-lg">
          <View className="p-6">
            <View className="mb-8 flex-row items-center justify-between">
              <Pressable onPress={() => handleLinkPress(LINKS[0])}>
                <Image
                  source={require('../../assets/images/logo.svg')}
                  style={{ width: 120, height: 40 }}
                  contentFit="contain"
                />
              </Pressable>
              <Pressable onPress={handleClose} hitSlop={8}>
                <CustomIcon name="MaterialSymbolsClose" width={24} height={24} color={colors.black} />
              </Pressable>
            </View>

            <View className="mb-6 border-t border-gray-200" />

            <View className="flex-col gap-5">
              {LINKS.map((link) => {
                const isProducts = link.label === 'Productos';
                const active =
                  checkActive(link.href) ||
                  (isProducts && selectedCategories.length > 0 && !isProductsSubmenuOpen);
                return (
                  <View key={link.label} className="relative flex-col font-bold">
                    <View className="flex-row items-center justify-between">
                      {isProducts ? (
                        <Pressable
                          onPress={() => handleLinkPress(link)}
                          className="flex-row flex-1 items-center"
                          accessibilityRole="button"
                        >
                          <Text
                            className={
                              active
                                ? 'text-lg font-extrabold text-accent'
                                : 'text-lg font-bold text-gray-600'
                            }
                          >
                            {link.label}
                          </Text>
                          <Icon
                            name={isProductsSubmenuOpen ? 'ChevronUp' : 'ChevronDown'}
                            size={20}
                            strokeWidth={3}
                            color={active ? colors.accent : '#4B5563'}
                          />
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => handleLinkPress(link)}
                          className="flex-row items-center"
                        >
                          <Text
                            className={
                              active
                                ? 'text-lg font-extrabold text-accent'
                                : 'text-lg font-bold text-gray-600'
                            }
                          >
                            {link.label}
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    {isProducts && isProductsSubmenuOpen && (
                      <View className="absolute left-0 top-full z-50 mt-2 w-70 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg">
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator
                          contentContainerStyle={{ minWidth: '100%' }}
                        >
                          <ScrollView
                            showsVerticalScrollIndicator={false}
                            className="max-h-120"
                            nestedScrollEnabled
                            scrollEventThrottle={16}
                            onContentSizeChange={(_, contentHeight) =>
                              setSubmenuScroll((current) => ({
                                ...current,
                                contentHeight,
                              }))
                            }
                            onLayout={({ nativeEvent }) =>
                              setSubmenuScroll((current) => ({
                                ...current,
                                viewportHeight: nativeEvent.layout.height,
                              }))
                            }
                            onScroll={({ nativeEvent }) =>
                              setSubmenuScroll((current) => ({
                                ...current,
                                offset: nativeEvent.contentOffset.y,
                              }))
                            }
                          >
                            <Pressable
                              onPress={() => {
                                setSelectedCategories([]);
                                setIsOpen(false);
                                setIsProductsSubmenuOpen(false);
                                if (!checkActive('/(tabs)/products')) {
                                  router.push('/(tabs)/products');
                                } else {
                                  setShouldScrollToProducts(true);
                                }
                              }}
                              className="flex-row items-center gap-2 py-2"
                            >
                              <View
                                className={`h-4 w-4 rounded-full border-2 border-dashed bg-transparent ${
                                  selectedCategories.length === 0
                                    ? 'border-accent'
                                    : 'border-gray-300'
                                }`}
                              />
                              <Text
                                className={
                                  selectedCategories.length === 0
                                    ? 'font-extrabold text-accent'
                                    : 'font-bold text-gray-600'
                                }
                              >
                                Ver todos los productos
                              </Text>
                            </Pressable>

                            {availableCategories.map((cat) => {
                              const isSelected = selectedCategories.includes(cat.label);
                              return (
                                <Pressable
                                  key={cat.key}
                                  onPress={() => handleCategoryClick(cat.label)}
                                  className="flex-row items-center gap-2 py-2 "
                                >
                                  <View
                                    className={`h-4 w-4 rounded-full border-2 border-dashed ${
                                      isSelected
                                        ? 'border-accent'
                                        : 'border-gray-300 bg-transparent'
                                    }`}
                                  />
                                  <Text
                                    className={
                                      isSelected
                                        ? 'text-sm font-extrabold text-accent'
                                        : 'text-sm font-bold text-gray-600'
                                    }
                                  >
                                    {cat.label}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </ScrollView>
                        </ScrollView>
                        {submenuScroll.contentHeight > submenuScroll.viewportHeight && (
                          <View className="absolute right-1 top-3 bottom-3 w-1 rounded-full bg-gray-200">
                            <View
                              className="absolute left-0 w-1 rounded-full bg-primary"
                              style={{
                                height: Math.max(
                                  24,
                                  (submenuScroll.viewportHeight / submenuScroll.contentHeight) *
                                    submenuScroll.viewportHeight,
                                ),
                                transform: [
                                  {
                                    translateY:
                                      (submenuScroll.offset /
                                        (submenuScroll.contentHeight -
                                          submenuScroll.viewportHeight)) *
                                      (submenuScroll.viewportHeight -
                                        Math.max(
                                          24,
                                          (submenuScroll.viewportHeight /
                                            submenuScroll.contentHeight) *
                                            submenuScroll.viewportHeight,
                                        )),
                                  },
                                ],
                              }}
                            />
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            {isProductsSubmenuOpen && (
              <Pressable
                className="absolute inset-0 z-40"
                onPress={() => setIsProductsSubmenuOpen(false)}
                accessibilityLabel="Cerrar submenú"
              />
            )}
          </View>
        </View>
      </View>
    </RNModal>
  );
}
