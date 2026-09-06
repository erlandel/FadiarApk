import { createElement, type ComponentType } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  ChevronDown,
  ChevronUp,
  CircleUser,
  Funnel,
  House,
  Image,
  LogOut,
  Mail,
  MessageSquare,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  Smartphone,
  Store,
  Trash2,
  Truck,
  UserRoundPlus,
  X,
  Eye,
  EyeOff,
  Lock,
  User,
} from 'lucide-react-native';
import type { ColorValue } from 'react-native';
import { colors } from '@/lib/theme/colors';

const ICONS = {
  ArrowLeft,
  ArrowRight,
  Banknote,
  ChevronDown,
  ChevronUp,
  CircleUser,
  Eye,
  EyeOff,
  Funnel,
  House,
  Image,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  Smartphone,
  Store,
  Trash2,
  Truck,
  User,
  UserRoundPlus,
  X,
} as const;

export type LucideIconName = keyof typeof ICONS;

export interface IconProps {
  name: LucideIconName | string;
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 24, color = colors.primary, strokeWidth = 2, className }: IconProps) {
  const Cmp = ICONS[name as LucideIconName] as ComponentType<any> | undefined;
  if (!Cmp) return null;
  return createElement(Cmp, {
    size,
    color,
    strokeWidth,
    className,
  });
}
