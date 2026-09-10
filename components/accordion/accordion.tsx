'use client';

import { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { MaterialSymbolsAdd } from '@/icons/custom';

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <View className="mb-4">
      <Pressable
        onPress={onToggle}
        style={{
          backgroundColor: isOpen ? '#022954' : '#F5F7FA',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderBottomLeftRadius: isOpen ? 0 : 12,
          borderBottomRightRadius: isOpen ? 0 : 12,
        }}
        className="w-full flex-row items-center justify-between px-6 py-5"
      >
        <Text
          className="pr-4 text-xl font-semibold"
          style={{
            color: isOpen ? '#FFFFFF' : '#022954',
          }}
        >
          {question}
        </Text>

        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: isOpen ? '#FFFFFF' : '#777777',
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: isOpen ? '45deg' : '0deg' }],
          }}
        >
          <MaterialSymbolsAdd
            width={18}
            height={18}
            color={isOpen ? '#FFFFFF' : '#777777'}
          />
        </View>
      </Pressable>

      {isOpen ? (
        <View
          style={{
            backgroundColor: '#F5F7FA',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            overflow: 'hidden',
          }}
        >
          <Text
            className="px-8 py-8 "
            style={{
              color: '#4B5563',
              lineHeight: 24,
            }}
          >
            {answer}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

interface AccordionProps {
  items: { question: string; answer: string }[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View className="w-full">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </View>
  );
}