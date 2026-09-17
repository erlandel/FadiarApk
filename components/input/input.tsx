import { forwardRef } from 'react';
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { cn } from '@/utils/cn';
import { colors } from '@/lib/theme/colors';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerClassName, className, ...rest }, ref) => {
    return (
      <View className={cn('gap-2', containerClassName)}>
        {label ? <Text className="text-sm font-medium text-muted">{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor="#9CA3AF"
          className={cn(
            'h-12 rounded-2xl border bg-surface px-4 text-base text-text',
            error ? 'border-error' : 'border-transparent',
            className,
          )}
          {...rest}
        />
        {error ? <Text className="text-xs text-error">{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';

export { colors };