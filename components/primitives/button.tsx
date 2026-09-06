import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  Text,
} from 'react-native';
import { cn } from '@/utils/cn';
import { colors } from '@/lib/theme/colors';

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

const variantClasses: Record<string, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary active:bg-primary-hover',
    text: 'text-white',
  },
  outline: {
    container: 'border border-primary bg-white',
    text: 'text-primary',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-primary',
  },
};

export const Button = forwardRef<unknown, ButtonProps>(
  (
    { title, variant = 'primary', loading = false, disabled = false, className, textClassName, ...rest },
    ref,
  ) => {
    const styles = variantClasses[variant];
    const isDisabled = disabled || loading;

    return (
      <Pressable
        ref={ref as any}
        disabled={isDisabled}
        className={cn(
          'h-14 w-full items-center justify-center rounded-xl',
          styles.container,
          isDisabled && 'opacity-40',
          className,
        )}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text className={cn('text-base font-semibold', styles.text, textClassName)}>
            {title}
          </Text>
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';