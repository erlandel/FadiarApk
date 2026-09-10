import { Building2, Mail, MapPin } from 'lucide-react-native';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { ContactMap } from '@/components/contact/contactMap';
import { FacebookIcon, InstagramIcon, WhatsApp } from '@/icons/custom';

const email = 'atencionalcliente@grupofadiar.com';
const whatsapp = 'https://wa.me/5363513228';
const facebook = 'https://www.facebook.com/share/1DmQHQBWvG/?mibextid=wwXIfr';
const instagram = 'https://www.instagram.com/grupo_fadiar?igsh=eTE5YTduNjN4NW1v&utm_source=qr';

const infoCards = [
  {
    title: 'Dirección',
    value: 'Calle 29F entre 114 y 114A, Edificio 11413, Ciudad Libertad, Marianao, La Habana, Cuba',
    icon: MapPin,
    href: null,
  },
  {
    title: 'Almacén',
    value: '9A (ENAME)',
    icon: Building2,
    href: null,
  },
  {
    title: 'WhatsApp',
    value: '+53 63513228',
    icon: WhatsApp,
    href: whatsapp,
  },
  {
    title: 'Email',
    value: email,
    icon: Mail,
    href: `mailto:${email}`,
  },
];

const socialLinks = [
  { label: 'Facebook', href: facebook, icon: FacebookIcon },
  { label: 'Instagram', href: instagram, icon: InstagramIcon },
];

const Contact = () => {
  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-4 py-4">
  

          <Text className="mb-8 text-3xl font-bold text-primary">Información de Contacto</Text>
        </View>

        <View className="px-4 pb-8">
          <View className="flex-col gap-4">
            <View className="flex-col gap-4">
              {infoCards.slice(0, 2).map(({ title, value, icon: Icon }) => (
                <View
                  key={title}
                  className="flex-row items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }}
                >
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary">
                    <Icon width={20} height={20} color="#F5A623" />
                  </View>

                  <View className="flex-1">
                    <Text className="mb-1 font-semibold text-primary">{title}</Text>
                    <Text className="text-gray-600 leading-relaxed">{value}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View className="flex-col gap-4">
              {infoCards.slice(2).map(({ title, value, icon: Icon, href }) => (
                <Pressable
                  key={title}
                  onPress={() => href && Linking.openURL(href)}
                  className="flex-row items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }}
                >
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary">
                    <Icon width={20} height={20} color="#F5A623" />
                  </View>

                  <View className="flex-1">
                    <Text className="mb-1 font-semibold text-primary">{title}</Text>
                    <Text className="text-gray-600">{value}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View className="px-4 py-6">
          <View className="flex-row items-center gap-4">
            <View className="h-px flex-1 bg-gray-200" />
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">
              Síguenos en nuestras redes
            </Text>
            <View className="h-px flex-1 bg-gray-200" />
          </View>

          <View className="mt-6 flex-row justify-center gap-8">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <Pressable
                key={label}
                onPress={() => Linking.openURL(href)}
                className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
                style={{
                  shadowColor: '#022954',
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                }}
              >
                <Icon width={28} height={28} color="#F5A623" />
              </Pressable>
            ))}
          </View>
        </View>

        <View className="px-4 pb-8">
          <ContactMap />
        </View>
      </ScrollView>
    </View>
  );
};

export default Contact;