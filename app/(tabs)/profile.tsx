import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedScreen } from '@/components/navigation/protectedScreen';
import { Button } from '@/components/primitives/button';
import { Modal } from '@/components/modal/modal';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';
import { buildImageUrl } from '@/lib/api/config';
import { usePersonalData } from '@/hooks/profile/usePersonalData';
import {
  useAddAddress,
  useDeleteAddress,
  useEditAddress,
  useGetAddresses,
} from '@/hooks/profile/useAddresses';
import { useLocation } from '@/hooks/location/useLocation';

function Field({
  label,
  value,
  onChange,
  placeholder,
  secure = false,
  editable = true,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  editable?: boolean;
}) {
  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-gray-600">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secure}
        editable={editable}
        className="h-12 rounded-xl border border-gray-100 bg-surface px-3 text-base text-text"
      />
    </View>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { auth, savePersonal, isPending, logout } = usePersonalData();
  const { addresses, isLoading: loadingAddresses } = useGetAddresses();
  const { addAddress, isPending: adding } = useAddAddress();
  const { editAddress } = useEditAddress();
  const { deleteAddress } = useDeleteAddress();
  const { municipalities, handleMunicipalityChange, selectedMunicipality, selectedMunicipalityId } = useLocation();

  const [firstName, setFirstName] = useState(auth?.person.name ?? '');
  const [lastName, setLastName] = useState(
    `${auth?.person.lastname1 ?? ''} ${auth?.person.lastname2 ?? ''}`.trim(),
  );
  const [phone, setPhone] = useState(auth?.person.cellphone1 ?? '');
  const [password, setPassword] = useState('');

  const [addressModal, setAddressModal] = useState(false);
  const [addressText, setAddressText] = useState('');

  const save = () => {
    const parts = lastName.trim().split(/\s+/);
    const lastname1 = parts[0] || '';
    const lastname2 = parts.slice(1).join(' ') || '';
    const changes = [];
    if (firstName !== auth?.person.name) changes.push({ operation: 'UPDATE', table: 'persons', attribute: 'name', value: firstName });
    if (lastname1 !== auth?.person.lastname1) changes.push({ operation: 'UPDATE', table: 'persons', attribute: 'lastname1', value: lastname1 });
    if (lastname2 !== (auth?.person.lastname2 || '')) changes.push({ operation: 'UPDATE', table: 'persons', attribute: 'lastname2', value: lastname2 });
    if (phone !== auth?.person.cellphone1) changes.push({ operation: 'UPDATE', table: 'persons', attribute: 'cellphone1', value: phone });
    if (changes.length === 0) return;
    savePersonal({
      firstName,
      lastname1,
      lastname2,
      phone,
      currentPassword: password || auth?.user.password || '',
      changes,
    });
  };

  const confirmAddress = () => {
    if (!selectedMunicipalityId || !addressText.trim()) return;
    addAddress({ address: addressText, municipalityId: selectedMunicipalityId });
    setAddressText('');
    setAddressModal(false);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-4 py-4">
          <Text className="text-3xl font-bold text-primary">Mi Perfil</Text>
          <Text className="text-base font-semibold text-muted">
            Hola {auth?.person.name}, aquí puedes gestionar tu cuenta
          </Text>

          <View className="mt-6 flex-row items-center gap-4">
            <View className="h-20 w-20 overflow-hidden rounded-full bg-surface">
              {auth?.user.img ? (
                <Image source={{ uri: buildImageUrl(auth.user.img) }} className="h-full w-full" />
              ) : (
                <View className="h-full w-full items-center justify-center">
                  <Icon name="CircleUser" size={40} color={colors.primary} />
                </View>
              )}
            </View>
            <Text className="text-lg font-bold text-primary">{auth?.person.name}</Text>
          </View>

          <View className="mt-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-primary">Datos personales</Text>
              <Pressable onPress={save}>
                <Text className="text-base font-bold text-accent">
                  {isPending ? 'Guardando...' : 'Guardar'}
                </Text>
              </Pressable>
            </View>
            <View className="mt-3 gap-3">
              <Field label="Nombre" value={firstName} onChange={setFirstName} />
              <Field label="Apellidos" value={lastName} onChange={setLastName} />
              <Field label="Teléfono" value={phone} onChange={setPhone} />
              <Field label="Correo Electrónico" value={auth?.user.email ?? ''} editable={false} />
            </View>
          </View>

          <View className="mt-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-primary">Direcciones</Text>
              <Pressable onPress={() => setAddressModal(true)}>
                <Text className="text-base font-bold text-accent">Añadir</Text>
              </Pressable>
            </View>
            <View className="mt-3 gap-2">
              {loadingAddresses ? (
                <Text className="text-center text-muted">Cargando direcciones...</Text>
              ) : addresses.length === 0 ? (
                <Text className="text-center text-muted italic">No hay direcciones registradas</Text>
              ) : (
                addresses.map((addr) => (
                  <View key={addr.id} className="rounded-xl border border-gray-100 bg-surface p-3">
                    <View className="flex-row justify-between">
                      <View className="flex-1">
                        <Text className="text-sm text-text">
                          <Text className="font-bold text-primary">Provincia: </Text>
                          {addr.provincia}
                        </Text>
                        <Text className="text-sm text-text">
                          <Text className="font-bold text-primary">Municipio: </Text>
                          {addr.municipio}
                        </Text>
                        <Text className="text-sm text-text">
                          <Text className="font-bold text-primary">Dirección: </Text>
                          {addr.direccion}
                        </Text>
                      </View>
                      <Pressable onPress={() => deleteAddress(addr.id)} hitSlop={8}>
                        <Icon name="Trash2" size={20} color={colors.error} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          <View className="mt-8">
            <Text className="text-xl font-bold text-primary">Contraseña</Text>
            <View className="mt-3">
              <Field label="Contraseña actual" value={password} onChange={setPassword} secure />
            </View>
          </View>


        </View>
      </ScrollView>

      <Modal visible={addressModal} onClose={() => setAddressModal(false)} title="Añadir dirección">
        <Text className="mb-1 text-sm font-medium text-gray-600">Municipio</Text>
        <View className="flex-row flex-wrap gap-2">
          {municipalities.map((mun) => (
            <Pressable
              key={mun.id}
              onPress={() => handleMunicipalityChange(mun)}
              className={
                selectedMunicipality === mun.municipio
                  ? 'rounded-full border border-primary bg-primary px-3 py-1.5'
                  : 'rounded-full border border-gray-200 bg-white px-3 py-1.5'
              }
            >
              <Text className={selectedMunicipality === mun.municipio ? 'text-xs text-white' : 'text-xs text-text'}>
                {mun.municipio}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text className="mb-1 mt-4 text-sm font-medium text-gray-600">Dirección</Text>
        <TextInput
          value={addressText}
          onChangeText={setAddressText}
          placeholder="Dirección"
          placeholderTextColor="#9CA3AF"
          className="h-12 rounded-xl border border-gray-100 bg-surface px-3 text-base"
        />
        <Button title={adding ? 'Añadiendo...' : 'Añadir'} className="mt-4" onPress={confirmAddress} />
      </Modal>
    </View>
  );
}

export default function ProfileScreen() {
  return (
    <ProtectedScreen>
      <ProfileContent />
    </ProtectedScreen>
  );
}