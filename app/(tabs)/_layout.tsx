import { useState } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { AppHeader } from '@/components/navigation/appHeader';
import { SideDrawer } from '@/components/navigation/sideDrawer';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';

export default function TabsLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <AppHeader onMenuPress={() => setIsDrawerOpen(true)} />
      <Tabs
        screenOptions={{
          headerShown: false,
          freezeOnBlur: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => <Icon name="House" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: 'Productos',
            tabBarIcon: ({ color, size }) => <Icon name="Package" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Buscar',
            tabBarIcon: ({ color, size }) => <Icon name="Search" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Envíos',
            tabBarIcon: ({ color, size }) => <Icon name="Truck" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Contacto',
            tabBarIcon: ({ color, size }) => <Icon name="Phone" size={size} color={color} />,
          }}
        />
      </Tabs>

      <SideDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
    </View>
  );
}
