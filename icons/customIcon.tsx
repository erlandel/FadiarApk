import type { ComponentType } from 'react';
import type { ColorValue } from 'react-native';
import { colors } from '@/lib/theme/colors';
import * as CustomIcons from './custom';

export type CustomIconName = keyof typeof CustomIcons;

export interface IconProps {
  name: string;
  size?: number;
  width?: number;
  height?: number;
  color?: ColorValue;
  className?: string;
  strokeWidth?: number;
}

const customMap: Record<string, ComponentType<any>> = CustomIcons;

export function CustomIcon({
  name,
  size,
  width,
  height,
  color = colors.primary,
  className,
  ...rest
}: IconProps) {
  const Cmp = customMap[name];
  if (!Cmp) return null;
  return (
    <Cmp
      width={width ?? size ?? 24}
      height={height ?? size ?? 24}
      color={color}
      className={className}
      {...rest}
    />
  );
}

export { CustomIcons };