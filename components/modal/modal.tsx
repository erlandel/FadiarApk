import { Modal as RNModal, Pressable, Text, View } from 'react-native';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[85%] rounded-t-3xl bg-white p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-primary">{title ?? ''}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Icon name="X" size={24} color={colors.muted} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </RNModal>
  );
}