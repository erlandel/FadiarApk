import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useLocation } from '@/hooks/location/useLocation';
import { colors } from '@/lib/theme/colors';
import type { MunicipalityData, ProvinceData } from '@/types/location';

type ModalProductsByLocationProps = {
  onClose: () => void;
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

export function ModalProductsByLocation({ onClose }: ModalProductsByLocationProps) {
  const {
    provinces,
    municipalities,
    isLoading,
    selectedProvince,
    selectedMunicipality,
    selectedMunicipalityId,
    handleProvinceChange,
    handleMunicipalityChange,
  } = useLocation();

  const [openDropdown, setOpenDropdown] = useState<'provinces' | 'municipalities' | null>(null);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition | null>(null);
  const [validationError, setValidationError] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const provincesRef = useRef<View>(null);
  const municipalitiesRef = useRef<View>(null);

  const openDropdownFor = (ref: React.RefObject<View | null>, kind: 'provinces' | 'municipalities') => {
    ref.current?.measureInWindow((x, y, width, height) => {
      setDropdownPos({ top: y + height + 4, left: x, width });
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
    if (openDropdown === 'municipalities') {
      setOpenDropdown(null);
      return;
    }
    if (selectedProvince) {
      openDropdownFor(municipalitiesRef, 'municipalities');
    } else {
      setValidationError(true);
    }
  };

  const handleAccept = () => {
    setSubmitAttempted(true);
    if (!selectedProvince || !selectedMunicipality || selectedMunicipalityId === null) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    onClose();
  };

  const dropdownData: (ProvinceData | MunicipalityData)[] =
    openDropdown === 'provinces' ? provinces : municipalities;

  return (
    <View className="w-full max-w-xl rounded-lg bg-white py-6 ">
      <Text className="mb-3 px-6 text-xl font-semibold text-text-heading text-center">
        Lugar de entrega o recogida
      </Text>

      <View className="mb-4 h-px w-full bg-gray" />

      <Text className="mb-4 px-6 text-gray-500 ">
        Se mostrarán los productos según la ubicación seleccionada
      </Text>

      {isLoading ? (
        <View className="my-2 w-full items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <View className="mb-4 gap-4 px-6">
          {/* Provincia */}
          <View>
            <Text className="mb-1 font-medium text-text-heading">Provincia</Text>
            <Pressable
              ref={provincesRef}
              onPress={toggleProvinces}
              className={`h-12 flex-row items-center justify-between rounded-xl border-2 bg-surface px-3 ${
                openDropdown === 'provinces' ? 'border-accent' : 'border-gray-100'
              }`}
            >
              <Text className={selectedProvince ? 'text-gray-800' : 'text-gray-500'}>
                {selectedProvince || 'Seleccione una provincia'}
              </Text>
              <ChevronDown size={16} color={colors.muted} />
            </Pressable>

            {validationError && !selectedProvince && (
              <Text className="ml-2 mt-1 text-sm text-error">Este campo es requerido</Text>
            )}
          </View>

          {/* Municipio */}
          <View>
            <Text className="mb-1 font-medium text-text-heading">Municipio</Text>
            <Pressable
              ref={municipalitiesRef}
              onPress={toggleMunicipalities}
              className={`h-12 flex-row items-center justify-between rounded-2xl  border-2 bg-surface px-3 ${
                openDropdown === 'municipalities' ? 'border-accent ' : 'border-gray-100'
              }`}
            >
              <Text className={selectedMunicipality ? 'text-gray-800' : 'text-gray-500'}>
                {selectedMunicipality || 'Seleccione un municipio'}
              </Text>
              <ChevronDown size={16} color={colors.muted} />
            </Pressable>

            {submitAttempted && !selectedMunicipality && (
              <Text className="ml-2 mt-1 text-sm text-error">Este campo es requerido</Text>
            )}
          </View>
        </View>
      )}

      <View className="mb-4 h-px w-full bg-gray shadow-t-xl" />

      <View className="items-center px-6">
        <Pressable
          onPress={handleAccept}
          className="rounded-full bg-accent px-6 py-2 active:opacity-80"
        >
          <Text className="text-black font-bold">Aceptar</Text>
        </Pressable>
      </View>

      {/* Dropdown flotante (provincias o municipios) */}
      <Modal
        visible={openDropdown !== null}
        transparent
        animationType="none"
        onRequestClose={() => setOpenDropdown(null)}
      >
        <Pressable className="flex-1" onPress={() => setOpenDropdown(null)}>
          {dropdownPos && (
            <Pressable
              className="absolute overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
              style={{
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                height: 240,
                elevation: 20,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <FlatList
                data={dropdownData}
                keyExtractor={(item) => item.id}
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isProvince = 'provincia' in item;
                  const label = isProvince ? item.provincia : item.municipio;
                  return (
                    <Pressable
                      className="px-4 py-2 active:bg-gray-100"
                      onPress={() => {
                        if (openDropdown === 'provinces' && isProvince) {
                          handleProvinceChange(item);
                        } else if (openDropdown === 'municipalities' && !isProvince) {
                          handleMunicipalityChange(item);
                        }
                        setOpenDropdown(null);
                        setValidationError(false);
                        setSubmitAttempted(false);
                      }}
                    >
                      <Text className="text-gray-700">{label}</Text>
                    </Pressable>
                  );
                }}
              />
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

export default ModalProductsByLocation;
