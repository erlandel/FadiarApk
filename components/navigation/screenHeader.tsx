import { Text, View } from 'react-native';
import { Breadcrumbs, type Crumb } from './breadcrumbs';
import { CheckoutStepper } from '../checkout/checkoutStepper';

export interface ScreenHeaderProps {
  title: string;
  crumbs?: Crumb[];
  stepper?: number;
  subtitle?: string;
}

export function ScreenHeader({ title, crumbs, stepper, subtitle }: ScreenHeaderProps) {
  return (
    <View className="px-4 pt-4">
      {crumbs ? <Breadcrumbs items={crumbs} /> : null}
      <Text className="mt-2 text-3xl font-bold text-primary">{title}</Text>
      {subtitle ? <Text className="mt-1 text-base font-semibold text-muted">{subtitle}</Text> : null}
      {stepper !== undefined ? (
        <View className="mt-4">
          <CheckoutStepper currentStep={stepper} />
        </View>
      ) : null}
    </View>
  );
}

export default ScreenHeader;