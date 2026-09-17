import { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { cn } from '@/utils/cn';
import { colors } from '@/lib/theme/colors';
import { Icon } from '@/icons/lucideIcon';

export interface InputAuthProps extends TextInputProps {
  leadingIcon?: string;
  error?: boolean;
  errorMessage?: string;
}

export function InputAuth({
  leadingIcon,
  error = false,
  errorMessage,
  secureTextEntry,
  className,
  ...rest
}: InputAuthProps) {
  const [secure, setSecure] = useState(!!secureTextEntry);

  return (
    <View className="gap-1">
      <View
        className={cn(
          'h-14 flex-row items-center rounded-xl border bg-white px-4',
          error ? 'border-error' : 'border-gray-200',
        )}
      >
        {leadingIcon ? (
          <Icon name={leadingIcon} size={20} color={error ? colors.error : colors.muted} />
        ) : null}
        <TextInput
          className={cn('flex-1 px-3 text-base text-text', className)}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secure}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setSecure((v) => !v)} hitSlop={8}>
            <Icon
              name={secure ? 'EyeOff' : 'Eye'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
      {error && errorMessage ? (
        <Text className="text-xs text-error">{errorMessage}</Text>
      ) : null}
    </View>
  );
}