import type { ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';

export interface ProfileInputProps {
  label: string;
  value: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  editable?: boolean;
  error?: string;
  trailingAction?: ReactNode;
  onChangeText: (value: string) => void;
}

export function ProfileInput({
  label,
  value,
  placeholder,
  secureTextEntry = false,
  editable = true,
  error,
  trailingAction,
  onChangeText,
}: ProfileInputProps) {
  return (
    <View className="w-full">
      <Text className="mb-2 text-gray-800">{label}</Text>

      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          editable={editable}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          className={`bg-surface focus:border-accent w-full rounded-xl border-2 border-transparent text-gray-700 ${
            !editable ? 'opacity-70' : ''
          }`}
          style={{
            paddingLeft: 16,
            paddingRight: trailingAction ? 48 : 16,
            paddingVertical: 12,
          }}
        />

        {trailingAction ? (
          <View className="absolute top-0 right-4 bottom-0 justify-center">{trailingAction}</View>
        ) : null}
      </View>

      {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
