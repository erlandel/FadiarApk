import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react-native';

import { ProfileInput } from '@/components/input/profileInput';
import useAuthStore from '@/store/authStore';
import { usePersonalData } from '@/hooks/myProfileRequests/usePersonalData';
import { useGetAddresses } from '@/hooks/addressRequests/useGetAddresses';
import { useAddAddress } from '@/hooks/addressRequests/useAddAddress';
import { useEditAddress } from '@/hooks/addressRequests/useEditAddress';
import { useDeleteAddress } from '@/hooks/addressRequests/useDeleteAddress';

import AvatarPreview from './avatarPreview';
import PhoneInput from '../phoneInput/phoneInput';
import ModalAddresses from '@/components/modal/modalAddresses';

interface Address {
  id: string;
  provincia: string;
  municipio: string;
  municipioId?: string;
  direccion: string;
}

export default function PersonalData() {
  useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialAddress, setInitialAddress] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    formData,
    errors,
    handleInputChange,
    handlePhoneChange,
    handleSavePersonalData,
    handleUpdatePassword,
    isPersonalDataPending,
    isPasswordPending,
  } = usePersonalData();

  const { addresses, isLoading: isLoadingAddresses, isError: isErrorAddresses } = useGetAddresses();

  const { addAddressMutation, isPending: isAddingAddress } = useAddAddress();

  const { editAddressMutation, isPending: isEditingAddress } = useEditAddress();

  const { deleteAddressMutation, isDeleting } = useDeleteAddress();

  const handleOpenAddModal = () => {
    setModalMode('add');
    setInitialAddress('');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (address: Address) => {
    setModalMode('edit');
    setEditingId(address.id);
    setInitialAddress(address.direccion ?? '');
    setIsModalOpen(true);
  };

  const handleDeleteAddress = (id: string) => {
    setDeletingId(id);

    deleteAddressMutation(id, {
      onSettled: () => {
        setDeletingId(null);
      },
    });
  };

  const handleModalConfirm = (data: { address: string; municipalityId: string }) => {
    if (modalMode === 'add') {
      addAddressMutation(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });

      return;
    }

    if (modalMode === 'edit' && editingId) {
      editAddressMutation(
        {
          id_direccion: editingId,
          municipio: data.municipalityId,
          direccion: data.address,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingId(null);
          },
        }
      );
    }
  };

  const editingAddress = editingId
    ? addresses?.find((address: Address) => address.id === editingId)
    : undefined;

  return (
    <View className="w-full">
      {/* ========================================================= */}
      {/* AVATAR */}
      {/* ========================================================= */}

      <View className="items-center">
        <AvatarPreview />
      </View>

      {/* ========================================================= */}
      {/* DATOS PERSONALES */}
      {/* ========================================================= */}

      <View className="mt-10">
        <View className="flex-row items-center justify-between">
          <Text className="text-primary text-xl font-bold">Datos personales</Text>

          <Pressable
            onPress={() => handleSavePersonalData()}
            disabled={isPersonalDataPending}
            hitSlop={8}>
            {isPersonalDataPending ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#D69F04" />

                <Text className="ml-1 font-bold text-[#D69F04]">Guardar</Text>
              </View>
            ) : (
              <Text className="font-bold text-[#D69F04]">Guardar</Text>
            )}
          </Pressable>
        </View>

        <View className="mt-4 gap-4">
          <ProfileInput
            label="Nombre:"
            placeholder="Nombre"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            error={errors.firstName}
          />

          <ProfileInput
            label="Apellidos:"
            placeholder="Apellidos"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            error={errors.lastName}
          />

          <View>
            <Text className="mb-2 text-gray-800">Teléfono:</Text>

            <PhoneInput
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="Teléfono"
            />

            {errors.phone ? (
              <Text className="mt-1 text-sm text-red-500">{errors.phone}</Text>
            ) : null}
          </View>

          <ProfileInput
            label="Correo Electrónico:"
            placeholder="Correo"
            value={formData.email}
            editable={false}
            onChangeText={() => undefined}
            error={errors.email}
          />
        </View>
      </View>

      {/* ========================================================= */}
      {/* DIRECCIONES */}
      {/* ========================================================= */}

      <View className="mt-10">
        <View className="flex-row items-center justify-between">
          <Text className="text-primary text-xl font-bold">Direcciones</Text>

          <Pressable onPress={handleOpenAddModal} hitSlop={8}>
            <Text className="font-bold text-[#D69F04]">Añadir</Text>
          </Pressable>
        </View>

        <Text className="mt-3 text-gray-800">Listado de direcciones:</Text>

        <View className="bg-surface mt-2 min-h-25 rounded-lg px-2 py-3">
          {isLoadingAddresses ? (
            <View className="h-20 items-center justify-center">
              <ActivityIndicator size="small" color="#D69F04" />
            </View>
          ) : isErrorAddresses ? (
            <View className="items-center justify-center py-4">
              <Text className="text-center text-sm font-bold text-gray-500">
                No hay direcciones registradas
              </Text>
            </View>
          ) : addresses && addresses.length > 0 ? (
            <View className="gap-3">
              {addresses.map((address: Address) => (
                <View key={address.id} className="rounded-md border border-gray-100 bg-white p-3">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <View className="flex-row flex-wrap">
                        <Text className="text-primary font-bold">Provincia:</Text>

                        <Text className="ml-1 flex-1 text-gray-600">{address.provincia}</Text>
                      </View>

                      <View className="mt-1 flex-row flex-wrap">
                        <Text className="text-primary font-bold">Municipio:</Text>

                        <Text className="ml-1 flex-1 text-gray-600">{address.municipio}</Text>
                      </View>
                    </View>

                    <View className="flex-row gap-3">
                      <Pressable onPress={() => handleOpenEditModal(address)} hitSlop={8}>
                        <Pencil size={21} color="#D69F04" strokeWidth={2} />
                      </Pressable>

                      <Pressable
                        onPress={() => handleDeleteAddress(address.id)}
                        disabled={deletingId === address.id || isDeleting}
                        hitSlop={8}>
                        {deletingId === address.id ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Trash2 size={21} color="#EF4444" strokeWidth={2} />
                        )}
                      </Pressable>
                    </View>
                  </View>

                  <View className="mt-2 flex-row flex-wrap">
                    <Text className="text-primary font-bold">Dirección:</Text>

                    <Text className="ml-1 flex-1 text-gray-800">{address.direccion}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-4">
              <Text className="text-center text-sm text-gray-500 italic">
                No hay direcciones registradas
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ========================================================= */}
      {/* CONTRASEÑA */}
      {/* ========================================================= */}

      <View className="mt-10">
        <View className="flex-row items-center justify-between">
          <Text className="text-primary text-xl font-bold">Contraseña</Text>

          <Pressable
            onPress={() => handleUpdatePassword()}
            disabled={isPasswordPending}
            hitSlop={8}>
            {isPasswordPending ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#D69F04" />

                <Text className="ml-1 font-bold text-[#D69F04]">Actualizar</Text>
              </View>
            ) : (
              <Text className="font-bold text-[#D69F04]">Actualizar</Text>
            )}
          </Pressable>
        </View>

        <View className="mt-4 gap-4">
          <ProfileInput
            label="Contraseña actual:"
            placeholder="Contraseña"
            value={formData.password}
            secureTextEntry={!showCurrentPassword}
            onChangeText={(value) => handleInputChange('password', value)}
            error={errors.password}
            trailingAction={
              <Pressable
                onPress={() => setShowCurrentPassword((show) => !show)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={
                  showCurrentPassword ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'
                }>
                {showCurrentPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </Pressable>
            }
          />

          <ProfileInput
            label="Nueva contraseña:"
            placeholder="Nueva contraseña"
            value={formData.confirmPassword}
            secureTextEntry={!showNewPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            error={errors.confirmPassword}
            trailingAction={
              <Pressable
                onPress={() => setShowNewPassword((show) => !show)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={
                  showNewPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'
                }>
                {showNewPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </Pressable>
            }
          />
        </View>
      </View>

      {/* ========================================================= */}
      {/* MODAL DIRECCIÓN */}
      {/* ========================================================= */}

      <ModalAddresses
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialValue={initialAddress}
        initialProvince={editingAddress?.provincia}
        initialMunicipalityId={editingAddress?.municipioId ?? null}
        onConfirm={handleModalConfirm}
        isPending={modalMode === 'add' ? isAddingAddress : isEditingAddress}
      />
    </View>
  );
}
