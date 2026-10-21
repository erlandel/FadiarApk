import { Modal as RNModal, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';
import { ToastRoot } from '@/messages/toastConfig';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View
          className="w-full shrink-0 self-end overflow-hidden rounded-t-3xl bg-white p-5"
          style={{
            maxHeight: Math.max(0, height - insets.top),
            paddingBottom: Math.max(insets.bottom, 20),
          }}>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-primary text-2xl font-bold">{title ?? ''}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Icon name="X" size={24} color={colors.muted} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
      {visible && <ToastRoot />}
    </RNModal>
  );
}
