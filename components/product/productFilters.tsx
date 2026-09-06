import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/primitives/button';
import { useFiltersStore } from '@/store/filtersStore';
import { normalizeText } from '@/utils/format';
import { Pressable, Text, View } from 'react-native';

interface ProductFiltersProps {
  categories: Array<{ key: string; label: string }>;
  visible: boolean;
  onClose: () => void;
}

export function ProductFilters({ categories, visible, onClose }: ProductFiltersProps) {
  const { selectedCategories, toggleCategory } = useFiltersStore();

  return (
    <Modal visible={visible} onClose={onClose} title="Filtros">
      <Text className="mb-2 font-semibold text-primary">Categorías:</Text>
      <View className="flex-row flex-wrap gap-2">
        {categories.map((category) => {
          const selected = selectedCategories.some(
            (value) => normalizeText(value) === normalizeText(category.label),
          );
          return (
            <Pressable
              key={category.key}
              onPress={() => toggleCategory(category.label)}
              className={
                selected
                  ? 'rounded-full border border-primary bg-primary px-3 py-1.5'
                  : 'rounded-full border border-gray-200 bg-white px-3 py-1.5'
              }
            >
              <Text className={selected ? 'text-sm text-white' : 'text-sm text-text'}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="mt-6">
        <Button title="Aplicar" onPress={onClose} />
      </View>
    </Modal>
  );
}
