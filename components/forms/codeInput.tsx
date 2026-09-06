import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { cn } from '@/utils/cn';
import { colors } from '@/lib/theme/colors';

export interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (code: string) => void;
}

export function CodeInput({ length = 6, value, onChange }: CodeInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const handleChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, length);
    onChange(clean);
    setFocusedIndex(Math.min(clean.length, length - 1));
  };

  return (
    <View className="flex-row justify-center gap-2">
      {digits.map((digit, index) => {
        const isFocused = index === focusedIndex;
        return (
          <Pressable
            key={index}
            onPress={() => {
              inputRef.current?.focus();
              setFocusedIndex(index);
            }}
            className={cn(
              'h-16 w-12 items-center justify-center rounded-xl border-2 bg-white',
              isFocused ? 'border-primary' : 'border-gray-300',
              digit !== '' && 'border-primary bg-surface',
            )}
          >
            <Text className="text-2xl font-bold text-primary">{digit}</Text>
          </Pressable>
        );
      })}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocusedIndex(value.length)}
        keyboardType="number-pad"
        maxLength={length}
        className="absolute h-1 w-1 opacity-0"
        autoFocus
      />
    </View>
  );
}