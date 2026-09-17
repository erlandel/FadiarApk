import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { ContactMap } from '@/components/contact/contactMap';
import { CustomIcon } from '@/icons/customIcon';
import { colors } from '@/lib/theme/colors';
import { fadiarAddress, fadiarContact, fadiarSocialNetworks } from '@/data/contact';

interface ContactCardProps {
  icon: 'LocationIcon' | 'EmojioneDepartmentStore' | 'WhatsApp' | 'EmailIcon';
  title: string;
  detail: string;
  onPress?: () => void;
}

function ContactCard({ icon, title, detail, onPress }: ContactCardProps) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4"
      style={{ elevation: 2 }}>
      <View className="bg-primary rounded-lg p-3">
        <CustomIcon name={icon} size={24} color={colors.accent} />
      </View>
      <View className="flex-1">
        <Text className="text-primary text-base font-semibold">{title}</Text>
        <Text className="text-muted mt-1 text-sm leading-5">{detail}</Text>
      </View>
    </Pressable>
  );
}

export default function ContactScreen() {
  const openUrl = (url: string) => {
    void Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-4 pb-12" showsVerticalScrollIndicator={false}>
        <View className="pt-4">
          <Text className="text-primary mt-2 text-3xl font-bold">Información de Contacto</Text>
        </View>

        <View className="mt-8 gap-4">
          <ContactCard
            icon="LocationIcon"
            title="Dirección"
            detail={`${fadiarAddress.line1}\n${fadiarAddress.line2}`}
          />
          <ContactCard
            icon="EmojioneDepartmentStore"
            title="Almacén"
            detail={fadiarAddress.detail}
          />
          <ContactCard
            icon="WhatsApp"
            title="WhatsApp"
            detail={fadiarContact.phone}
            onPress={() => openUrl(`https://wa.me/${fadiarContact.whatsappDigits}`)}
          />
          <ContactCard
            icon="EmailIcon"
            title="Correo electrónico"
            detail={fadiarContact.email}
            onPress={() => openUrl(`mailto:${fadiarContact.email}`)}
          />
        </View>

        <View className="mt-10 items-center">
          <Text className="text-primary text-sm font-semibold tracking-widest uppercase">
            Síguenos en redes
          </Text>
          <View className="mt-4 flex-row gap-5">
            <Pressable
              onPress={() => openUrl(fadiarSocialNetworks.facebook)}
              className="bg-primary h-14 w-14 items-center justify-center rounded-full">
              <CustomIcon name="FacebookIcon" size={30} color={colors.accent} />
            </Pressable>
            <Pressable
              onPress={() => openUrl(fadiarSocialNetworks.instagram)}
              className="bg-primary h-14 w-14 items-center justify-center rounded-full">
              <CustomIcon name="InstagramIcon" size={30} color={colors.accent} />
            </Pressable>
          </View>
        </View>

        <View className="mt-10">
          <ContactMap />
        </View>
      </ScrollView>
    </View>
  );
}
