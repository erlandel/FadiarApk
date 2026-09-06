import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export interface Crumb {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const router = useRouter();
  return (
    <View className="flex-row flex-wrap items-center">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <View key={index} className="flex-row items-center">
            {index > 0 ? <Text className="mx-1 text-gray-400">-</Text> : null}
            {item.href && !isLast ? (
              <Pressable onPress={() => router.push(item.href as any)}>
                <Text className="text-xs text-gray-400">{item.label}</Text>
              </Pressable>
            ) : (
              <Text className="text-xs font-semibold text-primary">{item.label}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}