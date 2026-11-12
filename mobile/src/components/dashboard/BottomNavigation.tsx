import type { ComponentProps, ReactNode } from 'react';
import { Pressable, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';

import { NutriColors } from '@/constants/nutri';
import type { NavIconName } from '@/data/dashboardMockData';
import { useAppFrame } from '@/hooks/use-app-frame';

import { NavIcon } from './icons';

type BottomNavProps = TabListProps & {
  children: ReactNode;
};

export function BottomNav({ children, style, ...rest }: BottomNavProps) {
  const { scale } = useAppFrame();
  const insets = useSafeAreaInsets();

  return (
    <View
      {...rest}
      style={[
        style,
        bar(scale),
        { marginBottom: Math.max(30 * scale, insets.bottom + 10 * scale) },
      ]}>
      <View style={items}>{children}</View>
    </View>
  );
}

type NavItemProps = TabTriggerSlotProps & {
  icon: NavIconName;
  label: string;
};

export function NavItem({ icon, label, isFocused, ...props }: NavItemProps) {
  const { scale } = useAppFrame();
  const color = isFocused ? NutriColors.purple : '#9AA3B8';

  return (
    <Pressable
      {...(props as ComponentProps<typeof Pressable>)}
      style={({ pressed }) => [item, pressed && styles.pressed]}>
      <NavIcon name={icon} size={24 * scale} color={color} active={!!isFocused} />
      <Text style={isFocused ? labelActiveStyle(scale) : labelStyle(scale)}>{label}</Text>
    </Pressable>
  );
}

function bar(scale: number): ViewStyle {
  return {
    marginHorizontal: 10 * scale,
    height: 105 * scale,
    borderRadius: 27 * scale,
    backgroundColor: 'rgba(9, 22, 44, 0.98)',
    borderWidth: 1.3,
    borderColor: 'rgba(22, 139, 255, 0.55)',
    shadowColor: NutriColors.borderBlue,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    overflow: 'hidden',
  };
}

const items: ViewStyle = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
};

const item: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
};

function labelStyle(scale: number): TextStyle {
  return {
    color: '#9AA3B8',
    fontSize: 12.5 * scale,
    fontWeight: '500',
    marginTop: 5 * scale,
  };
}

function labelActiveStyle(scale: number): TextStyle {
  return {
    color: NutriColors.purple,
    fontSize: 12.5 * scale,
    fontWeight: '700',
    marginTop: 5 * scale,
  };
}

const styles = {
  pressed: { opacity: 0.7 } as ViewStyle,
};
