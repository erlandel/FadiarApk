import { Pressable, Text, View } from 'react-native';
import { cn } from '@/utils/cn';

export const DETAIL_CONTROL_HEIGHT = 40;

type QuantityStepperProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  compact?: boolean;
  detail?: boolean;
  horizontal?: boolean;
  disabled?: boolean;
};

export function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  compact = false,
  detail = false,
  horizontal = false,
  disabled = false,
}: QuantityStepperProps) {
  return (
    <View
      className={cn(
        'flex-row items-center rounded-xl border bg-white',
        detail
          ? 'border-primary w-[108px] rounded-[10px]'
          : horizontal
            ? 'border-primary h-[40px] w-[104px] rounded-[10px]'
            : 'border-gray-200',
        disabled && 'opacity-50'
      )}
      style={detail ? { height: DETAIL_CONTROL_HEIGHT } : undefined}>
      <Pressable
        onPress={onDecrease}
        disabled={disabled}
        accessibilityLabel="Restar cantidad"
        hitSlop={detail || horizontal ? { top: 4, bottom: 4 } : undefined}
        className={
          detail || horizontal
            ? 'h-full flex-1 items-center justify-center'
            : compact
              ? 'px-2 py-1.5'
              : 'px-3 py-2'
        }>
        <Text
          className={cn('text-accent font-bold', detail || horizontal ? 'text-sm' : 'text-base')}>
          −
        </Text>
      </Pressable>
      <View
        className={cn(
          'border-r border-l border-gray-300',
          detail || horizontal
            ? 'h-[18px] flex-1 items-center justify-center'
            : compact
              ? 'w-8 py-1'
              : 'w-10 py-1'
        )}>
        <Text className="text-text text-center text-sm font-bold">{quantity}</Text>
      </View>
      <Pressable
        onPress={onIncrease}
        disabled={disabled}
        accessibilityLabel="Sumar cantidad"
        hitSlop={detail || horizontal ? { top: 4, bottom: 4 } : undefined}
        className={
          detail || horizontal
            ? 'h-full flex-1 items-center justify-center'
            : compact
              ? 'px-2 py-1.5'
              : 'px-3 py-2'
        }>
        <Text
          className={cn('text-accent font-bold', detail || horizontal ? 'text-sm' : 'text-base')}>
          +
        </Text>
      </Pressable>
    </View>
  );
}
