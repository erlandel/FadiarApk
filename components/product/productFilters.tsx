import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/primitives/button';
import { useFiltersStore } from '@/store/filtersStore';
import { normalizeText } from '@/utils/format';
import { Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useState } from 'react';

interface ProductFiltersProps {
  categories: { key: string; label: string }[];
  brands?: string[];
  maxPrice?: number;
  visible: boolean;
  onClose: () => void;
}

export function ProductFilters({
  categories,
  brands = [],
  maxPrice = 0,
  visible,
  onClose,
}: ProductFiltersProps) {
  const selectedCategories = useFiltersStore((state) => state.selectedCategories);
  const selectedBrands = useFiltersStore((state) => state.selectedBrands);
  const selectedPrice = useFiltersStore((state) => state.selectedPrice);
  const toggleCategory = useFiltersStore((state) => state.toggleCategory);
  const setSelectedBrands = useFiltersStore((state) => state.setSelectedBrands);
  const setSelectedPrice = useFiltersStore((state) => state.setSelectedPrice);
  const clearFilters = useFiltersStore((state) => state.clearFilters);
  const [minText, setMinText] = useState(String(selectedPrice?.[0] ?? 0));
  const [maxText, setMaxText] = useState(String(selectedPrice?.[1] ?? maxPrice));
  const { height } = useWindowDimensions();

  return (
    <Modal visible={visible} onClose={onClose} title="Filtros">
      <ScrollView
        style={{ maxHeight: height * 0.72, flexGrow: 0, flexShrink: 1 }}
        contentContainerClassName="pb-4 pr-3"
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled">
        <Text className="text-primary mb-2 font-semibold">Categorías:</Text>
        <View className="flex-row flex-wrap gap-2">
          {categories.map((category) => {
            const selected = selectedCategories.some(
              (value) => normalizeText(value) === normalizeText(category.label)
            );
            return (
              <Pressable
                key={category.key}
                onPress={() => toggleCategory(category.label)}
                className={
                  selected
                    ? 'border-primary bg-primary rounded-full border px-3 py-1.5'
                    : 'rounded-full border border-gray-200 bg-white px-3 py-1.5'
                }>
                <Text className={selected ? 'text-sm text-white' : 'text-text text-sm'}>
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {brands.length > 0 ? (
          <>
            <Text className="text-primary mt-5 mb-2 font-semibold">Marcas:</Text>
            <View className="flex-row flex-wrap gap-2">
              {brands.map((brand) => {
                const selected = selectedBrands.includes(brand);
                return (
                  <Pressable
                    key={brand}
                    onPress={() =>
                      setSelectedBrands(
                        selected
                          ? selectedBrands.filter((item) => item !== brand)
                          : [...selectedBrands, brand]
                      )
                    }
                    className={
                      selected
                        ? 'border-primary bg-primary rounded-full border px-3 py-1.5'
                        : 'rounded-full border border-gray-200 bg-white px-3 py-1.5'
                    }>
                    <Text className={selected ? 'text-sm text-white' : 'text-text text-sm'}>
                      {brand}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
        {maxPrice > 0 ? (
          <>
            <Text className="text-primary mt-5 mb-2 font-semibold">Precio:</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={minText}
                onChangeText={setMinText}
                keyboardType="decimal-pad"
                placeholder="Mínimo"
                className="text-text flex-1 rounded-lg border border-gray-200 p-3"
              />
              <TextInput
                value={maxText}
                onChangeText={setMaxText}
                keyboardType="decimal-pad"
                placeholder="Máximo"
                className="text-text flex-1 rounded-lg border border-gray-200 p-3"
              />
            </View>
          </>
        ) : null}
      </ScrollView>
      <View className="mt-2 shrink-0 border-t border-gray-100 pt-3">
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              title="Limpiar"
              variant="outline"
              onPress={() => {
                clearFilters();
                setMinText('0');
                setMaxText(String(maxPrice));
              }}
            />
          </View>
          <View className="flex-1">
            <Button
              title="Aplicar"
              onPress={() => {
                if (maxPrice > 0) {
                  const min = Math.max(0, Number(minText) || 0);
                  const max = Math.min(maxPrice, Number(maxText) || maxPrice);
                  setSelectedPrice(min > 0 || max < maxPrice ? [min, Math.max(min, max)] : null);
                }
                onClose();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
