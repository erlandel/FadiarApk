import { Text, View } from 'react-native';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';
import { cn } from '@/utils/cn';

const STEPS = [
  { icon: 'ShoppingCart', label: 'Carrito' },
  { icon: 'CreditCard', label: 'Pago' },
  { icon: 'Check', label: 'Confirmación' },
];

export interface CheckoutStepperProps {
  currentStep: number;
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <View className="flex-row items-center justify-center">
      {STEPS.map((step, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;
        const isActive = isDone || isCurrent;

        return (
          <View key={step.icon} className="flex-row items-center">
            <View className="items-center">
              <View
                className={cn(
                  'h-10 w-10 items-center justify-center rounded-full border-2',
                  isDone
                    ? 'border-primary bg-primary'
                    : isCurrent
                      ? 'border-primary bg-white'
                      : 'border-gray-300 bg-white',
                )}
              >
                <Icon
                  name={isDone ? 'Check' : step.icon}
                  size={18}
                  color={isDone || isCurrent ? colors.primary : colors.muted}
                />
              </View>
              <Text
                className={cn(
                  'mt-1 text-xs',
                  isActive ? 'font-semibold text-primary' : 'text-muted',
                )}
              >
                {step.label}
              </Text>
            </View>

            {index < STEPS.length - 1 ? (
              <View
                className={cn(
                  'mx-2 mb-5 h-0.5 w-10',
                  index < currentStep ? 'bg-primary' : 'bg-gray-300',
                )}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}