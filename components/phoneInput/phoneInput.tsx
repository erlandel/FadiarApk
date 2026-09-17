import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react-native';

import countriesData from '@/data/countries.json';

interface Country {
  code: string;
  name: string;
  phoneCode: string;
  validLengths: number[];
  flag: string;
}

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  defaultCountry?: {
    name: string;
    code: string;
    phoneCode: string;
  };
}

const getCountryFlag = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));

const COUNTRIES: Country[] = countriesData.map((country) => ({
  code: country.code,
  name: country.name_es,
  phoneCode: country.phoneCode,
  validLengths: country.validLengths,
  flag: getCountryFlag(country.code),
}));

const SORTED_BY_PHONE_CODE = [...COUNTRIES].sort(
  (first, second) => second.phoneCode.length - first.phoneCode.length,
);

const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const DEFAULT_COUNTRY: NonNullable<PhoneInputProps['defaultCountry']> = {
  name: 'Cuba',
  code: 'CU',
  phoneCode: '+53',
};

export default function PhoneInput({
  value = '',
  onChange,
  placeholder = 'Teléfono',
  defaultCountry: providedDefaultCountry,
}: PhoneInputProps) {
  const defaultCountry = providedDefaultCountry ?? DEFAULT_COUNTRY;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    () => COUNTRIES.find((country) => country.code === defaultCountry.code) ?? COUNTRIES[0],
  );

  const parsedValue = useMemo(() => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return { phoneNumber: '', phoneCode: '' };
    }

    const [codeWithSpace, ...numberParts] = trimmedValue.split(/\s+/);
    if (numberParts.length > 0 && /^\+\d+$/.test(codeWithSpace)) {
      return {
        phoneCode: codeWithSpace,
        phoneNumber: numberParts.join('').replace(/\D/g, ''),
      };
    }

    const matchedCountry = SORTED_BY_PHONE_CODE.find((country) =>
      trimmedValue.startsWith(country.phoneCode),
    );

    return {
      phoneCode: matchedCountry?.phoneCode ?? '',
      phoneNumber: matchedCountry
        ? trimmedValue.slice(matchedCountry.phoneCode.length).replace(/\D/g, '')
        : trimmedValue.replace(/\D/g, ''),
    };
  }, [value]);

  const currentCountry =
    !parsedValue.phoneCode || selectedCountry.phoneCode === parsedValue.phoneCode
      ? selectedCountry
      :
        COUNTRIES.find((country) => country.phoneCode === parsedValue.phoneCode && country.code === 'US') ??
        COUNTRIES.find((country) => country.phoneCode === parsedValue.phoneCode) ??
        selectedCountry;

  const filteredCountries = useMemo(() => {
    const query = normalizeText(searchQuery.trim());
    if (!query) {
      return COUNTRIES;
    }

    return COUNTRIES.filter((country) => normalizeText(country.name).includes(query));
  }, [searchQuery]);

  const handlePhoneChange = (text: string) => {
    const maximumLength = Math.max(...currentCountry.validLengths);
    const phoneNumber = text.replace(/\D/g, '').slice(0, maximumLength);
    onChange?.(`${currentCountry.phoneCode} ${phoneNumber}`);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    onChange?.(`${country.phoneCode} ${parsedValue.phoneNumber}`);
  };

  return (
    <>
      <View className="h-14 w-full flex-row items-center rounded-xl bg-surface px-4">
        <Pressable
          onPress={() => setIsOpen(true)}
          className="flex-row items-center"
          accessibilityRole="button"
          accessibilityLabel="Seleccionar país"
        >
          <Text className="text-2xl mr-1">{currentCountry.flag}</Text>

          {isOpen ? <ChevronUp size={18} color="#6B7280" /> : <ChevronDown size={18} color="#6B7280" />}

          <Text className="ml-1 text-md font-medium text-gray-700">
            {currentCountry.phoneCode}
          </Text>
        </Pressable>

        <Text className="mx-3 text-gray-500">|</Text>

        <TextInput
          value={parsedValue.phoneNumber}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          autoCorrect={false}
          className="flex-1 text-base text-gray-700"
        />
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 bg-white p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-primary">Seleccionar país</Text>

            <Pressable onPress={() => setIsOpen(false)} hitSlop={8} accessibilityLabel="Cerrar selector de país">
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>

          <View className="mb-3 flex-row items-center rounded-xl bg-surface px-3">
            <Search size={20} color="#9CA3AF" />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar país..."
              placeholderTextColor="#9CA3AF"
              autoCorrect={false}
              className="ml-2 flex-1 py-3 text-sm text-gray-700"
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            className="flex-1"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleCountrySelect(item)}
                className="flex-row items-center border-b border-gray-100 py-3 pl-2 pr-4"
              >
                <Text className="mr-3 text-2xl">{item.flag}</Text>
                <Text className="flex-1 text-base text-gray-700">{item.name}</Text>
                <Text className="text-sm text-gray-400">{item.phoneCode}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="py-8 text-center text-gray-500">No se encontraron países</Text>
            }
          />
        </View>
      </Modal>
    </>
  );
}
