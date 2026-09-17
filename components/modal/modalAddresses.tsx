import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';

import { useLocation } from '@/hooks/location/useLocation';
import type { MunicipalityData, ProvinceData } from '@/types/location';

interface ModalAddressesProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initialValue?: string;
  initialProvince?: string;
  initialMunicipalityId?: string | null;
  onConfirm: (data: { address: string; municipalityId: string }) => void;
  isPending?: boolean;
}

type DropdownKind = 'provinces' | 'municipalities';

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

export default function ModalAddresses({
  isOpen,
  onClose,
  mode,
  initialValue = '',
  initialProvince,
  initialMunicipalityId = null,
  onConfirm,
  isPending = false,
}: ModalAddressesProps) {
  const [value, setValue] = useState(initialValue);
  const [validationError, setValidationError] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKind | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
  const provincesRef = useRef<View>(null);
  const municipalitiesRef = useRef<View>(null);
  const {
    data: provinces,
    loading,
    selectedProvince,
    selectedMunicipality,
    selectedMunicipalityId,
    municipalities,
    handleProvinceChange,
    handleMunicipalityChange,
    setSelectedProvince,
    setSelectedProvinceId,
    setSelectedMunicipality,
    setSelectedMunicipalityId,
  } = useLocation({ useGlobalStore: false });

  // The modal receives its initial form state from its parent when it opens.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) return;

    setValue(initialValue);
    setValidationError(false);
    setOpenDropdown(null);

    if (mode === 'add') {
      setSelectedProvince('');
      setSelectedProvinceId(null);
      setSelectedMunicipality('');
      setSelectedMunicipalityId(null);
    }
  }, [
    initialValue,
    isOpen,
    mode,
    setSelectedMunicipality,
    setSelectedMunicipalityId,
    setSelectedProvince,
    setSelectedProvinceId,
  ]);

  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !initialProvince || provinces.length === 0) {
      return;
    }

    const province = provinces.find((item) => item.provincia === initialProvince);
    if (!province) return;

    setSelectedProvince(province.provincia);
    setSelectedProvinceId(province.id);

    const municipality = province.municipios.find((item) => item.id === initialMunicipalityId);
    setSelectedMunicipality(municipality?.municipio ?? '');
    setSelectedMunicipalityId(municipality?.id ?? null);
  }, [
    initialMunicipalityId,
    initialProvince,
    isOpen,
    mode,
    provinces,
    setSelectedMunicipality,
    setSelectedMunicipalityId,
    setSelectedProvince,
    setSelectedProvinceId,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openDropdownFor = (ref: React.RefObject<View | null>, kind: DropdownKind) => {
    ref.current?.measureInWindow((left, top, width, height) => {
      setDropdownPosition({ left, top: top + height + 4, width });
      setOpenDropdown(kind);
    });
  };

  const toggleProvinces = () => {
    if (openDropdown === 'provinces') {
      setOpenDropdown(null);
      return;
    }

    openDropdownFor(provincesRef, 'provinces');
  };

  const toggleMunicipalities = () => {
    if (!selectedProvince) {
      setValidationError(true);
      return;
    }

    if (openDropdown === 'municipalities') {
      setOpenDropdown(null);
      return;
    }

    openDropdownFor(municipalitiesRef, 'municipalities');
  };

  const handleSubmit = () => {
    if (!selectedMunicipalityId || !value.trim()) {
      setValidationError(true);
      return;
    }

    onConfirm({ address: value.trim(), municipalityId: selectedMunicipalityId });
  };

  const dropdownData: (ProvinceData | MunicipalityData)[] =
    openDropdown === 'provinces' ? provinces : municipalities;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}>
        <View className="w-full rounded-2xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-primary text-2xl font-bold">
              {mode === 'add' ? 'Añadir Dirección' : 'Editar Dirección'}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>

          <View className="mt-5">
            <Text className="mb-2 text-base text-gray-800">Provincia</Text>
            <Pressable
              ref={provincesRef}
              onPress={toggleProvinces}
              className="h-12 flex-row items-center justify-between rounded-2xl bg-[#F5F7FA] px-3">
              <Text
                className={
                  selectedProvince ? 'text-base text-gray-800' : 'text-base text-gray-500'
                }>
                {selectedProvince || 'Seleccione una provincia'}
              </Text>
              <ChevronDown size={18} color="#6B7280" />
            </Pressable>
            {validationError && !selectedProvince ? (
              <Text className="mt-1 ml-2 text-sm text-red-500">Este campo es requerido</Text>
            ) : null}
          </View>

          <View className="mt-4">
            <Text className="mb-2 text-base text-gray-800">Municipio</Text>
            <Pressable
              ref={municipalitiesRef}
              onPress={toggleMunicipalities}
              className="h-12 flex-row items-center justify-between rounded-2xl bg-[#F5F7FA] px-3">
              <Text
                className={
                  selectedMunicipality ? 'text-base text-gray-800' : 'text-base text-gray-500'
                }>
                {selectedMunicipality || 'Seleccione un municipio'}
              </Text>
              <ChevronDown size={18} color="#6B7280" />
            </Pressable>
            {validationError && !selectedMunicipality ? (
              <Text className="mt-1 ml-2 text-sm text-red-500">Este campo es requerido</Text>
            ) : null}
          </View>

          <View className="mt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-gray-800">
                {mode === 'add' ? 'Agregar nueva dirección' : 'Editar dirección'}
              </Text>
              <Pressable onPress={handleSubmit} disabled={isPending} hitSlop={8}>
                {isPending ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#D69F04" />
                    <Text className="ml-1 text-base font-bold text-[#D69F04]">Guardar</Text>
                  </View>
                ) : (
                  <Text className="text-base font-bold text-[#D69F04]">Guardar</Text>
                )}
              </Pressable>
            </View>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="Escriba su dirección"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="mt-2 min-h-[120px] rounded-2xl bg-[#F5F7FA] px-4 py-3 text-base text-gray-700"
            />
          </View>
        </View>
      </View>

      <Modal
        visible={openDropdown !== null}
        transparent
        animationType="none"
        onRequestClose={() => setOpenDropdown(null)}>
        <Pressable className="flex-1" onPress={() => setOpenDropdown(null)}>
          {dropdownPosition ? (
            <Pressable
              className="absolute overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                height: 240,
                elevation: 20,
              }}
              onPress={(event) => event.stopPropagation()}>
              {loading && openDropdown === 'provinces' ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="small" color="#D69F04" />
                </View>
              ) : (
                <FlatList
                  data={dropdownData}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => {
                    const isProvince = 'provincia' in item;
                    const label = isProvince ? item.provincia : item.municipio;

                    return (
                      <Pressable
                        className="border-b border-gray-100 px-4 py-3 active:bg-gray-100"
                        onPress={() => {
                          if (isProvince) {
                            handleProvinceChange(item);
                          } else {
                            handleMunicipalityChange(item);
                          }
                          setOpenDropdown(null);
                          setValidationError(false);
                        }}>
                        <Text className="text-base text-gray-700">{label}</Text>
                      </Pressable>
                    );
                  }}
                />
              )}
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </Modal>
  );
}
