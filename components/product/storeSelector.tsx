import { memo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { cn } from '@/utils/cn';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';

export interface StoreSelectorOption {
  id: string;
  name: string;
}

export interface StoreSelectorProps {
  options: StoreSelectorOption[];
  selectedId: string;
  onChange: (id: string) => void;
  open?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

function StoreSelectorComponent({
  options,
  selectedId,
  onChange,
  open,
  onOpenChange,
}: StoreSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const selectedOption = options.find((option) => option.id === selectedId) ?? options[0];

  const toggleOpen = () => {
    const nextOpen = !isOpen;
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const close = () => {
    if (open === undefined) setInternalOpen(false);
    onOpenChange?.(false);
  };

  if (!selectedOption) return null;

  return (
    <View className="relative z-20 flex-1 ">
      <Pressable
        onPress={toggleOpen}
        className="h-12 flex-row  items-center justify-between rounded-xl bg-white/5  px-3 py-3 active:bg-white/15"
      >
        <View className="mr-2 flex-1 flex-row items-center gap-2.5">
          <View className="h-2 w-2 rounded-full bg-accent" />

          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Tienda Activa
            </Text>
            <Text numberOfLines={1} className="text-lg font-bold text-white">
              {selectedOption.name}
            </Text>
          </View>
        </View>

        <Icon
          name={isOpen ? 'ChevronUp' : 'ChevronDown'}
          size={20}
          color={colors.white}
        />
      </Pressable>

      {isOpen ? (
        <View className="absolute  left-0 right-0 top-15 overflow-hidden rounded-b-2xl bg-primary shadow-lg">
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} className="max-h-52">
            {options.map((option) => {
              const selected = option.id === selectedId;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    onChange(option.id);
                    close();
                  }}
                  className={cn(
                    'flex-row items-center gap-2.5 border-b border-white/10 px-4 py-3 last:border-b-0',
                    selected ? 'bg-white/10' : 'active:bg-white/5',
                  )}
                >
                  {selected ? <View className="h-2 w-2 rounded-full bg-accent" /> : <View className="h-2 w-2" />}
                  <Text className={cn('text-base', selected ? 'font-bold text-white' : 'text-white/80')}>
                    {option.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export const StoreSelector = memo(StoreSelectorComponent);